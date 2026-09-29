import os
import joblib
import numpy as np
import pandas as pd
from .feature_engineering import engineer_features

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'model.pkl')

_artifacts = None

def get_model_artifacts():
    global _artifacts
    if _artifacts is None:
        if os.path.exists(MODEL_PATH):
            _artifacts = joblib.load(MODEL_PATH)
        else:
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}. Please run train.py.")
    return _artifacts

def predict_tourist_risk(features_dict):
    """
    Takes features extracted from movement_features.py and returns:
    {
        "risk_score": 0.76,
        "risk_level": "HIGH",
        "reason": "..."
    }
    """
    artifacts = get_model_artifacts()
    model = artifacts['model']
    feature_cols = artifacts['feature_cols']

    # Convert single dictionary to DataFrame and engineer features
    df = pd.DataFrame([features_dict])
    df_engineered = engineer_features(df)
    
    # Ensure all required features are present
    for col in feature_cols:
        if col not in df_engineered.columns:
            df_engineered[col] = 0.0

    X = df_engineered[feature_cols]

    # Predict probabilities and class
    probs = model.predict_proba(X)[0] # [P(low), P(med), P(high)]
    pred_class = model.predict(X)[0]

    # Continuous risk score calculation (expected risk weight)
    risk_score = round(float(probs[1] * 0.5 + probs[2] * 1.0), 2)
    risk_score = max(0.05, min(0.99, risk_score))

    level_map = {0: 'LOW', 1: 'MEDIUM', 2: 'HIGH'}
    risk_level = level_map.get(int(pred_class), 'LOW')

    # Explainable AI reason generator
    reasons = []
    dist_danger = features_dict.get('distance_from_danger_zone', 9999)
    dist_restricted = features_dict.get('distance_from_restricted_zone', 9999)
    hour = features_dict.get('time_of_day', 12)
    deviation = features_dict.get('route_deviation', 1.0)
    stationary = features_dict.get('stationary_duration', 0.0)

    if dist_danger < 200:
        reasons.append(f"Tourist is only {dist_danger}m away from an active danger perimeter")
    elif dist_restricted < 300:
        reasons.append(f"Tourist is approaching restricted zone border ({dist_restricted}m)")

    if hour >= 22 or hour <= 5:
        reasons.append("Late night movement detected in non-monitored area")

    if deviation > 2.0:
        reasons.append("Unusual route deviation and zig-zag trail indicates potential disorientation")

    if stationary > 20 and dist_danger < 500:
        reasons.append(f"Stationary for {stationary} mins in close proximity to hazard zone")

    if not reasons:
        if risk_level == 'LOW':
            reason = "Tourist movement is on designated tourist trails at normal velocity and safe distance from hazards."
        else:
            reason = "Elevated risk pattern detected from multi-variable movement telemetry."
    else:
        reason = ". ".join(reasons) + "."

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "reason": reason,
        "probabilities": {
            "low": round(float(probs[0]), 3),
            "medium": round(float(probs[1]), 3),
            "high": round(float(probs[2]), 3)
        }
    }
