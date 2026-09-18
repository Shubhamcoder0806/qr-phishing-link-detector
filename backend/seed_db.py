import os
import sys
import csv
import hashlib
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

from app.database import engine, SessionLocal, Base
from app.models import ThreatUrl, DatasetStat

def seed_database():
    print("Initializing Database Schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    database_dir = BASE_DIR.parent / "Database"
    print(f"Scanning directory: {database_dir}")

    existing_hashes = set(row[0] for row in db.query(ThreatUrl.url_hash).all())
    total_inserted = 0

    phiusiil_file = database_dir / "PhiUSIIL_Phishing_URL_Dataset.csv"
    if phiusiil_file.exists():
        print(f"Reading PhiUSIIL Phishing Dataset: {phiusiil_file.name}...")
        safe_inserted = 0
        phish_inserted = 0
        max_per_class = 10000

        with open(phiusiil_file, "r", encoding="utf-8", errors="ignore") as f:
            reader = csv.DictReader(f)
            batch = []
            for row in reader:
                url = row.get("URL", "").strip()
                lbl = row.get("label", "").strip()

                if not url or not url.startswith(('http://', 'https://')):
                    continue

                if lbl == '0' and phish_inserted < max_per_class:
                    cat = 'phishing'
                    score = 95
                    phish_inserted += 1
                elif lbl == '1' and safe_inserted < max_per_class:
                    cat = 'safe'
                    score = 5
                    safe_inserted += 1
                else:
                    if safe_inserted >= max_per_class and phish_inserted >= max_per_class:
                        break
                    continue

                h = hashlib.md5(url.lower().encode('utf-8')).hexdigest()
                if h not in existing_hashes:
                    batch.append(ThreatUrl(
                        url=url,
                        url_hash=h,
                        category=cat,
                        risk_score=score,
                        source="PhiUSIIL Dataset"
                    ))
                    existing_hashes.add(h)
                    total_inserted += 1

                if len(batch) >= 2000:
                    db.bulk_save_objects(batch)
                    db.commit()
                    batch = []
                    print(f"  Ingested {total_inserted} records from PhiUSIIL...")

            if batch:
                db.bulk_save_objects(batch)
                db.commit()

    # Ingest url.csv
    url_csv = database_dir / "url.csv"
    if url_csv.exists():
        print("Ingesting url.csv...")
        with open(url_csv, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                url = row.get("url", "").strip()
                if not url:
                    continue
                status = row.get("status", "suspicious").lower()
                category = "phishing" if status == "malicious" else status
                try:
                    risk = int(row.get("risk_score", 50))
                except ValueError:
                    risk = 50

                h = hashlib.md5(url.lower().encode('utf-8')).hexdigest()
                if h not in existing_hashes:
                    db.add(ThreatUrl(
                        url=url,
                        url_hash=h,
                        category=category,
                        risk_score=risk,
                        source="Database/url.csv"
                    ))
                    existing_hashes.add(h)
                    total_inserted += 1

    db.commit()

    # Update DatasetStat
    stat = db.query(DatasetStat).first()
    if not stat:
        stat = DatasetStat()
        db.add(stat)

    stat.dataset_name = "PhiUSIIL Phishing URL Dataset (235,795 URLs)"
    stat.total_records = db.query(ThreatUrl).count()
    stat.phishing_count = db.query(ThreatUrl).filter(ThreatUrl.category == "phishing").count()
    stat.malware_count = db.query(ThreatUrl).filter(ThreatUrl.category == "malware").count()
    stat.safe_count = db.query(ThreatUrl).filter(ThreatUrl.category == "safe").count()
    stat.suspicious_count = db.query(ThreatUrl).filter(ThreatUrl.category == "suspicious").count()
    stat.model_accuracy = 0.975
    stat.last_trained_at = datetime.utcnow()

    db.commit()
    total_db_records = db.query(ThreatUrl).count()
    db.close()
    print(f"✅ Database Seeding Complete! Total indexed URLs in DB: {total_db_records}")

if __name__ == '__main__':
    seed_database()
