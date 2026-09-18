#!/usr/bin/env bash
echo "🚀 Starting PhishCheck - AI Phishing & QR Code Security Scanner..."

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 1. Start Python FastAPI Backend on port 8000
echo " Starting FastAPI Backend (http://localhost:8000)..."
PYTHONPATH=backend backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

# 2. Start React Vite Frontend on port 5173
echo " Starting React Frontend (http://localhost:5173)..."
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✨ PhishCheck is running!"
echo " React Frontend:  http://localhost:5173"
echo " Python FastAPI:   http://localhost:8000"
echo " OpenAPI Docs:     http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
