document.addEventListener("DOMContentLoaded", function () {
      function onScanSuccess(decodedText) {
        document.getElementById("qr-result").innerText = `Scanned: ${decodedText}`;
      }
      if (document.getElementById("qr-reader")) {
        let html5QrcodeScanner = new Html5QrcodeScanner(
          "qr-reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );
        html5QrcodeScanner.render(onScanSuccess);
      }
    });

    
const form = document.getElementById("url-search");
const input = document.getElementById("url-input");
const resultDiv = document.getElementById("url-result");

form.addEventListener("submit", function(e){
    e.preventDefault(); // stops page from reloading
    const url = input.value.trim();
    if(!url) return alert("Please enter a URL");

    resultDiv.innerHTML = "🔍 Checking URL...";
    resultDiv.style.color = "#fff";

    fetch("http://localhost:5000/check", {  // make sure backend is running
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url })
    })
    .then(res => res.json())
    .then(data => {
        if(data.status === "safe") {
            resultDiv.style.color = "#00e676";
            resultDiv.innerHTML = `✅ Safe URL: ${url}`;
        } else if(data.status === "suspicious") {
            resultDiv.style.color = "#ffea00";
            resultDiv.innerHTML = `⚠️ Suspicious URL: ${url}`;
        } else if(data.status === "malicious") {
            resultDiv.style.color = "#ff1744";
            resultDiv.innerHTML = `❌ Malicious URL: ${url}`;
        } else {
            resultDiv.style.color = "#fff";
            resultDiv.innerHTML = `❌ Could not check URL.`;
        }
    })
    .catch(err => {
        resultDiv.style.color = "#fff";
        resultDiv.innerHTML = `⚠️ Error connecting to server.`;
        console.error(err);
    });
});
