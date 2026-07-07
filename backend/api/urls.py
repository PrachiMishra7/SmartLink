from fastapi import APIRouter, Depends, HTTPException, status, Request, Form, BackgroundTasks
from fastapi.responses import RedirectResponse, HTMLResponse
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from typing import Optional
import urllib.request
import json
import io
import qrcode
from fastapi.responses import StreamingResponse

from backend.database.database import get_db, SessionLocal
from backend.database.models import URL, User, ClickLog, ThreatLog
from backend.schemas.url import URLCreate, URLResponse, URLUpdate, URLBulkCreate
from backend.api.deps import get_current_user, get_current_user_optional
from backend.core.utils import generate_short_code
from backend.core.security import get_password_hash, verify_password
from backend.core.ai import generate_ai_slug
from backend.core.threats import is_malicious_url

router = APIRouter()

def _password_page_html(short_code: str, error: str | None = None) -> str:
    error_block = ""
    if error:
        error_block = f"""
        <div class="error">
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>{error}</span>
        </div>"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Password Required · SmartLink</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      background: #080e1a;
      color: #cbd5e1;
      -webkit-font-smoothing: antialiased;
    }}
    body::before {{
      content: '';
      position: fixed; inset: 0; z-index: -1;
      background:
        radial-gradient(900px 700px at 50% -20%, rgba(34,197,94,.07) 0%, transparent 65%),
        radial-gradient(600px 600px at 100% 100%, rgba(59,130,246,.04) 0%, transparent 65%);
    }}
    .card {{
      width: 100%; max-width: 420px;
      background: rgba(12,21,38,.92);
      border: 1px solid #1a2e46;
      border-radius: 1.25rem;
      padding: 2.25rem 2rem;
      box-shadow: 0 40px 100px rgba(0,0,0,.6), 0 0 0 1px rgba(34,197,94,.06);
      position: relative;
      overflow: hidden;
    }}
    .card::before {{
      content: '';
      position: absolute; top: 0; left: 0; right: 0; height: 1px;
      background: linear-gradient(90deg, transparent, rgba(34,197,94,.45), transparent);
    }}
    .logo {{
      display: flex; align-items: center; justify-content: center; gap: .5rem;
      margin-bottom: 1.75rem;
    }}
    .logo-icon {{
      width: 36px; height: 36px; border-radius: 10px;
      background: linear-gradient(135deg, #22c55e, #15803d);
      display: flex; align-items: center; justify-content: center;
      color: #080e1a; box-shadow: 0 6px 20px rgba(34,197,94,.3);
    }}
    .logo-text {{ font-size: 1.125rem; font-weight: 900; color: #fff; letter-spacing: -.02em; }}
    .lock {{
      width: 56px; height: 56px; border-radius: 16px;
      background: rgba(251,191,36,.1); border: 1px solid rgba(251,191,36,.2);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 1.25rem; color: #fbbf24;
    }}
    h1 {{
      text-align: center; color: #fff; font-size: 1.375rem;
      font-weight: 800; margin-bottom: .5rem; letter-spacing: -.02em;
    }}
    .sub {{
      text-align: center; color: #64748b; font-size: .875rem;
      line-height: 1.55; margin-bottom: 1.5rem;
    }}
    .error {{
      display: flex; align-items: center; gap: .5rem;
      padding: .75rem .875rem; border-radius: .75rem;
      background: rgba(239,68,68,.08); border: 1px solid rgba(239,68,68,.22);
      color: #fca5a5; font-size: .8125rem; margin-bottom: 1rem;
    }}
    label {{
      display: block; color: #94a3b8; font-size: .75rem;
      font-weight: 600; margin-bottom: .375rem;
    }}
    .input-wrap {{ position: relative; margin-bottom: 1.25rem; }}
    .input-wrap svg {{
      position: absolute; left: .875rem; top: 50%; transform: translateY(-50%);
      color: #3d5270; pointer-events: none;
    }}
    input[type="password"] {{
      width: 100%; padding: .75rem .875rem .75rem 2.5rem;
      background: rgba(8,14,26,.7); border: 1px solid #1a2e46;
      border-radius: .75rem; color: #fff; font-size: .875rem;
      font-family: inherit; outline: none;
      transition: border-color .2s, box-shadow .2s;
    }}
    input[type="password"]:focus {{
      border-color: rgba(34,197,94,.45);
      box-shadow: 0 0 0 3px rgba(34,197,94,.08);
    }}
    input::placeholder {{ color: #3d5270; }}
    button[type="submit"] {{
      width: 100%; padding: .875rem;
      background: #22c55e; color: #080e1a;
      border: none; border-radius: .75rem;
      font-family: inherit; font-size: .9375rem; font-weight: 800;
      cursor: pointer; transition: background .2s, transform .1s;
      box-shadow: 0 4px 20px rgba(34,197,94,.3);
    }}
    button[type="submit"]:hover {{ background: #16a34a; }}
    button[type="submit"]:active {{ transform: scale(.98); }}
    .footer {{
      margin-top: 1.25rem; text-align: center;
      font-size: .75rem; color: #4b6a8a; font-weight: 600;
    }}
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <div class="logo-icon">
        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
      </div>
      <span class="logo-text">SmartLink</span>
    </div>
    <div class="lock">
      <svg width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
    </div>
    <h1>Password Protected</h1>
    <p class="sub">This link is secured. Enter the password shared with you to continue.</p>
    {error_block}
    <form action="/api/urls/unlock/{short_code}" method="post">
      <label for="password">Password</label>
      <div class="input-wrap">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
        <input id="password" type="password" name="password" placeholder="Enter password" required autofocus/>
      </div>
      <button type="submit">Unlock Link</button>
    </form>
    <p class="footer">Secured by SmartLink</p>
  </div>
</body>
</html>"""

