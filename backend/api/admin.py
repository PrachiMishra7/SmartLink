from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.database.models import User, URL, ClickLog, ThreatLog
from backend.api.deps import get_current_user

router = APIRouter()

def get_current_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
    return current_user

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    total_users = db.query(User).count()
    total_urls = db.query(URL).count()
    total_clicks = db.query(ClickLog).count()
    blocked_threats = db.query(ThreatLog).count()
    
    return {
        "total_users": total_users,
        "total_urls": total_urls,
        "total_clicks": total_clicks,
        "blocked_threats": blocked_threats
    }

@router.get("/users")
def get_all_users(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    users = db.query(User).order_by(User.created_at.desc()).limit(100).all()
    return [{"id": u.id, "name": u.name, "email": u.email, "role": u.role, "created_at": u.created_at} for u in users]

@router.get("/threats")
def get_threats(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    threats = db.query(ThreatLog).order_by(ThreatLog.timestamp.desc()).limit(100).all()
    return threats
