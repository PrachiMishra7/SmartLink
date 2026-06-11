import json
import urllib.request
import base64
from backend.core.config import settings

def is_malicious_url(url: str) -> bool:
    if not settings.VIRUSTOTAL_API_KEY:
        return False
        
    api_url = "https://www.virustotal.com/api/v3/urls"
    url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
    
    req = urllib.request.Request(f"{api_url}/{url_id}", headers={"x-apikey": settings.VIRUSTOTAL_API_KEY})
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            result = json.loads(response.read().decode())
            stats = result.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
            return stats.get("malicious", 0) > 0
    except Exception:
        return False