def fetch_geo_data(log_id: int, ip_address: str):
    if not ip_address or ip_address == "127.0.0.1" or ip_address == "::1":
        db = SessionLocal()
        try:
            log = db.query(ClickLog).filter(ClickLog.id == log_id).first()
            if log:
                log.country = "Localhost"
                db.commit()
        finally:
            db.close()
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
    threat_result = is_malicious_url(str(url_in.original_url))
    if threat_result["is_malicious"]:
        import json
        threat_log = ThreatLog(
            url=str(url_in.original_url), 
            threat_status="Blocked",
            scan_result=json.dumps({"score": threat_result["score"], "reasons": threat_result["reasons"]})
        )
        db.add(threat_log)
        db.commit()
        raise HTTPException(status_code=400, detail=f"Malicious URL detected by SmartLink Engine (Score: {threat_result['score']}). Reasons: {', '.join(threat_result['reasons'])}")

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

@router.post("/bulk", response_model=list[URLResponse], status_code=status.HTTP_201_CREATED)
def bulk_shorten_url(
    bulk_in: URLBulkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if len(bulk_in.urls) > 100:
        raise HTTPException(status_code=400, detail="Cannot shorten more than 100 URLs at once")

    results = []
    for url_in in bulk_in.urls:
        try:
            threat_result = is_malicious_url(str(url_in.original_url))
            if threat_result["is_malicious"]:
                continue 
            
            short_code = None
            if url_in.custom_alias:
                existing_alias = db.query(URL).filter(URL.custom_alias == url_in.custom_alias).first()
                if not existing_alias:
                    short_code = url_in.custom_alias
            elif url_in.use_ai:
                ai_slug = generate_ai_slug(str(url_in.original_url))
                if ai_slug and not db.query(URL).filter(URL.short_code == ai_slug).first():
                    short_code = ai_slug
            
            if not short_code:
                short_code = generate_short_code()
                while db.query(URL).filter(URL.short_code == short_code).first():
                    short_code = generate_short_code()

            db_url = URL(
                original_url=str(url_in.original_url),
                short_code=short_code,
                custom_alias=url_in.custom_alias,
                user_id=current_user.id,
                password=get_password_hash(url_in.password) if url_in.password else None,
                expiry_date=url_in.expiry_date
            )
            db.add(db_url)
            results.append(db_url)
        except Exception:
            pass
            
    db.commit()
    for r in results:
        db.refresh(r)
    return results

@router.delete("/user/urls/{url_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_url(url_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_url = db.query(URL).filter(URL.id == url_id, URL.user_id == current_user.id).first()
    if not db_url:
        raise HTTPException(status_code=404, detail="URL not found")
    
    db.delete(db_url)
    db.commit()
    return None

@router.patch("/user/urls/{url_id}", response_model=URLResponse)
def update_url(url_id: int, url_update: URLUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_url = db.query(URL).filter(URL.id == url_id, URL.user_id == current_user.id).first()
    if not db_url:
        raise HTTPException(status_code=404, detail="URL not found")
    
    if url_update.is_active is not None:
        db_url.is_active = url_update.is_active
    if url_update.notes is not None:
        db_url.notes = url_update.notes
        
    db.commit()
    db.refresh(db_url)
    return db_url

@router.get("/user/urls", response_model=list[URLResponse])
def get_user_urls(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    urls = db.query(URL).filter(URL.user_id == current_user.id).order_by(URL.created_at.desc()).all()
    return urls

@router.get("/user/urls/{url_id}/analytics")
def get_url_analytics(url_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from collections import Counter
    db_url = db.query(URL).filter(URL.id == url_id, URL.user_id == current_user.id).first()
    if not db_url:
        raise HTTPException(status_code=404, detail="URL not found")

    clicks = db.query(ClickLog).filter(ClickLog.url_id == url_id).all()
    
    devices = Counter([c.device or "Unknown" for c in clicks])
    browsers = Counter([c.browser or "Unknown" for c in clicks])
    countries = Counter([c.country or "Unknown" for c in clicks])
    
    daily_trend = {}
    for c in clicks:
        if c.timestamp:
            day = c.timestamp.strftime("%Y-%m-%d")
            daily_trend[day] = daily_trend.get(day, 0) + 1
            
    trend_list = [{"date": k, "clicks": v} for k, v in sorted(daily_trend.items())]
    
    return {
        "total_clicks": len(clicks),
        "devices": [{"name": k, "value": v} for k, v in devices.items()],
        "browsers": [{"name": k, "value": v} for k, v in browsers.items()],
        "countries": [{"name": k, "value": v} for k, v in countries.items()],
        "daily_trend": trend_list
    }
@router.get("/qr")
def generate_qr(data: str):
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")

@router.get("/{short_code}")
def redirect_to_url(short_code: str, request: Request, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    db_url = db.query(URL).filter(
        (URL.short_code == short_code) | (URL.custom_alias == short_code)
    ).first()

    if not db_url or not db_url.is_active:
        raise HTTPException(status_code=404, detail="URL not found or inactive")

    # Expiry Check
    if db_url.expiry_date:
        if db_url.expiry_date.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            return HTMLResponse(content="<h1>Link Expired</h1><p>This link has passed its expiration date.</p>", status_code=410)

    # Password Check
    if db_url.password:
        return HTMLResponse(content=_password_page_html(short_code))
    
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
        return HTMLResponse(content=_password_page_html(short_code, "Incorrect password. Please try again."), status_code=401)
        
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
        return {"total_clicks": 0, "total_links": 0, "unique_visitors": 0, "devices": [], "browsers": [], "daily_clicks": [0]*7, "days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], "geo": [], "referrers": []}
        
    total_clicks = sum(u.click_count for u in user_urls)
    unique_visitors = db.query(func.count(func.distinct(ClickLog.ip_address))).filter(ClickLog.url_id.in_(url_ids)).scalar() or 0
    
    devices_q = db.query(ClickLog.device, func.count(ClickLog.id)).filter(ClickLog.url_id.in_(url_ids), ClickLog.device.isnot(None)).group_by(ClickLog.device).all()
    devices = [{"name": d[0] if d[0] else "Unknown", "count": d[1]} for d in devices_q]
    
    browsers_q = db.query(ClickLog.browser, func.count(ClickLog.id)).filter(ClickLog.url_id.in_(url_ids), ClickLog.browser.isnot(None)).group_by(ClickLog.browser).all()
    browsers = [{"name": b[0] if b[0] else "Unknown", "count": b[1]} for b in browsers_q]
    
    geo_q = db.query(ClickLog.country, func.count(ClickLog.id)).filter(ClickLog.url_id.in_(url_ids), ClickLog.country.isnot(None)).group_by(ClickLog.country).order_by(func.count(ClickLog.id).desc()).limit(3).all()
    geo = [{"name": g[0] if g[0] else "Unknown", "count": g[1]} for g in geo_q]
    
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
        
    # Referrers
    referrers_q = db.query(ClickLog.referrer, func.count(ClickLog.id)).filter(ClickLog.url_id.in_(url_ids), ClickLog.referrer.isnot(None)).group_by(ClickLog.referrer).all()
    referrers = [{"name": r[0] if r[0] else "Direct", "count": r[1]} for r in referrers_q]
    if not referrers and total_clicks > 0:
        referrers = [{"name": "Direct", "count": total_clicks}]

    return {
        "total_clicks": total_clicks,
        "total_links": len(user_urls),
        "unique_visitors": unique_visitors,
        "devices": devices,
        "browsers": browsers,
        "daily_clicks": daily_clicks,
        "days": days,
        "geo": geo,
        "referrers": referrers
    }

from pydantic import BaseModel
class ScanRequest(BaseModel):
    url: str

@router.post("/threats/scan")
def scan_url(req: ScanRequest):
    return is_malicious_url(req.url)

@router.get("/platform/stats")
def get_platform_stats(db: Session = Depends(get_db)):
    from sqlalchemy import func
    links = db.query(URL).count()
    users = db.query(User).count()
    clicks = db.query(ClickLog).count()
    unique_visitors = db.query(func.count(func.distinct(ClickLog.ip_address))).scalar() or 0
    mobile_clicks = db.query(ClickLog).filter(ClickLog.device == 'Mobile').count()
    mobile_traffic = (mobile_clicks / clicks * 100) if clicks > 0 else 0
    return {
        "links_shortened": links, 
        "active_users": users, 
        "clicks_tracked": clicks,
        "unique_visitors": unique_visitors,
        "mobile_traffic": round(mobile_traffic)
    }

@router.get("/platform/threats")
def get_platform_threats(db: Session = Depends(get_db)):
    logs = db.query(ThreatLog).order_by(ThreatLog.timestamp.desc()).limit(50).all()
    res = []
    import json
    for l in logs:
        try:
            scan = json.loads(l.scan_result) if l.scan_result else {}
        except:
            scan = {}
        res.append({
            "id": l.id,
            "url": l.url,
            "status": l.threat_status,
            "score": scan.get("score", 100),
            "reasons": scan.get("reasons", []),
            "timestamp": l.timestamp
        })
    return res
