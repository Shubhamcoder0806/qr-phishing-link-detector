# 🔐 PhishCheck – Advanced URL & QR Security Scanner

PhishCheck is a **real-time phishing and malware detection system** built with:
- 🖥️ **Frontend:** HTML, CSS, JavaScript  
- ⚙️ **Backend:** Node.js + Express  
- 📊 **Dataset:** Custom CSV (URLs labeled as phishing, malware, safe, suspicious)  
- 🚀 **Deployment:** Vercel  

It scans **URLs & QR codes**, checks them against a dataset, and flags them as:
✅ Safe | ⚠️ Suspicious | ❌ Malicious

---

## 📂 Project Structure
PhishCheck/
│── backend/
│ ├── server.js # Node.js + Express backend
│ ├── dataset.csv # CSV file with labeled URLs
│ ├── package.json # Backend dependencies
│
│── frontend/
│ ├── index.html # Main UI
│ ├── script.js # Frontend logic
│ ├── style.css # Styling
│
│── README.md # Project Documentation

yaml
Copy code

---

## ⚡ Features
- 🔎 **URL Analyzer** → Scans URLs and assigns risk score.  
- 📷 **QR Code Scanner** → Extracts URLs from QR codes & analyzes them.  
- 🧠 **Detection Engine** → Works on dataset rules + feature-based scoring.  
- 📊 **Risk Categories:** Safe, Suspicious, Phishing, Malware.  
- 🌐 **Deployable on Vercel** (frontend + backend).  

---

## 🛠️ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/phishcheck.git
cd phishcheck
2️⃣ Install backend dependencies
bash
Copy code
cd backend
npm install
3️⃣ Run backend locally
bash
Copy code
node server.js
Backend will run on → http://localhost:3000

4️⃣ Open frontend
Just open frontend/index.html in your browser.
Frontend will call the backend API to scan URLs.

📊 Dataset
The project uses a custom CSV dataset (phishing, malware, suspicious, safe URLs).

Located at: backend/dataset.csv

Example row:

csv
Copy code
url,type,risk_score
https://phishing-site.com,phishing,95
https://safe-example.com,safe,2
https://malware-site.com,malware,98
You can extend this dataset with your own URLs.

🚀 Deploying on Vercel
Backend (Node.js API)
Push your repo to GitHub.

Go to Vercel → New Project.

Import your repo → Select backend/ as root.

Add a vercel.json file:

json
Copy code
{
  "version": 2,
  "builds": [
    { "src": "server.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/server.js" }
  ]
}
Frontend
Host frontend/ as static site on Vercel.

Update API calls in script.js to point to deployed backend URL.

📡 API Endpoints
POST /api/check
Checks a URL against the dataset.

Request Example:

json
Copy code
{
  "url": "https://phishing-site.com"
}
Response Example:

json
Copy code
{
  "status": "malicious",
  "message": "This URL matches known phishing patterns.",
  "risk_score": 95
}
📸 Screenshots
(Add UI screenshots of your frontend here)

📜 License
MIT License © 2025 PhishCheck Team

👨‍💻 Contributors
Shubham Mishra

Kanha Mishra

Pranav Goyal

Aman Adarshi

Priyansh Bhatt
