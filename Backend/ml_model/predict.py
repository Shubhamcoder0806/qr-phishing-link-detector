#!/usr/bin/env python3
"""
PhishCheck ML Model Prediction Script
====================================
This script loads a pre-trained machine learning model and makes predictions
on URL features received from the Node.js backend.

Expected Input (JSON from stdin):
{
  "url_length": 45,
  "number_of_dots": 2,
  "number_of_hyphens": 0,
  "number_of_underscores": 1,
  "number_of_slashes": 3,
  "number_of_digits": 4,
  "number_of_parameters": 0,
  "has_ip_address": false,
  "has_https": true,
  "has_shortening_service": false,
  "has_suspicious_words": false
}

Expected Output (JSON to stdout):
{
  "status": "safe",
  "risk_score": 0.15,
  "message": "URL appears to be safe",
  "confidence": 0.92
}
"""

import sys
import json
import pickle
import numpy as np
import os
from pathlib import Path

# Add the script directory to Python path
script_dir = Path(__file__).parent
sys.path.append(str(script_dir))

class PhishCheckPredictor:
    def __init__(self):
        self.model = None
        self.label_encoder = None
        self.feature_names = [
            'url_length', 'number_of_dots', 'number_of_hyphens',
            'number_of_underscores', 'number_of_slashes', 'number_of_digits',
            'number_of_parameters', 'has_ip_address', 'has_https',
            'has_shortening_service', 'has_suspicious_words'
        ]
        self.load_model()
    
    def load_model(self):
        """Load the pre-trained model and label encoder"""
        try:
            model_path = script_dir / 'model.pkl'
            encoder_path = script_dir / 'label_encoder.pkl'
            
            if not model_path.exists():
                raise FileNotFoundError(f"Model file not found: {model_path}")
            
            if not encoder_path.exists():
                raise FileNotFoundError(f"Label encoder file not found: {encoder_path}")
            
            # Load the trained model
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)
            
            # Load the label encoder
            with open(encoder_path, 'rb') as f:
                self.label_encoder = pickle.load(f)
            
            print("✅ Model and encoder loaded successfully", file=sys.stderr)
            
        except Exception as e:
            print(f"❌ Error loading model: {str(e)}", file=sys.stderr)
            raise
    
    def preprocess_features(self, features_dict):
        """Convert feature dictionary to numpy array in correct order"""
        try:
            # Ensure all required features are present
            for feature in self.feature_names:
                if feature not in features_dict:
                    raise ValueError(f"Missing required feature: {feature}")
            
            # Extract features in the correct order
            feature_values = []
            for feature_name in self.feature_names:
                value = features_dict[feature_name]
                
                # Convert boolean to int if needed
                if isinstance(value, bool):
                    value = int(value)
                
                feature_values.append(value)
            
            # Convert to numpy array and reshape for single prediction
            features_array = np.array(feature_values).reshape(1, -1)
            
            return features_array
            
        except Exception as e:
            raise ValueError(f"Error preprocessing features: {str(e)}")
    
    def predict(self, features_dict):
        """Make prediction on URL features"""
        try:
            # Preprocess features
            features_array = self.preprocess_features(features_dict)
            
            # Make prediction
            prediction = self.model.predict(features_array)[0]
            prediction_proba = self.model.predict_proba(features_array)[0]
            
            # Get confidence (max probability)
            confidence = float(np.max(prediction_proba))
            
            # Convert numeric prediction to label
            if hasattr(self.label_encoder, 'inverse_transform'):
                predicted_label = self.label_encoder.inverse_transform([prediction])[0]
            else:
                # If no label encoder, assume direct mapping
                label_map = {0: 'safe', 1: 'suspicious', 2: 'malicious'}
                predicted_label = label_map.get(prediction, 'unknown')
            
            # Calculate risk score (higher = more risky)
            if predicted_label == 'safe':
                risk_score = float(1.0 - confidence)  # Low risk
                message = "URL appears to be safe based on analyzed features"
            elif predicted_label == 'suspicious':
                risk_score = float(0.5 + (confidence * 0.3))  # Medium risk
                message = "URL shows suspicious characteristics - proceed with caution"
            else:  # malicious
                risk_score = float(0.7 + (confidence * 0.3))  # High risk
                message = "URL appears to be malicious - high risk detected"
            
            # Ensure risk_score is between 0 and 1
            risk_score = max(0.0, min(1.0, risk_score))
            
            return {
                'status': predicted_label,
                'risk_score': round(risk_score, 3),
                'message': message,
                'confidence': round(confidence, 3)
            }
            
        except Exception as e:
            raise RuntimeError(f"Prediction failed: {str(e)}")

def main():
    """Main function to handle input/output"""
    try:
        # Initialize predictor
        predictor = PhishCheckPredictor()
        
        # Read input from stdin
        input_data = sys.stdin.read().strip()
        
        if not input_data:
            raise ValueError("No input data received")
        
        # Parse JSON input
        try:
            features = json.loads(input_data)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON input: {str(e)}")
        
        # Make prediction
        result = predictor.predict(features)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        # Return error in JSON format
        error_result = {
            'status': 'error',
            'risk_score': 1.0,  # Max risk on error
            'message': f'Prediction error: {str(e)}',
            'confidence': 0.0
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == '__main__':
    main()
