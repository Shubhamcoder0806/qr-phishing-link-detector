import os
import sys
import csv
import joblib
import numpy as np
from datetime import datetime, timezone
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

from app.database import SessionLocal
from app.models import ThreatUrl, DatasetStat
from app.config import MODELS_DIR
from app.phiusiil_extractor import extract_phiusiil_features, phiusiil_features_to_vector, PHIUSIIL_FEATURE_ORDER

def train():
    print("🤖 Starting PhishCheck PhiUSIIL 54-Feature Model Training Pipeline...")

    database_dir = BASE_DIR.parent / "Database"
    phiusiil_file = database_dir / "PhiUSIIL_Phishing_URL_Dataset.csv"

    X = []
    y = []

    if not phiusiil_file.exists():
        print(f"❌ Error: Dataset file not found at {phiusiil_file}")
        return

    print(f"Parsing raw dataset: {phiusiil_file.name}...")
    safe_count = 0
    phish_count = 0
    max_per_class = 15000  # 30,000 total samples for high-precision training

    with open(phiusiil_file, "r", encoding="utf-8", errors="ignore") as f:
        reader = csv.DictReader(f)
        for row in reader:
            url = row.get("URL", "").strip()
            lbl = row.get("label", "").strip()

            if not url or not url.startswith(('http://', 'https://')):
                continue

            if lbl == '1' and safe_count < max_per_class:
                target = 0 # Safe
                safe_count += 1
            elif lbl == '0' and phish_count < max_per_class:
                target = 2 # Malicious/Phishing
                phish_count += 1
            else:
                if safe_count >= max_per_class and phish_count >= max_per_class:
                    break
                continue

            # Compute PhiUSIIL feature vector
            feat = extract_phiusiil_features(url)
            vec = phiusiil_features_to_vector(feat)
            X.append(vec)
            y.append(target)

    X = np.array(X)
    y = np.array(y)

    print(f"✅ Loaded {X.shape[0]} total samples across {X.shape[1]} PhiUSIIL feature dimensions.")
    print(f"Class distribution -> 0 (Safe): {np.sum(y == 0)}, 2 (Malicious): {np.sum(y == 2)}")

    # Split train & test (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train Random Forest Classifier
    clf = RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1)
    clf.fit(X_train_scaled, y_train)

    # Evaluate
    y_pred = clf.predict(X_test_scaled)
    acc = accuracy_score(y_test, y_pred)

    print(f"\n✨ PhiUSIIL Model Training Successful!")
    print(f"🎯 Model Accuracy: {acc * 100:.2f}%\n")
    print(classification_report(y_test, y_pred, target_names=['Safe', 'Malicious'], zero_division=0))

    # Save pickles
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(clf, MODELS_DIR / "phiusiil_model.pkl")
    joblib.dump(clf, MODELS_DIR / "model.pkl") # compatibility alias
    joblib.dump(scaler, MODELS_DIR / "scaler.pkl")
    print(f"💾 Saved model and scaler to {MODELS_DIR}")

    # Update database stat
    db = SessionLocal()
    stat = db.query(DatasetStat).first()
    if stat:
        stat.model_accuracy = float(round(acc, 4))
        stat.last_trained_at = datetime.now(timezone.utc)
        db.commit()

    db.close()

if __name__ == '__main__':
    train()
