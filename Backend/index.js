const express = require('express');
const fetch = require('node-fetch');
const csv = require('csv-parser');
const { Readable } = require('stream');

const app = express();
app.use(express.json());

let dataset = [];

// Load CSV from GitHub
async function loadCSV() {
  const url = 'https://raw.githubusercontent.com/Shubhamcoder0806/qr-phishing-link-detector/refs/heads/main/Database/Phishing.csv';  // Replace with your actual CSV URL
  
  const response = await fetch(url);
  const csvText = await response.text();
  
  const rows = [];
  const stream = Readable.from(csvText);

  return new Promise((resolve, reject) => {
    stream
      .pipe(csv())
      .on('data', (data) => rows.push(data))
      .on('end', () => {
        dataset = rows;
        console.log(`Loaded ${dataset.length} dataset entries.`);
        resolve();
      })
      .on('error', (err) => reject(err));
  });
}

// API endpoint for URL check
app.post('/check', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ status: 'error', message: 'URL missing' });

  const entry = dataset.find(row => row.url === url || row.url === url.replace(/\/$/, ''));

  if (entry) {
    return res.json({
      status: entry.status,
      threat_level: entry.threat_level,
      risk_score: entry.risk_score,
      ssl_valid: entry.ssl_valid === 'True' || entry.ssl_valid === true
    });
  } else {
    return res.json({
      status: 'unknown',
      threat_level: 'unknown',
      risk_score: 0,
      ssl_valid: false
    });
  }
});

// Initialize server
const port = process.env.PORT || 5000;

loadCSV().then(() => {
  app.listen(port, () => {
    console.log(`PhishCheck backend running on port ${port}`);
  });
}).catch(err => {
  console.error('Failed to load dataset:', err);
});
