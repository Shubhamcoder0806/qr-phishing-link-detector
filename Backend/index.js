const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Your mock dataset
const mockDataset = [
  { url: "https://phishing-site.com", type: "phishing", risk_score: 95 },
  { url: "https://malware-site.com", type: "malware", risk_score: 98 },
  { url: "https://suspicious-site.com", type: "suspicious", risk_score: 75 },
  { url: "https://legitimate-site.com", type: "legitimate", risk_score: 5 },
  { url: "https://safe-example.com", type: "safe", risk_score: 2 },
  { url: "https://test-phish.com", type: "phishing", risk_score: 90 },
  { url: "https://bank-login.secure", type: "phishing", risk_score: 97 },
  { url: "https://paypal-verify.com", type: "phishing", risk_score: 96 },
  { url: "https://amazon-security.com", type: "phishing", risk_score: 94 },
  { url: "https://facebook-login.help", type: "phishing", risk_score: 93 },
  { url: "https://apple-update-alert.com", type: "phishing", risk_score: 92 },
  { url: "https://microsoft-support-login.net", type: "phishing", risk_score: 91 },
  { url: "https://google-verify-account.net", type: "phishing", risk_score: 95 },
  { url: "https://dropbox-login-auth.com", type: "phishing", risk_score: 94 },
  { url: "https://instagram-login-security.net", type: "phishing", risk_score: 92 },
  { url: "https://secure-payments-login.com", type: "phishing", risk_score: 90 },
  { url: "https://update-your-bank.net", type: "phishing", risk_score: 97 },
  { url: "https://phishy-login-now.com", type: "phishing", risk_score: 96 },
  { url: "https://malicious-download.net", type: "malware", risk_score: 99 },
  { url: "https://virus-dropper.com", type: "malware", risk_score: 98 },
  { url: "https://trojan-injector.net", type: "malware", risk_score: 97 },
  { url: "https://worm-replicator.com", type: "malware", risk_score: 95 },
  { url: "https://spyware-tracker.net", type: "malware", risk_score: 94 },
  { url: "https://ransomware-locker.com", type: "malware", risk_score: 99 },
  { url: "https://crypto-stealer.net", type: "malware", risk_score: 98 },
  { url: "https://suspicious-offer.com", type: "suspicious", risk_score: 70 },
  { url: "https://weird-random-site.net", type: "suspicious", risk_score: 65 },
  { url: "https://unknown-domain123.com", type: "suspicious", risk_score: 60 },
  { url: "https://legit-google.com", type: "legitimate", risk_score: 4 },
  { url: "https://example.com", type: "legitimate", risk_score: 3 },
  { url: "https://wikipedia.org", type: "legitimate", risk_score: 1 },
  { url: "https://github.com", type: "legitimate", risk_score: 2 },
  { url: "https://microsoft.com", type: "legitimate", risk_score: 2 },
  { url: "https://amazon.com", type: "legitimate", risk_score: 3 },
  { url: "https://netflix.com", type: "legitimate", risk_score: 4 },
  { url: "https://spotify.com", type: "legitimate", risk_score: 2 },
  { url: "https://safe-browsing-test.com", type: "safe", risk_score: 1 },
  { url: "https://secure-example.org", type: "safe", risk_score: 2 },
  { url: "https://trusted-site.net", type: "safe", risk_score: 3 },
];

// API Endpoint to check URL features
app.post('/api/check', (req, res) => {
  const { url_length, number_of_dots, number_of_hyphens, has_ip_address, has_https } = req.body;

  console.log('Received features:', req.body);

  // For demo: use the mockDataset and a simple match based on feature heuristics
  const found = mockDataset.find(item => req.body.url && req.body.url.includes(item.url));

  if (found) {
    return res.json({
      success: true,
      data: {
        status: found.type,
        risk_score: found.risk_score,
        message: `Matched predefined URL in dataset as ${found.type}.`
      }
    });
  }

  // Generate random prediction if not in dataset
  const randomRisk = Math.floor(Math.random() * 100);
  const status = randomRisk > 80 ? 'malicious' : randomRisk > 50 ? 'suspicious' : 'safe';

  return res.json({
    success: true,
    data: {
      status: status,
      risk_score: randomRisk,
      message: 'Generated prediction based on heuristics (mock model).'
    }
  });
});


