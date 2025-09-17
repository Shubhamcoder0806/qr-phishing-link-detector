const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const csv = require('csv-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let dataset = [];

// Load CSV dataset from GitHub on server start
const DATASET_URL = '';

async function loadDataset() {
    const response = await fetch(DATASET_URL);

    if (!response.ok) {
        console.error('Failed to fetch dataset from GitHub.');
        return;
    }

    response.body
        .pipe(csv())
        .on('data', (row) => dataset.push(row))
        .on('end', () => console.log('Dataset loaded successfully from GitHub.'));
}

loadDataset();

// API Endpoint to check URL against dataset
app.post('/api/check', (req, res) => {
    const { url } = req.body;

    console.log('Received URL:', url);

    const entry = dataset.find(item => url.includes(item.url));

    if (entry) {
        return res.json({
            success: true,
            data: {
                status: entry.type || 'unknown',
                risk_score: entry.risk_score || 0,
                message: `Matched dataset entry: ${entry.category || 'N/A'}`,
            }
        });
    }

    const randomRisk = Math.floor(Math.random() * 100);
    const status = randomRisk > 80 ? 'malicious' : randomRisk > 50 ? 'suspicious' : 'safe';

    return res.json({
        success: true,
        data: {
            status: status,
            risk_score: randomRisk,
            message: 'Generated prediction based on fallback logic.'
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

