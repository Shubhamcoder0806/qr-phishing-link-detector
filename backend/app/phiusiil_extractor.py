import re
import math
from urllib.parse import urlparse, unquote

TOP_BRANDS = [
    'paypal.com', 'google.com', 'microsoft.com', 'apple.com', 'amazon.com',
    'bankofamerica.com', 'chase.com', 'wellsfargo.com', 'citi.com', 'steamcommunity.com',
    'binance.com', 'coinbase.com', 'metamask.io', 'facebook.com', 'instagram.com',
    'netflix.com', 'linkedin.com', 'twitter.com', 'dropbox.com', 'adobe.com'
]

C2_TUNNELS = [
    'ngrok.io', 'ngrok-free.app', 'trycloudflare.com', 'webflow.io', 'firebaseapp.com',
    'pages.dev', 'vercel.app', 'workers.dev', 'repl.co', 'localxpose.io', 'loca.lt'
]

BANK_KEYWORDS = ['bank', 'chase', 'wells', 'citi', 'hsbc', 'barclays', 'capitalone', 'fidelity', 'usbank', 'pnc', 'santander']
PAY_KEYWORDS = ['pay', 'paypal', 'venmo', 'stripe', 'checkout', 'paytm', 'zelle', 'invoice', 'billing', 'verify-pay']
CRYPTO_KEYWORDS = ['crypto', 'wallet', 'binance', 'metamask', 'trustwallet', 'opensea', 'coinbase', 'uniswap', 'solana', 'usdt', 'btc', 'eth']

def levenshtein_ratio(s1: str, s2: str) -> float:
    """Calculate Levenshtein Similarity ratio between 0 and 100."""
    if not s1 or not s2:
        return 0.0
    rows = len(s1) + 1
    cols = len(s2) + 1
    dist = [[0 for _ in range(cols)] for _ in range(rows)]

    for i in range(1, rows):
        dist[i][0] = i
    for j in range(1, cols):
        dist[0][j] = j

    for col in range(1, cols):
        for row in range(1, rows):
            if s1[row - 1] == s2[col - 1]:
                cost = 0
            else:
                cost = 1
            dist[row][col] = min(
                dist[row - 1][col] + 1,
                dist[row][col - 1] + 1,
                dist[row - 1][col - 1] + cost
            )

    max_len = max(len(s1), len(s2))
    distance = dist[-1][-1]
    return round((1.0 - (distance / max_len)) * 100, 2)

def calculate_char_continuation(text: str) -> float:
    """Calculate ratio of longest contiguous letter/digit sequence in text."""
    if not text:
        return 0.0
    max_seq = 0
    curr_seq = 0
    for char in text:
        if char.isalnum():
            curr_seq += 1
            max_seq = max(max_seq, curr_seq)
        else:
            curr_seq = 0
    return round(max_seq / len(text), 4)

def extract_phiusiil_features(raw_url: str) -> dict:
    """Extract all 25+ PhiUSIIL feature dimensions from a raw URL string."""
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

    domain_no_port = domain.split(':')[0]
    tld = domain_no_port.split('.')[-1] if '.' in domain_no_port else ""
    
    # Subdomain count
    parts = domain_no_port.split('.')
    no_subdomain = max(0, len(parts) - 2) if len(parts) > 2 else 0

    # Obfuscation checks (% encoding, hex, unicode)
    unquoted = unquote(url)
    has_obfuscation = 1 if unquoted != url or '%20' in url or '%u' in url or '@' in url else 0
    obfuscated_chars = sum(1 for c in url if c in ['%', '@', '~', '$', '!'])
    obfuscation_ratio = round(obfuscated_chars / max(1, len(url)), 4)

    # Character counts & ratios
    letters_cnt = sum(c.isalpha() for c in url)
    letter_ratio = round(letters_cnt / max(1, len(url)), 4)
    digits_cnt = sum(c.isdigit() for c in url)
    digit_ratio = round(digits_cnt / max(1, len(url)), 4)

    equals_cnt = url.count('=')
    qmark_cnt = url.count('?')
    amp_cnt = url.count('&')
    special_cnt = sum(1 for c in url if not c.isalnum() and c not in [':', '/', '.'])
    special_ratio = round(special_cnt / max(1, len(url)), 4)

    # IP domain check
    ipv4_pattern = r'^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$'
    is_domain_ip = 1 if re.match(ipv4_pattern, domain_no_port) else 0

    # Similarity Index against top brands
    sim_scores = [levenshtein_ratio(domain_no_port, brand) for brand in TOP_BRANDS]
    url_similarity = max(sim_scores) if sim_scores else 0.0

    # Category triggers
    lower_url = url.lower()
    is_bank = 1 if any(kw in lower_url for kw in BANK_KEYWORDS) else 0
    is_pay = 1 if any(kw in lower_url for kw in PAY_KEYWORDS) else 0
    is_crypto = 1 if any(kw in lower_url for kw in CRYPTO_KEYWORDS) else 0

    # C2 Tunneling service check
    is_c2_tunnel = 1 if any(tunnel in domain_no_port for tunnel in C2_TUNNELS) else 0

    features = {
        'URLLength': len(url),
        'DomainLength': len(domain_no_port),
        'IsDomainIP': is_domain_ip,
        'TLDLength': len(tld),
        'NoOfSubDomain': no_subdomain,
        'HasObfuscation': has_obfuscation,
        'NoOfObfuscatedChar': obfuscated_chars,
        'ObfuscationRatio': obfuscation_ratio,
        'NoOfLettersInURL': letters_cnt,
        'LetterRatioInURL': letter_ratio,
        'NoOfDegitsInURL': digits_cnt,
        'DegitRatioInURL': digit_ratio,
        'NoOfEqualsInURL': equals_cnt,
        'NoOfQMarkInURL': qmark_cnt,
        'NoOfAmpersandInURL': amp_cnt,
        'NoOfOtherSpecialCharsInURL': special_cnt,
        'SpacialCharRatioInURL': special_ratio,
        'IsHTTPS': 1 if parsed.scheme.lower() == 'https' else 0,
        'URLSimilarityIndex': url_similarity,
        'CharContinuationRate': calculate_char_continuation(url),
        'Bank': is_bank,
        'Pay': is_pay,
        'Crypto': is_crypto,
        'IsC2Tunnel': is_c2_tunnel
    }

    return features

PHIUSIIL_FEATURE_ORDER = [
    'URLLength', 'DomainLength', 'IsDomainIP', 'TLDLength', 'NoOfSubDomain',
    'HasObfuscation', 'NoOfObfuscatedChar', 'ObfuscationRatio',
    'NoOfLettersInURL', 'LetterRatioInURL', 'NoOfDegitsInURL', 'DegitRatioInURL',
    'NoOfEqualsInURL', 'NoOfQMarkInURL', 'NoOfAmpersandInURL',
    'NoOfOtherSpecialCharsInURL', 'SpacialCharRatioInURL', 'IsHTTPS',
    'URLSimilarityIndex', 'CharContinuationRate', 'Bank', 'Pay', 'Crypto', 'IsC2Tunnel'
]

def phiusiil_features_to_vector(features: dict) -> list:
    """Convert PhiUSIIL features dict to numerical vector."""
    return [float(features.get(k, 0)) for k in PHIUSIIL_FEATURE_ORDER]
