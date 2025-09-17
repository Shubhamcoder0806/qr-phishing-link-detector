
// Track total scans
    let totalScans = 0;

    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        
        // Remove active class from all tabs and contents
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        btn.classList.add('active');
        document.getElementById(`${tabId}-tab`).classList.add('active');
      });
    });

    // URL Scanner functionality
    const urlForm = document.getElementById('url-form');
    const urlInput = document.getElementById('url-input');
    const urlResult = document.getElementById('url-result');
    const urlStatus = document.getElementById('url-status');
    const urlMessage = document.getElementById('url-message');
    const urlDetails = document.getElementById('url-details');

    urlForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const url = urlInput.value.trim();
      
      if (!url) return;

      // Show result container and loading state
      urlResult.classList.add('show');
      urlStatus.textContent = 'Scanning...';
      urlMessage.textContent = 'Analyzing URL for potential threats';
      urlDetails.style.display = 'none';
      
      // Reset result styling
      const resultIcon = urlResult.querySelector('.result-icon');
      resultIcon.className = 'fas fa-spinner fa-spin result-icon';

      try {
        // Simulate API call to backend
        const response = await simulateBackendCheck(url);
        
        let status, message, iconClass, detailsData;
        
        if (response.status === 'malicious') {
          status = 'Malicious URL Detected';
          message = response.message || 'This URL has been identified as a phishing or malware site. Do not visit!';
          iconClass = 'fas fa-exclamation-triangle result-icon result-danger';
          detailsData = {
            domainAge: response.domain_info?.domain_age || 'Unknown',
            ssl: response.ssl_info?.ssl_valid ? 'Valid Certificate' : 'Invalid Certificate',
            threatLevel: `High Risk (${response.risk_score}/100)`
          };
        } else if (response.status === 'suspicious') {
          status = 'Suspicious Activity';
          message = response.message || 'This URL shows suspicious characteristics. Exercise caution.';
          iconClass = 'fas fa-exclamation-circle result-icon result-warning';
          detailsData = {
            domainAge: response.domain_info?.domain_age || 'Unknown',
            ssl: response.ssl_info?.ssl_valid ? 'Valid Certificate' : 'Invalid Certificate',
            threatLevel: `Medium Risk (${response.risk_score}/100)`
          };
        } else if (response.status === 'safe') {
          status = 'Safe URL';
          message = response.message || 'This URL appears to be safe to visit.';
          iconClass = 'fas fa-check-circle result-icon result-safe';
          detailsData = {
            domainAge: response.domain_info?.domain_age || 'Unknown',
            ssl: response.ssl_info?.ssl_valid ? 'Valid Certificate' : 'No SSL',
            threatLevel: `Low Risk (${response.risk_score}/100)`
          };
        } else if (response.status === 'error') {
          status = 'Analysis Error';
          message = response.message || 'Unable to analyze URL. Please try again.';
          iconClass = 'fas fa-times-circle result-icon result-danger';
          detailsData = {
            domainAge: 'Unknown',
            ssl: 'Unknown',
            threatLevel: 'Cannot Determine'
          };
        } else {
          // For unknown status or mock data
          status = 'Analysis Complete';
          message = response.message || 'URL analysis finished';
          iconClass = 'fas fa-info-circle result-icon';
          detailsData = {
            domainAge: response.domain_info?.domain_age || 'Unknown',
            ssl: response.ssl_info?.ssl_valid ? 'Valid Certificate' : 'No SSL',
            threatLevel: `Risk Score: ${response.risk_score || 0}/100`
          };
        }

        // Update UI with results
        urlStatus.textContent = status;
        urlMessage.textContent = message;
        resultIcon.className = iconClass;
        
        // Show details
        document.getElementById('domain-age').textContent = detailsData.domainAge;
        document.getElementById('ssl-status').textContent = detailsData.ssl;
        document.getElementById('threat-level').textContent = detailsData.threatLevel;
        
        // Show risk factors if available
        if (response.risk_factors && response.risk_factors.length > 0) {
          const riskFactorsList = response.risk_factors.slice(0, 3).join(', ');
          urlMessage.textContent += ` Risk factors: ${riskFactorsList}`;
        }
        
        urlDetails.style.display = 'block';

        // Update total scans counter
        totalScans++;
        document.getElementById('total-scans').textContent = totalScans;

      } catch (error) {
        console.error('API Error:', error);
        urlStatus.textContent = 'Connection Error';
        urlMessage.textContent = 'Unable to connect to security server. Please try again later.';
        resultIcon.className = 'fas fa-times-circle result-icon result-danger';
      }
    });

    // Simulate backend API call
    async function simulateBackendCheck(url) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if URL is in our mock dataset
      const found = mockDataset.find(item => url.includes(item.url));
      
      if (found) {
        if (found.type === 'phishing' || found.type === 'malware') {
          return {
            status: 'malicious',
            message: `This URL matches known ${found.type} patterns.`,
            risk_score: found.risk_score,
            domain_info: { domain_age: 'Less than 1 year' },
            ssl_info: { ssl_valid: false },
            risk_factors: ['Suspicious domain', 'Recently registered', 'No valid SSL']
          };
        } else if (found.type === 'suspicious') {
          return {
            status: 'suspicious',
            message: 'This URL shows characteristics commonly associated with suspicious sites.',
            risk_score: found.risk_score,
            domain_info: { domain_age: '1-2 years' },
            ssl_info: { ssl_valid: true },
            risk_factors: ['Mixed content', 'Unknown registrar']
          };
        } else {
          return {
            status: 'safe',
            message: 'This URL appears to be safe.',
            risk_score: found.risk_score,
            domain_info: { domain_age: 'Over 2 years' },
            ssl_info: { ssl_valid: true },
            risk_factors: []
          };
        }
      }

      
      // For URLs not in our dataset, generate a random response
      const randomRisk = Math.floor(Math.random() * 100);
      
      if (randomRisk > 80) {
        return {
          status: 'malicious',
          message: 'This URL matches patterns commonly associated with phishing sites.',
          risk_score: randomRisk,
          domain_info: { domain_age: 'Less than 1 year' },
          ssl_info: { ssl_valid: false },
          risk_factors: ['Suspicious domain structure', 'Recently registered', 'No valid SSL certificate']
        };
      } else if (randomRisk > 50) {
        return {
          status: 'suspicious',
          message: 'This URL shows some suspicious characteristics.',
          risk_score: randomRisk,
          domain_info: { domain_age: '1-2 years' },
          ssl_info: { ssl_valid: true },
          risk_factors: ['Mixed reputation', 'Unknown hosting provider']
        };
      } else {
        return {
          status: 'safe',
          message: 'This URL appears to be safe to visit.',
          risk_score: randomRisk,
          domain_info: { domain_age: 'Over 2 years' },
          ssl_info: { ssl_valid: true },
          risk_factors: []
        };
      }
    }

    // QR Code Scanner functionality
    let html5QrCode = null;
    const startScanBtn = document.getElementById('start-scan');
    const stopScanBtn = document.getElementById('stop-scan');
    const qrResult = document.getElementById('qr-result');

    startScanBtn.addEventListener('click', startQrScanning);
    stopScanBtn.addEventListener('click', stopQrScanning);

    async function startQrScanning() {
      try {
        html5QrCode = new Html5Qrcode("qr-reader");
        
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          onQrScanSuccess,
          onQrScanError
        );

        startScanBtn.style.display = 'none';
        stopScanBtn.style.display = 'inline-flex';
      } catch (error) {
        console.error('Error starting QR scanner:', error);
        alert('Unable to start camera. Please check camera permissions.');
      }
    }

    async function stopQrScanning() {
      if (html5QrCode) {
        try {
          await html5QrCode.stop();
          html5QrCode = null;
        } catch (error) {
          console.error('Error stopping QR scanner:', error);
        }
      }
      
      startScanBtn.style.display = 'inline-flex';
      stopScanBtn.style.display = 'none';
    }

    async function onQrScanSuccess(decodedText, decodedResult) {
      // Show result
      qrResult.classList.add('show');
      document.getElementById('qr-status').textContent = 'QR Code Scanned';
      document.getElementById('qr-message').textContent = 'Analyzing scanned content...';
      
      const isUrl = decodedText.startsWith('http');
      document.getElementById('content-type').textContent = isUrl ? 'URL' : 'Text';
      document.getElementById('scanned-url').textContent = decodedText;
      document.getElementById('qr-details').style.display = 'block';
      
      if (isUrl) {
        // Automatically analyze the URL if it's detected
        try {
          const response = await simulateBackendCheck(decodedText);
          
          if (response.status === 'malicious') {
            document.getElementById('qr-message').textContent = '⚠️ DANGER: This QR code contains a malicious URL!';
            qrResult.querySelector('.result-icon').className = 'fas fa-exclamation-triangle result-icon result-danger';
          } else if (response.status === 'suspicious') {
            document.getElementById('qr-message').textContent = '⚠️ WARNING: This QR code contains a suspicious URL';
            qrResult.querySelector('.result-icon').className = 'fas fa-exclamation-circle result-icon result-warning';
          } else {
            document.getElementById('qr-message').textContent = '✅ Safe: This QR code contains a safe URL';
            qrResult.querySelector('.result-icon').className = 'fas fa-check-circle result-icon result-safe';
          }
        } catch (error) {
          document.getElementById('qr-message').textContent = 'URL detected - Unable to verify safety (server error)';
        }
      } else {
        document.getElementById('qr-message').textContent = 'Text content scanned successfully';
        qrResult.querySelector('.result-icon').className = 'fas fa-check-circle result-icon result-safe';
      }
      
      // Update total scans counter
      totalScans++;
      document.getElementById('total-scans').textContent = totalScans;
    }

    function onQrScanError(errorMessage) {
      // Handle scan errors silently
    }

const checkURL = async (features) => {
    try {
        const response = await fetch('http://localhost:3000/api/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(features)
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('Prediction:', result.data.status);
            console.log('Risk Score:', result.data.risk_score);
            console.log('Message:', result.data.message);
        } else {
            console.error('Error:', result.error);
        }
    } catch (error) {
        console.error('Network error:', error);
    }
};

// Example usage
checkURL({
    url_length: 45,
    number_of_dots: 2,
    number_of_hyphens: 0,
    number_of_underscores: 1,
    number_of_slashes: 3,
    number_of_digits: 4,
    number_of_parameters: 0,
    has_ip_address: false,
    has_https: true,
    has_shortening_service: false,
    has_suspicious_words: false
});

const response = await fetch('https://qr-phishing-link-detector.vercel.app/api/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(features)
});




