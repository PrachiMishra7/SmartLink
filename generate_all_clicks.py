import random
from datetime import datetime, timedelta, timezone
from backend.database.database import SessionLocal
from backend.database.models import URL, ClickLog

db = SessionLocal()

urls = db.query(URL).all()

devices = ['Mobile', 'Desktop', 'Tablet']
browsers = ['Chrome', 'Firefox', 'Safari', 'Edge']
countries = ['United States', 'India', 'United Kingdom', 'Canada', 'Germany']
referrers = ['Google', 'Twitter', 'Facebook', 'Direct', 'LinkedIn']

now = datetime.now(timezone.utc)

for db_url in urls:
    fake_clicks = []
    for _ in range(50):
        device = random.choice(devices)
        browser = random.choice(browsers)
        country = random.choice(countries)
        referrer = random.choice(referrers)
        
        days_ago = random.randint(0, 6)
        hours_ago = random.randint(0, 23)
        minutes_ago = random.randint(0, 59)
        ts = now - timedelta(days=days_ago, hours=hours_ago, minutes=minutes_ago)
        
        ip = f"{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}"
        
        log = ClickLog(
            url_id=db_url.id,
            country=country,
            device=device,
            browser=browser,
            timestamp=ts,
            ip_address=ip,
            referrer=referrer
        )
        fake_clicks.append(log)

    db_url.click_count += 50
    db.add_all(fake_clicks)

db.commit()
print('Generated 50 clicks for EVERY URL in postgres.')
db.close()
