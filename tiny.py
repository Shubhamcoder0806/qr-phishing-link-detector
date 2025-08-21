from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Demo ML check
@app.route('/check', methods=['POST'])
def check_url():
    data = request.get_json()
    url = data.get('url', '')

    if not url:
        return jsonify({'status': 'error', 'message': 'No URL provided'})

    # Demo logic: you can tweak keywords
    status = 'safe'
    if 'malware' in url or 'bad' in url:
        status = 'malicious'
    elif 'suspicious' in url:
        status = 'suspicious'

    return jsonify({'status': status})

if __name__ == "__main__":
    app.run(port=5000, debug=True)


