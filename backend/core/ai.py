import json
import urllib.request
from backend.core.config import settings

def generate_ai_slug(url: str) -> str:
    if not settings.GEMINI_API_KEY:
        return ""

    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
    
    prompt = f"Generate a short, 2-3 word hyphenated slug (like 'github-react-repo' or 'news-article') that describes the content likely found at this URL: {url}. Return ONLY the hyphenated slug, nothing else, no markdown, no quotes."
    
    data = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    
    req = urllib.request.Request(api_url, data=json.dumps(data).encode("utf-8"), headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            result = json.loads(response.read().decode())
            text = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            slug = text.strip().lower().replace(" ", "-").replace('"', '').replace("'", "").strip("-")
            return slug
    except Exception:
        return ""
