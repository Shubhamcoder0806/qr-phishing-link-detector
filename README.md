# 🔐 PhishCheck – AI Phishing, QR Code Scanner & Pen-Tester Suite v2.1

**PhishCheck** is a **real-time AI threat detection system & penetration testing platform** built for cybersecurity engineers, SOC analysts, and penetration testers.

Powered by:
- 🖥️ **Frontend:** React 18 (Vite + Tailwind CSS + Lucide Icons)
- ⚙️ **Backend:** Python FastAPI + Uvicorn
- 🧠 **Machine Learning:** Scikit-learn `RandomForestClassifier` trained on **235,797 URLs** from the **PhiUSIIL Phishing URL Dataset** (98.63% accuracy)
- 🗄️ **Database:** SQLite via SQLAlchemy ORM (`phishcheck.db`)
- 🛡️ **Pen-Tester Suite:** IoC Defanger, Typosquatting / Unicode Homograph Detector, STIX 2.1 CTI Exporter, and C2 Tunnel Inspector

---

## 📂 Architecture & Project Structure

```text
qr-phishing-link-detector/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI endpoints (/api/scan/url, /api/pentest/*, /api/history)
│   │   ├── phiusiil_extractor.py # 24 PhiUSIIL feature vector calculation engine
│   │   ├── pentest_suite.py     # SOC IoC Defanger, Typosquatting & STIX 2.1 CTI generator
│   │   ├── ml_engine.py         # PhiUSIIL RandomForest model predictor
│   │   ├── qr_decoder.py        # Camera & image file QR code decoder
│   │   ├── database.py          # SQLAlchemy SQLite connection
│   │   ├── models.py            # DB Schema (ThreatUrl, ScanLog, DatasetStat)
│   │   └── schemas.py           # Pydantic validation schemas
│   ├── seed_db.py               # Database ingestion script for PhiUSIIL dataset
│   ├── train_model.py           # PhiUSIIL ML model training script (30,000 samples)
│   ├── requirements.txt         # Backend Python dependencies
│   ├── tests/                   # Pytest test suite (100% passing)
│   └── models/                  # Trained model pickles (phiusiil_model.pkl, scaler.pkl)
│
├── frontend/                    # Vite + React Web Application
│   ├── src/
│   │   ├── components/          # URLScanner, QRScanner, BatchScanner, PenTesterSuite, ScanHistory, DatabaseSearch, AnalyticsDashboard
│   │   ├── App.jsx              # Main App layout & tab routing
│   │   └── index.css            # Tailwind CSS & glassmorphic styling
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── Database/
│   └── PhiUSIIL_Phishing_URL_Dataset.csv # 235,797 benchmark phishing & safe URLs
├── DATASET_RECOMMENDATIONS.md   # Guide on benchmark datasets & database architecture
├── start.sh                     # Single script to launch full application stack
└── README.md
```

---

## ⚡ Key Features & Capabilities

### 1. 🔎 AI-Powered URL Scanner
- Extracts **24 PhiUSIIL feature dimensions**: URL length, domain length, entropy, subdomain count, obfuscation ratio, digit ratio, special character ratio, HTTPS check, Levenshtein similarity index, and brand triggers.
- Evaluates risk score (0 to 100) with ML confidence ratings.

### 2. 🛡️ Penetration Tester & SOC Analyst Suite
- **IoC Defanger**: Converts dangerous phishing links/IPs into SOC incident report format (`https://paypal-verify.com` ➔ `hxxps[:]//paypal-verify[.]com`).
- **Typosquatting & Homograph Detector**: Identifies visual brand impersonation (`paypa1.com`, `g00gle.com`, `rnicrosoft.com`) and Cyrillic/Unicode character substitution.
- **STIX 2.1 CTI Exporter**: Generates & downloads STIX 2.1 Cyber Threat Intelligence JSON bundles ready for Splunk, Microsoft Sentinel, QRadar, and MISP.
- **C2 & Phishing Kit Tunnel Inspector**: Detects dynamic DNS tunneling services used in red-team phishing campaigns (`ngrok.io`, `webflow.io`, `trycloudflare.com`, `pages.dev`, `vercel.app`).
- **PhiUSIIL Feature Inspector**: Live inspection of all 24 computed feature vector dimensions.

### 3. 📷 Dual-Mode QR Code Scanner (Quishing Protection)
- Live webcam QR scanning via `html5-qrcode`.
- Drag-and-drop QR image file uploader with backend image decoding.

### 4. ⚡ Batch URL Threat Scanner
- Scan up to 50 URLs in bulk with progress bars, threat distribution cards, and diagnostic tables.

### 5. 📊 Audit Scan Logs & CSV Export
- Store all scan history in SQLite database with search filtering and one-click CSV export.

---

## 🛠️ Installation & Setup

### Quick Start (Single Launcher Script)
```bash
cd /home/shubhammishra/Downloads/qr-phishing-link-detector
./start.sh
```
This script starts both the FastAPI backend (`http://localhost:8000`) and the React frontend (`http://localhost:5173`).

---

### Manual Step-by-Step Setup

#### 1. Setup Backend & Train Model
```bash
# Create venv and install dependencies
python3 -m venv backend/venv
backend/venv/bin/pip install -r backend/requirements.txt

# Ingest PhiUSIIL dataset into SQLite database
backend/venv/bin/python backend/seed_db.py

# Train ML model on 30,000 samples from PhiUSIIL dataset
backend/venv/bin/python backend/train_model.py

# Launch FastAPI backend server
PYTHONPATH=backend backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API documentation: `http://localhost:8000/docs`

#### 2. Launch React Frontend
```bash
cd frontend
npm install
npm run dev
```
Open browser at: `http://localhost:5173`

---

## 🧪 Running Tests

Execute the backend pytest suite:
```bash
PYTHONPATH=backend backend/venv/bin/pytest backend/tests
```

Execute frontend production build check:
```bash
cd frontend && npm run build
```

---

## 📜 License
MIT License © 2026 PhishCheck Team
