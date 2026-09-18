from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Boolean
from datetime import datetime
from app.database import Base

class ThreatUrl(Base):
    __tablename__ = "threat_urls"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True)
    url_hash = Column(String, unique=True, index=True)
    category = Column(String, index=True) # phishing, malware, safe, suspicious
    risk_score = Column(Integer, default=50)
    source = Column(String, default="Dataset")
    created_at = Column(DateTime, default=datetime.utcnow)

class ScanLog(Base):
    __tablename__ = "scan_logs"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True)
    scan_type = Column(String, default="url") # url, qr_camera, qr_image, batch
    status = Column(String, index=True) # safe, suspicious, malicious
    risk_score = Column(Float, default=0.0)
    confidence = Column(Float, default=0.0)
    message = Column(String)
    feature_breakdown = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow)

class DatasetStat(Base):
    __tablename__ = "dataset_stats"

    id = Column(Integer, primary_key=True, index=True)
    dataset_name = Column(String, default="PhishCheck Core Dataset")
    total_records = Column(Integer, default=0)
    phishing_count = Column(Integer, default=0)
    malware_count = Column(Integer, default=0)
    safe_count = Column(Integer, default=0)
    suspicious_count = Column(Integer, default=0)
    model_accuracy = Column(Float, default=0.0)
    last_trained_at = Column(DateTime, default=datetime.utcnow)
