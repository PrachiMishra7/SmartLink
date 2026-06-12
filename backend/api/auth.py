from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from backend.database.database import get_db
from backend.database.models import User
from backend.schemas.user import UserCreate, UserResponse, Token
from backend.core.security import get_password_hash, verify_password, create_access_token
from backend.core.config import settings
from backend.api.deps import get_current_user

router = APIRouter()

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = User(
        name=user_in.name,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_user_me(current_user: User = Depends(get_current_user)):
    return current_user

import httpx
from fastapi.responses import RedirectResponse
from fastapi import Request

@router.get("/google/login")
def google_login(request: Request):
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth is not configured.")
    
    scheme = request.headers.get("x-forwarded-proto", "http")
    host = request.headers.get("host", "localhost:8000")
    redirect_uri = f"{scheme}://{host}/api/google/callback"
    
    auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={settings.GOOGLE_CLIENT_ID}&"
        f"redirect_uri={redirect_uri}&"
        "response_type=code&"
        "scope=openid%20email%20profile&"
        "access_type=offline&"
        "prompt=consent"
    )
    return RedirectResponse(auth_url)

@router.get("/google/callback")
async def google_callback(code: str, request: Request, db: Session = Depends(get_db)):
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="Google OAuth is not configured.")

    scheme = request.headers.get("x-forwarded-proto", "http")
    host = request.headers.get("host", "localhost:8000")
    redirect_uri = f"{scheme}://{host}/api/google/callback"

    async with httpx.AsyncClient() as client:
        # Exchange code for token
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": redirect_uri,
        }
        token_res = await client.post(token_url, data=token_data)
        if token_res.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to authenticate with Google")
            
        access_token = token_res.json().get("access_token")

        # Fetch user info
        userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"
        user_res = await client.get(userinfo_url, headers={"Authorization": f"Bearer {access_token}"})
        if user_res.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch user info from Google")
            
        user_info = user_res.json()
        email = user_info.get("email")
        name = user_info.get("name")
        
        if not email:
            raise HTTPException(status_code=400, detail="No email provided by Google")

        # Find or create user
        user = db.query(User).filter(User.email == email).first()
        if not user:
            # Create a user with a random unusable password since they use Google
            import secrets
            user = User(
                name=name,
                email=email,
                password_hash=get_password_hash(secrets.token_urlsafe(32)),
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Create JWT token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        jwt_token = create_access_token(
            subject=user.id, expires_delta=access_token_expires
        )
        
        # Redirect back to frontend with token
        return RedirectResponse(f"/?token={jwt_token}")
