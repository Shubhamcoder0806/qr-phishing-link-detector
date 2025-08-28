from flask import Flask, request, jsonify
from flask_cors import CORS
import re

app = Flask(__name__)
CORS(app)

import pandas as pd

app = Flask(__name__)

# Load dataset once
df = pd.read_csv("urls.csv")

@app.route("/check", methods=["POST"])
def check_url():
    data = request.json
    url = data.get("url")

    # Search dataset for given URL
    record = df[df["url"] == url]

    if record.empty:
        return jsonify({"status": "unknown", "message": "URL not found in dataset"}), 404

    # Convert row to dict
    result = record.iloc[0].to_dict()
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True, port=5000)


CORS(app, resources={r"*": {"origins": "*"}})
