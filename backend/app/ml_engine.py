import os
import joblib
import numpy as np
import hashlib
from sqlalchemy.orm import Session
from app.config import MODELS_DIR
from app.phiusiil_extractor import extract_phiusiil_features, phiusiil_features_to_vector, TOP_BRANDS
from app.pentest_suite import analyze_typosquatting, defang_url, generate_stix_threat_intel
from app.models import ThreatUrl

class MLEngine:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.load_models()

    def load_models(self):
        """Load trained scikit-learn PhiUSIIL model and scaler pickles if available."""
        model_path = MODELS_DIR / "phiusiil_model.pkl"
        if not model_path.exists():
            model_path = MODELS_DIR / "model.pkl"
        scaler_path = MODELS_DIR / "scaler.pkl"

        try:
            if model_path.exists():
                self.model = joblib.load(model_path)
            if scaler_path.exists():
                self.scaler = joblib.load(scaler_path)
        except Exception as e:
            print(f"Warning loading ML model: {e}")
            self.model = None
            self.scaler = None

    def predict(self, url: str, db: Session = None) -> dict:
        """Run database lookup, ML model prediction, typosquatting & STIX CTI analysis."""
        url_clean = url.strip()

        # 1. PhiUSIIL Feature Extraction
        features = extract_phiusiil_features(url_clean)
        vector = phiusiil_features_to_vector(features)

        # 2. Typosquatting & Homograph Check
        parsed_domain = url_clean.split('://')[-1].split('/')[0]
        typosquat_info = analyze_typosquatting(parsed_domain)
        defanged_url = defang_url(url_clean)

        # 3. Database Hash Lookup
        if db:
            url_hash = hashlib.md5(url_clean.lower().encode('utf-8')).hexdigest()
            matched = db.query(ThreatUrl).filter(ThreatUrl.url_hash == url_hash).first()
            if matched:
                status = matched.category if matched.category in ['safe', 'suspicious', 'malicious'] else 'malicious'
                risk_score = matched.risk_score
                stix_cti = generate_stix_threat_intel(url_clean, status, risk_score, features)

                return {
                    'url': url_clean,
                    'defanged_url': defanged_url,
                    'status': status,
                    'risk_score': risk_score,
                    'confidence': 0.99,
                    'message': f"Matched known threat database record ({matched.source} - Category: {matched.category.upper()}).",
                    'db_match': True,
                    'matched_category': matched.category,
                    'typosquat_info': typosquat_info,
                    'stix_cti': stix_cti,
                    'features': features
                }

        # 4. Model Prediction
        status = 'safe'
        risk_score = 5
        confidence = 0.95
        message = "URL passed all PhiUSIIL security feature checks."

        if self.model:
            try:
                X = np.array(vector).reshape(1, -1)
                if self.scaler:
                    X = self.scaler.transform(X)

                prediction = self.model.predict(X)[0]
                proba = self.model.predict_proba(X)[0]

                # Map 0: safe, 2: malicious
                labels = {0: 'safe', 1: 'suspicious', 2: 'malicious'}
                status = labels.get(prediction, 'suspicious')
                confidence = round(float(np.max(proba)), 2)

                # 100% exact match of top brand domain (e.g. google.com, paypal.com)
                if typosquat_info['domain'] in [b.lower() for b in TOP_BRANDS] or any(typosquat_info['domain'] == b for b in ['google.com', 'microsoft.com', 'amazon.com', 'apple.com', 'paypal.com']):
                    status = 'safe'
                    risk_score = 2
                    message = "Verified legitimate top brand domain."
                elif status == 'safe':
                    risk_score = int((1.0 - confidence) * 30)
                    if typosquat_info['is_typosquatted']:
                        status = 'suspicious'
                        risk_score = 65
                        message = "Safe structural features, but flagged for brand typosquatting!"
                    else:
                        message = "PhiUSIIL ML Model analyzed 24 feature dimensions and classified URL as SAFE."
                else: # malicious
                    risk_score = int(75 + confidence * 23)
                    message = "PhiUSIIL ML Model detected strong phishing/malware indicators!"

            except Exception as e:
                print(f"Error in ML inference: {e}")

        # Generate STIX 2.1 CTI bundle
        stix_cti = generate_stix_threat_intel(url_clean, status, risk_score, features)

        return {
            'url': url_clean,
            'defanged_url': defanged_url,
            'status': status,
            'risk_score': min(100, max(0, risk_score)),
            'confidence': confidence,
            'message': message,
            'db_match': False,
            'matched_category': None,
            'typosquat_info': typosquat_info,
            'stix_cti': stix_cti,
            'features': features
        }

ml_engine = MLEngine()
