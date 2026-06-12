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

import os
from fastapi import BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
assets_dir = os.path.join(frontend_dist, "assets")

if os.path.isdir(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

# Root redirect for shortened URLs and static file serving
@app.get("/{short_code}")
def root_redirect(short_code: str, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(urls.get_db)):
    # If the short_code matches a static file in dist (e.g., vite.svg, favicon.ico), serve it
    if os.path.isdir(frontend_dist):
        file_path = os.path.join(frontend_dist, short_code)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
            
    return urls.redirect_to_url(short_code=short_code, request=request, background_tasks=background_tasks, db=db)

@app.get("/")
def read_root():
    if os.path.isdir(frontend_dist):
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)
            
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}
