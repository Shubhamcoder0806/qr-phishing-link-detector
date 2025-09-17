const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const csv = require('csv-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let dataset = [];

// GitHub raw CSV file link


// Function to load dataset
async function loadDataset() {
  try {
    console.log('Fetching dataset from GitHub...');
    const response = await fetch(DATASET_URL);

    if (!response.ok) {
      console.error('Failed to fetch dataset. Status:', response.status);
      return;
    }

    dataset = []; // Reset dataset before loading

    response.body
      .pipe(csv())
      .on('data', (row) => {
        dataset.push(row);
      })
      .on('end', () => {
        console.log('✅ Dataset loaded successfully. Rows:', dataset.length);
      })
      .on('error', (err) => {
        console.error('CSV Parsing Error:', err);
      });
  } catch (err) {
    console.error('Error loading dataset:', err);
  }
}

// Call it once at startup
loadDataset();

// API to check URL
app.post('/api/check', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, error: 'URL is required' });

  console.log('🔍 Checking URL:', url);

  const entry = dataset.find(item => item.url && url.includes(item.url));

  if (entry) {
    return res.json({
      success: true,
      data: {
        status: entry.type || 'unknown',
        risk_score: entry.risk_score || 0,
        message: `Matched dataset entry: ${entry.category || 'N/A'}`
      }
    });
  }

  // Fallback: random prediction
  const randomRisk = Math.floor(Math.random() * 100);
  const status = randomRisk > 80 ? 'malicious' : randomRisk > 50 ? 'suspicious' : 'safe';

  return res.json({
    success: true,
    data: {
      status,
      risk_score: randomRisk,
      message: 'Generated prediction (not in dataset)'
    }
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
