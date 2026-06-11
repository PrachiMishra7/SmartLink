import re
from urllib.parse import urlparse

class SecurityHeuristicsEngine:
    """
    A heuristic-based security engine that evaluates URLs for malicious patterns
    without relying on external API calls or heavy ML libraries.
    Generates a Threat Score from 0 to 100.
    """
    def __init__(self):
        # Common phishing and malware keywords found in URL paths
        self.suspicious_keywords = [
            'login', 'secure', 'account', 'update', 'verify', 'bank',
            'free', 'admin', 'paypal', 'wallet', 'crypto', 'bonus',
            'claim', 'password', 'auth', 'signin'
        ]
        
    def evaluate(self, url: str) -> dict:
        score = 0
        reasons = []
        
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            path = parsed.path.lower()
            
            # 1. IP Address Detection (High Risk)
            # Malicious links often use raw IPs instead of registered domains
            ip_pattern = re.compile(r'^(\d{1,3}\.){3}\d{1,3}(:\d+)?$')
            if ip_pattern.match(domain):
                score += 45
                reasons.append("Raw IP address used instead of domain")
                
            # 2. Length Anomaly (Medium Risk)
            # Extremely long URLs are used for buffer overflows or payload injection
            if len(url) > 100:
                score += 15
                reasons.append("Abnormal URL length")
            if len(url) > 200:
                score += 20
                reasons.append("Excessive URL length")
                
            # 3. Suspicious Keywords (High Risk)
            # Phishing domains often use these to trick users
            matched_keywords = [kw for kw in self.suspicious_keywords if kw in domain or kw in path]
            if matched_keywords:
                score += 25 * len(matched_keywords)
                reasons.append(f"Suspicious keywords detected: {', '.join(matched_keywords)}")
                
            # 4. Obfuscation Patterns (Medium Risk)
            # Excessive use of symbols to bypass basic filters
            if path.count('-') > 4:
                score += 15
                reasons.append("Excessive use of hyphens in path")
            if url.count('@') > 0:
                score += 30
                reasons.append("Contains '@' symbol (Credential obfuscation)")
            if '%' in path:
                score += 10
                reasons.append("URL Encoding detected")
                
            # Cap the score at 100
            score = min(score, 100)
            
        except Exception as e:
            # If parsing fails, flag it as suspicious
            score = 60
            reasons.append(f"Failed to parse URL structure: {str(e)}")
            
        return {
            "score": score,
            "is_malicious": score >= 75,
            "reasons": reasons
        }

engine = SecurityHeuristicsEngine()

def is_malicious_url(url: str) -> dict:
    """
    Returns the evaluation result from the heuristic engine.
    """
    return engine.evaluate(url)
