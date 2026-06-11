from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import Optional

from backend.database.database import get_db
from backend.database.models import URL, User, ClickLog
from backend.schemas.url import URLCreate, URLResponse
from backend.api.deps import get_current_user, get_current_user_optional
from backend.core.utils import generate_short_code
from backend.core.security import get_password_hash
from backend.core.ai import generate_ai_slug
from backend.core.threats import is_malicious_url

router = APIRouter()

@router.post("/shorten", response_model=URLResponse, status_code=status.HTTP_201_CREATED)
def shorten_url(
    url_in: URLCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    # Threat Detection Check
    if is_malicious_url(str(url_in.original_url)):
        threat_log = ThreatLog(url_attempted=str(url_in.original_url), user_id=current_user.id if current_user else None)
        db.add(threat_log)
        db.commit()
        raise HTTPException(status_code=400, detail="Malicious URL detected. Request blocked by VirusTotal.")

    # Check custom alias uniqueness
    if url_in.custom_alias:
        existing_alias = db.query(URL).filter(URL.custom_alias == url_in.custom_alias).first()
        if existing_alias:
            raise HTTPException(status_code=400, detail="Custom alias already in use")
        short_code = url_in.custom_alias
    elif url_in.use_ai:
        ai_slug = generate_ai_slug(str(url_in.original_url))
        if ai_slug and not db.query(URL).filter(URL.short_code == ai_slug).first():
            short_code = ai_slug
        else:
            # Fallback to random if AI fails or slug is taken
            short_code = generate_short_code()
            while db.query(URL).filter(URL.short_code == short_code).first():
                short_code = generate_short_code()
    else:
        # Generate random short code
        short_code = generate_short_code()
        while db.query(URL).filter(URL.short_code == short_code).first():
            short_code = generate_short_code()

    db_url = URL(
        original_url=str(url_in.original_url),
        short_code=short_code,
        custom_alias=url_in.custom_alias,
        user_id=current_user.id if current_user else None,
        password=get_password_hash(url_in.password) if url_in.password else None,
        expiry_date=url_in.expiry_date
    )
    db.add(db_url)
    db.commit()
    db.refresh(db_url)
    return db_url

@router.get("/{short_code}")
def redirect_to_url(short_code: str, request: Request, db: Session = Depends(get_db)):
    db_url = db.query(URL).filter(
        (URL.short_code == short_code) | (URL.custom_alias == short_code)
    ).first()

    if not db_url:
        raise HTTPException(status_code=404, detail="URL not found")

    # TODO: Implement Expiry check
    # TODO: Implement Password check
    
    # Implement Analytics tracking
    user_agent = request.headers.get("user-agent", "")
    device = "Mobile" if "Mobi" in user_agent else "Desktop"
    
    browser = "Unknown"
    if "Edge" in user_agent or "Edg" in user_agent: browser = "Edge"
    elif "Chrome" in user_agent: browser = "Chrome"
    elif "Firefox" in user_agent: browser = "Firefox"
    elif "Safari" in user_agent and "Chrome" not in user_agent: browser = "Safari"

    click_log = ClickLog(
        url_id=db_url.id,
        ip_address=request.client.host if request.client else None,
        referrer=request.headers.get("referer"),
        device=device,
        browser=browser
    )
    
    db_url.click_count += 1
    db.add(click_log)
    db.commit()

    return RedirectResponse(url=db_url.original_url)

@router.get("/user/urls", response_model=list[URLResponse])
def get_user_urls(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    urls = db.query(URL).filter(URL.user_id == current_user.id).all()
    return urls
