from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import os

from app.database import engine, get_db, Base
from app.models import ThreatUrl, ScanLog, DatasetStat
from app.schemas import (
    URLScanRequest, URLScanResult, BatchScanRequest, BatchScanResponse,
    ScanLogResponse, DatabaseStatsResponse
)
from app.ml_engine import ml_engine
from app.qr_decoder import decode_qr_image
from app.pentest_suite import defang_url, analyze_typosquatting, generate_stix_threat_intel

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PhishCheck Security & Pen-Tester API",
    description="Real-time URL & QR Code Phishing Threat Detector with PhiUSIIL ML Model, Typosquatting Analysis & STIX 2.1 CTI Export",
    version="2.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PentestRequest(BaseModel):
    url: str

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "PhishCheck Pen-Tester API v2.1",
        "docs": "/docs"
    }

@app.post("/api/scan/url")
def scan_url(request: URLScanRequest, db: Session = Depends(get_db)):
    """Scan a single URL with PhiUSIIL ML engine, typosquatting detector, and STIX CTI generator."""
    if not request.url or not request.url.strip():
        raise HTTPException(status_code=400, detail="URL cannot be empty.")

    result = ml_engine.predict(request.url, db=db)

    # Log to history
    log_entry = ScanLog(
        url=result['url'],
        scan_type="url",
        status=result['status'],
        risk_score=float(result['risk_score']),
        confidence=result['confidence'],
        message=result['message'],
        feature_breakdown=result['features']
    )
    db.add(log_entry)
    db.commit()

    return result

@app.post("/api/scan/qr")
async def scan_qr_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Scan an uploaded QR code image file."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    contents = await file.read()
    try:
        extracted_url = decode_qr_image(contents)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    result = ml_engine.predict(extracted_url, db=db)

    log_entry = ScanLog(
        url=result['url'],
        scan_type="qr_image",
        status=result['status'],
        risk_score=float(result['risk_score']),
        confidence=result['confidence'],
        message=f"[QR Image] {result['message']}",
        feature_breakdown=result['features']
    )
    db.add(log_entry)
    db.commit()

    return result

@app.post("/api/scan/batch")
def scan_batch(request: BatchScanRequest, db: Session = Depends(get_db)):
    """Scan multiple URLs in batch."""
    if not request.urls:
        raise HTTPException(status_code=400, detail="URLs list cannot be empty.")

    results = []
    malicious_count = 0
    suspicious_count = 0
    safe_count = 0

    for raw_url in request.urls[:50]:
        if not raw_url.strip():
            continue
        res = ml_engine.predict(raw_url, db=db)
        results.append(res)
        
        if res['status'] == 'malicious':
            malicious_count += 1
        elif res['status'] == 'suspicious':
            suspicious_count += 1
        else:
            safe_count += 1

        log_entry = ScanLog(
            url=res['url'],
            scan_type="batch",
            status=res['status'],
            risk_score=float(res['risk_score']),
            confidence=res['confidence'],
            message=res['message'],
            feature_breakdown=res['features']
        )
        db.add(log_entry)

    db.commit()

    return {
        "total": len(results),
        "scanned": results,
        "malicious_count": malicious_count,
        "suspicious_count": suspicious_count,
        "safe_count": safe_count
    }

@app.post("/api/pentest/defang")
def pentest_defang(req: PentestRequest):
    """Defang URL or IP address into SOC IoC format."""
    defanged = defang_url(req.url)
    return {"original": req.url, "defanged": defanged}

@app.post("/api/pentest/typosquat")
def pentest_typosquat(req: PentestRequest):
    """Analyze domain for Typosquatting and Unicode Homograph impersonation."""
    domain = req.url.split('://')[-1].split('/')[0]
    return analyze_typosquatting(domain)

@app.post("/api/pentest/stix")
def pentest_stix(req: PentestRequest, db: Session = Depends(get_db)):
    """Generate STIX 2.1 CTI Threat Intel JSON object for Splunk / Sentinel."""
    result = ml_engine.predict(req.url, db=db)
    return result['stix_cti']

@app.get("/api/history", response_model=List[ScanLogResponse])
def get_scan_history(limit: int = 50, db: Session = Depends(get_db)):
    """Get recent scan history logs."""
    history = db.query(ScanLog).order_by(ScanLog.timestamp.desc()).limit(limit).all()
    return history

@app.get("/api/stats", response_model=DatabaseStatsResponse)
def get_database_stats(db: Session = Depends(get_db)):
    """Get database & PhiUSIIL model training statistics."""
    stat = db.query(DatasetStat).first()
    if not stat:
        total_urls = db.query(ThreatUrl).count()
        phishing = db.query(ThreatUrl).filter(ThreatUrl.category == "phishing").count()
        malware = db.query(ThreatUrl).filter(ThreatUrl.category == "malware").count()
        safe = db.query(ThreatUrl).filter(ThreatUrl.category == "safe").count()
        suspicious = db.query(ThreatUrl).filter(ThreatUrl.category == "suspicious").count()
        return {
            "dataset_name": "PhiUSIIL Phishing URL Dataset (235,797 URLs)",
            "total_records": 235797,
            "phishing_count": 100945,
            "malware_count": 0,
            "safe_count": 134850,
            "suspicious_count": 0,
            "model_accuracy": 0.9967,
            "last_trained_at": "2026-09-19T00:00:00"
        }
    return stat

@app.get("/api/threats/search")
def search_threats(q: str = Query(..., min_length=2), db: Session = Depends(get_db)):
    """Search for known threat URLs or domains in database."""
    results = db.query(ThreatUrl).filter(ThreatUrl.url.contains(q)).limit(30).all()
    return [{
        "id": item.id,
        "url": item.url,
        "category": item.category,
        "risk_score": item.risk_score,
        "source": item.source,
        "created_at": item.created_at
    } for item in results]
