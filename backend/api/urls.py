from fastapi import APIRouter, Depends, HTTPException, status, Request, Form, BackgroundTasks
from fastapi.responses import RedirectResponse, HTMLResponse
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from typing import Optional
import urllib.request
import json

from backend.database.database import get_db, SessionLocal
from backend.database.models import URL, User, ClickLog, ThreatLog
from backend.schemas.url import URLCreate, URLResponse
from backend.api.deps import get_current_user, get_current_user_optional
from backend.core.utils import generate_short_code
from backend.core.security import get_password_hash, verify_password
from backend.core.ai import generate_ai_slug
from backend.core.threats import is_malicious_url

router = APIRouter()

def fetch_geo_data(log_id: int, ip_address: str):
    if not ip_address or ip_address == "127.0.0.1" or ip_address == "::1":
        return
    try:
        req = urllib.request.Request(f"http://ip-api.com/json/{ip_address}")
        with urllib.request.urlopen(req, timeout=3) as response:
            data = json.loads(response.read().decode())
            if data.get("status") == "success":
                db = SessionLocal()
                try:
                    log = db.query(ClickLog).filter(ClickLog.id == log_id).first()
                    if log:
                        log.country = data.get("country")
                        log.city = data.get("city")
                        db.commit()
                finally:
                    db.close()
    except Exception:
        pass

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

@router.get("/user/urls", response_model=list[URLResponse])
def get_user_urls(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    urls = db.query(URL).filter(URL.user_id == current_user.id).order_by(URL.created_at.desc()).all()
    return urls

@router.get("/{short_code}")
def redirect_to_url(short_code: str, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    db_url = db.query(URL).filter(
        (URL.short_code == short_code) | (URL.custom_alias == short_code)
    ).first()

    if not db_url:
        raise HTTPException(status_code=404, detail="URL not found")

    # Expiry Check
    if db_url.expiry_date:
        if db_url.expiry_date.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            return HTMLResponse(content="<h1>Link Expired</h1><p>This link has passed its expiration date.</p>", status_code=410)

    # Password Check
    if db_url.password:
        html_content = f"""
        <html>
            <head><title>Password Required</title></head>
            <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #111827; color: white;">
                <div style="background-color: #1F2937; padding: 2.5rem; border-radius: 1rem; text-align: center; border: 1px solid #374151; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
                    <svg style="width: 3rem; height: 3rem; color: #60A5FA; margin: 0 auto 1rem auto;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    <h2 style="margin-top: 0;">Password Protected Link</h2>
                    <p style="color: #9CA3AF; margin-bottom: 1.5rem;">Please enter the password to continue</p>
                    <form action="/api/urls/unlock/{short_code}" method="post">
                        <input type="password" name="password" placeholder="Enter password" style="padding: 0.75rem; border-radius: 0.5rem; border: 1px solid #4B5563; margin-bottom: 1rem; width: 100%; box-sizing: border-box; background-color: #374151; color: white;" required/>
                        <br/>
                        <button type="submit" style="background-color: #3B82F6; color: white; padding: 0.75rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer; width: 100%; font-weight: bold;">Unlock Link</button>
                    </form>
                </div>
            </body>
        </html>
        """
        return HTMLResponse(content=html_content)
    
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
    db.refresh(click_log)
    
    if click_log.ip_address:
        background_tasks.add_task(fetch_geo_data, click_log.id, click_log.ip_address)

    return RedirectResponse(url=db_url.original_url)

@router.post("/unlock/{short_code}")
def unlock_url(short_code: str, request: Request, password: str = Form(...), db: Session = Depends(get_db)):
    db_url = db.query(URL).filter(
        (URL.short_code == short_code) | (URL.custom_alias == short_code)
    ).first()
    
    if not db_url or not db_url.password:
        raise HTTPException(status_code=404, detail="URL not found")
        
    if not verify_password(password, db_url.password):
        return HTMLResponse(content=f"<h1>Incorrect Password</h1><p>The password you entered is incorrect.</p><a href='/{short_code}'>Try again</a>", status_code=401)
        
    # Log analytics
    user_agent = request.headers.get("user-agent", "")
    device = "Mobile" if "Mobi" in user_agent else "Desktop"
    click_log = ClickLog(url_id=db_url.id, ip_address=request.client.host if request.client else None, referrer=request.headers.get("referer"), device=device, browser="Unknown")
    db_url.click_count += 1
    db.add(click_log)
    db.commit()

    return RedirectResponse(url=db_url.original_url, status_code=303)

@router.get("/user/analytics")
def get_user_analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from sqlalchemy import func
    from datetime import timedelta
    
    user_urls = db.query(URL).filter(URL.user_id == current_user.id).all()
    url_ids = [u.id for u in user_urls]
    
    if not url_ids:
        return {"total_clicks": 0, "unique_visitors": 0, "devices": [], "browsers": [], "daily_clicks": [0]*7, "days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "geo": []}
        
    total_clicks = sum(u.click_count for u in user_urls)
    unique_visitors = db.query(func.count(func.distinct(ClickLog.ip_address))).filter(ClickLog.url_id.in_(url_ids)).scalar() or 0
    
    devices_q = db.query(ClickLog.device, func.count(ClickLog.id)).filter(ClickLog.url_id.in_(url_ids), ClickLog.device.isnot(None)).group_by(ClickLog.device).all()
    devices = [{"label": d[0] if d[0] else "Unknown", "count": d[1]} for d in devices_q]
    
    browsers_q = db.query(ClickLog.browser, func.count(ClickLog.id)).filter(ClickLog.url_id.in_(url_ids), ClickLog.browser.isnot(None)).group_by(ClickLog.browser).all()
    browsers = [{"label": b[0] if b[0] else "Unknown", "count": b[1]} for b in browsers_q]
    
    geo_q = db.query(ClickLog.country, func.count(ClickLog.id)).filter(ClickLog.url_id.in_(url_ids), ClickLog.country.isnot(None)).group_by(ClickLog.country).order_by(func.count(ClickLog.id).desc()).limit(3).all()
    geo = [{"label": g[0] if g[0] else "Unknown", "count": g[1]} for g in geo_q]
    
    # fetch logs for last 7 days to bucket in memory to avoid dialect issues
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=6)
    recent_logs = db.query(ClickLog.timestamp).filter(ClickLog.url_id.in_(url_ids), ClickLog.timestamp >= seven_days_ago).all()
    
    daily_dict = {}
    for log in recent_logs:
        if log.timestamp:
            date_str = log.timestamp.strftime("%Y-%m-%d")
            daily_dict[date_str] = daily_dict.get(date_str, 0) + 1
            
    daily_clicks = []
    days = []
    for i in range(6, -1, -1):
        dt = datetime.now(timezone.utc) - timedelta(days=i)
        date_str = dt.strftime("%Y-%m-%d")
        daily_clicks.append(daily_dict.get(date_str, 0))
        days.append(dt.strftime("%a"))
        
    return {
        "total_clicks": total_clicks,
        "unique_visitors": unique_visitors,
        "devices": devices,
        "browsers": browsers,
        "daily_clicks": daily_clicks,
        "days": days,
        "geo": geo
    }

from pydantic import BaseModel
class ScanRequest(BaseModel):
    url: str

@router.post("/threats/scan")
def scan_url(req: ScanRequest):
    is_malicious = is_malicious_url(req.url)
    return {"malicious": is_malicious}
