import re
import math
from urllib.parse import urlparse
from app.config import SUSPICIOUS_KEYWORDS, URL_SHORTENERS, FEATURE_NAMES

def calculate_entropy(text: str) -> float:
    """Calculate Shannon entropy of a string to detect random obfuscated URLs."""
    if not text:
        return 0.0
    prob = [float(text.count(c)) / len(text) for c in dict.fromkeys(list(text))]
    entropy = -sum([p * math.log(p) / math.log(2.0) for p in prob])
    return round(entropy, 3)

def is_ip_address(domain: str) -> bool:
    """Check if domain is an IPv4 or IPv6 address."""
    # IPv4 regex
    ipv4_pattern = r'^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$'
    # IPv6 regex
    ipv6_pattern = r'^\[?[a-fA-F0-9:]+\]?$'
    clean_domain = domain.split(':')[0]
    return bool(re.match(ipv4_pattern, clean_domain) or re.match(ipv6_pattern, clean_domain))

def extract_url_features(raw_url: str) -> dict:
    """Extract lexical, structural, and heuristic features from a URL."""
    url = raw_url.strip()
    if not url.startswith(('http://', 'https://')):
        url = 'http://' + url

    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        path = parsed.path
        query = parsed.query
    except Exception:
        domain = ""
        path = ""
        query = ""

    # Clean domain without port
    domain_no_port = domain.split(':')[0]
    
    # Subdomain count calculation
    parts = domain_no_port.split('.')
    subdomain_count = max(0, len(parts) - 2) if len(parts) > 2 else 0

    # Suspicious keyword check (ignore exact match of trusted domain)
    lower_url = url.lower()
    whitelisted_domains = ['google.com', 'microsoft.com', 'amazon.com', 'apple.com', 'paypal.com', 'facebook.com', 'github.com', 'wikipedia.org', 'netflix.com', 'spotify.com']
    
    if any(domain_no_port.endswith(w) for w in whitelisted_domains):
        # For whitelisted domains, only check path and query string for phishing terms
        check_target = (path + '?' + query).lower()
    else:
        check_target = lower_url

    kw_count = sum(1 for kw in SUSPICIOUS_KEYWORDS if kw in check_target)

    # URL Shortener check
    is_shortened = any(shortener in domain_no_port for shortener in URL_SHORTENERS)

    # Features dictionary
    features = {
        'url_length': len(url),
        'domain_length': len(domain_no_port),
        'path_length': len(path) + len(query),
        'subdomain_count': subdomain_count,
        'dot_count': url.count('.'),
        'hyphen_count': url.count('-'),
        'at_count': url.count('@'),
        'slash_count': url.count('/'),
        'digit_count': sum(c.isdigit() for c in url),
        'has_ip': is_ip_address(domain_no_port),
        'is_shortened': is_shortened,
        'suspicious_keyword_count': kw_count,
        'entropy_score': calculate_entropy(url),
        'has_https': parsed.scheme.lower() == 'https',
        'has_port': ':' in domain
    }

    return features

def features_to_vector(features: dict) -> list:
    """Convert features dict to an ordered numerical vector for ML inference."""
    vector = []
    for name in FEATURE_NAMES:
        val = features.get(name, 0)
        if isinstance(val, bool):
            val = 1 if val else 0
        vector.append(float(val))
    return vector
