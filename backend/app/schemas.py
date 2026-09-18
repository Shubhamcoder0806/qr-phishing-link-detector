from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any
from datetime import datetime

class URLScanRequest(BaseModel):
    url: str

class BatchScanRequest(BaseModel):
    urls: List[str]

class FeatureBreakdown(BaseModel):
    url_length: int
    domain_length: int
    path_length: int
    subdomain_count: int
    dot_count: int
    hyphen_count: int
    at_count: int
    slash_count: int
    digit_count: int
    has_ip: bool
    is_shortened: bool
    suspicious_keyword_count: int
    entropy_score: float
    has_https: bool
    has_port: bool

class URLScanResult(BaseModel):
    url: str
    status: str # safe, suspicious, malicious
    risk_score: int # 0 to 100
    confidence: float
    message: str
    db_match: Optional[bool] = False
    matched_category: Optional[str] = None
    features: FeatureBreakdown

class BatchScanResponse(BaseModel):
    total: int
    scanned: List[URLScanResult]
    malicious_count: int
    suspicious_count: int
    safe_count: int

class ScanLogResponse(BaseModel):
    id: int
    url: str
    scan_type: str
    status: str
    risk_score: float
    confidence: float
    message: str
    timestamp: datetime

    class Config:
        from_attributes = True

class DatabaseStatsResponse(BaseModel):
    dataset_name: str
    total_records: int
    phishing_count: int
    malware_count: int
    safe_count: int
    suspicious_count: int
    model_accuracy: float
    last_trained_at: datetime
