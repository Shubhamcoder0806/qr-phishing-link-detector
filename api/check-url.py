import json
import pandas as pd
import os

# Load dataset once
dataset_path = os.path.join(os.path.dirname(__file__), "urls.csv")
df = pd.read_csv(dataset_path)

def handler(request):
    try:
        data = json.loads(request.body)
        url = data.get("url")
        if not url:
            return {
                "statusCode": 400,
                "body": json.dumps({"status": "error", "message": "URL is required"})
            }

        # Search dataset
        record = df[df["url"] == url]
        if record.empty:
            return {
                "statusCode": 200,
                "body": json.dumps({"status": "unknown", "message": "URL not found in dataset"})
            }

        # Convert row to dict
        result = record.iloc[0].to_dict()
        return {
            "statusCode": 200,
            "body": json.dumps(result)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"status": "error", "message": str(e)})
        }
