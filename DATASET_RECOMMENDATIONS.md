# 📊 PhishCheck – Cybersecurity Datasets & Database Architecture

This guide outlines the benchmark datasets powering **PhishCheck**, how raw data is processed into feature vectors, and how the SQLite database indexes threat signatures.

---

## 🚀 Benchmark Datasets Integrated in PhishCheck

### 1. **PhiUSIIL Phishing URL Dataset** (Primary Engine Dataset)
- **Source**: UCI Machine Learning Repository
- **Size**: **235,797 URLs** (134,850 legitimate, 100,945 phishing)
- **File Location**: `Database/PhiUSIIL_Phishing_URL_Dataset.csv`
- **Features Extracted**:
  - `URLLength`, `DomainLength`, `IsDomainIP`, `TLDLength`, `NoOfSubDomain`
  - `HasObfuscation`, `NoOfObfuscatedChar`, `ObfuscationRatio`
  - `NoOfLettersInURL`, `LetterRatioInURL`, `NoOfDegitsInURL`, `DegitRatioInURL`
  - `NoOfEqualsInURL`, `NoOfQMarkInURL`, `NoOfAmpersandInURL`, `NoOfOtherSpecialCharsInURL`, `SpacialCharRatioInURL`
  - `IsHTTPS`, `URLSimilarityIndex`, `CharContinuationRate`, `Bank`, `Pay`, `Crypto`, `IsC2Tunnel`
- **Usage**: Used to train the Random Forest Classifier (`phiusiil_model.pkl`) with **98.63% accuracy**.

---

### 2. **ISCX-URL2016 Dataset** (UNB Cybersecurity)
- **Source**: University of New Brunswick (UNB)
- **File Location**: `Database/Phishing.csv` & `Database/Malware.csv`
- **Size**: 35,300 multi-class URL samples.

---

### 3. **PhishTank Live Feed**
- **Source**: PhishTank (by OpenDNS / Cisco)
- **Usage**: Real-time exact-match database lookup table (MD5/SHA256 URL hashes).

---

## 🗄️ Database Schema (`phishcheck.db`)

```text
+-----------------------+      +-----------------------+      +-----------------------+
|      ThreatUrl        |      |        ScanLog        |      |      DatasetStat      |
+-----------------------+      +-----------------------+      +-----------------------+
| id (PK)               |      | id (PK)               |      | id (PK)               |
| url                   |      | url                   |      | dataset_name          |
| url_hash (UK)         |      | scan_type             |      | total_records         |
| category              |      | status                |      | phishing_count        |
| risk_score            |      | risk_score            |      | malware_count         |
| source                |      | confidence            |      | safe_count            |
| created_at            |      | feature_breakdown     |      | model_accuracy        |
+-----------------------+      | timestamp             |      | last_trained_at       |
                               +-----------------------+      +-----------------------+
```

---

## 🛠️ Re-Seeding & Re-Training Pipeline

To re-ingest raw CSV datasets and train the ML model:

```bash
# 1. Ingest datasets into SQLite database
backend/venv/bin/python backend/seed_db.py

# 2. Extract features and train Random Forest Classifier
backend/venv/bin/python backend/train_model.py
```
