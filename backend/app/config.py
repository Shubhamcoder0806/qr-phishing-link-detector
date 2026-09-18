import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent
DATABASE_DIR = PROJECT_ROOT / "Database"
MODELS_DIR = BASE_DIR / "models"
DB_PATH = BASE_DIR / "phishcheck.db"

MODELS_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")

FEATURE_NAMES = [
    'url_length',
    'domain_length',
    'path_length',
    'subdomain_count',
    'dot_count',
    'hyphen_count',
    'at_count',
    'slash_count',
    'digit_count',
    'has_ip',
    'is_shortened',
    'suspicious_keyword_count',
    'entropy_score',
    'has_https',
    'has_port'
]

SUSPICIOUS_KEYWORDS = [
    'login', 'signin', 'verify', 'account', 'banking', 'secure', 'update',
    'support', 'confirm', 'service', 'paypal', 'apple', 'amazon', 'microsoft',
    'google', 'netflix', 'facebook', 'instagram', 'free', 'bonus', 'claim',
    'wallet', 'crypto', 'password', 'webmail', 'validation', 'alert'
]

URL_SHORTENERS = [
    'bit.ly', 'goo.gl', 'tinyurl.com', 'ow.ly', 't.co', 'is.gd',
    'buff.ly', 'adf.ly', 'bit.do', 'shorturl.at', 'rb.gy'
]
