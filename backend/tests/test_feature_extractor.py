import pytest
from app.feature_extractor import extract_url_features, features_to_vector, calculate_entropy
from app.ml_engine import ml_engine

def test_safe_url_features():
    feat = extract_url_features("https://google.com")
    assert feat['has_https'] == True
    assert feat['has_ip'] == False
    assert feat['is_shortened'] == False
    assert feat['dot_count'] >= 1
    assert feat['suspicious_keyword_count'] == 0

def test_phishing_url_features():
    feat = extract_url_features("http://192.168.1.1/login/paypal-verify-account.info")
    assert feat['has_ip'] == True
    assert feat['has_https'] == False
    assert feat['suspicious_keyword_count'] >= 2

def test_ml_prediction():
    res = ml_engine.predict("https://google.com")
    assert res['status'] == 'safe'
    assert res['risk_score'] < 40

    res_phish = ml_engine.predict("http://paypal-security-update.com.verify-login.xyz")
    assert res_phish['status'] in ['suspicious', 'malicious']
    assert res_phish['risk_score'] >= 40
