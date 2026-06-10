import string
import random

def generate_short_code(length: int = 6) -> str:
    """Generate a random alphanumeric string for short code."""
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))
