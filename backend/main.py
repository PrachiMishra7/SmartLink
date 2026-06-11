from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from backend.core.config import settings
from backend.api import auth, urls

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for SmartLink URL Shortener",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api", tags=["authentication"])
app.include_router(urls.router, prefix="/api/urls", tags=["urls"])

from fastapi import BackgroundTasks

# Root redirect for shortened URLs
@app.get("/{short_code}")
def root_redirect(short_code: str, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(urls.get_db)):
    return urls.redirect_to_url(short_code=short_code, request=request, background_tasks=background_tasks, db=db)

@app.get("/")
def read_root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}
