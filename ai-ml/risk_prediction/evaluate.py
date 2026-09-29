import os
import joblib
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')

def run_evaluation():
    model_path = os.path.join(BASE_DIR, 'model.pkl')
    data_path = os.path.join(DATA_DIR, 'processed_data.csv')

    if not os.path.exists(model_path) or not os.path.exists(data_path):
        print("Model or processed data not found. Please run train.py first.")
        return

    artifacts = joblib.load(model_path)
    model = artifacts['model']
    feature_cols = artifacts['feature_cols']

    df = pd.read_csv(data_path)
    X = df[feature_cols]
    y = df['risk_level']

    y_pred = model.predict(X)
    print("=" * 60)
    print("YATRALOK RISK PREDICTION - COMPREHENSIVE EVALUATION REPORT")
    print("=" * 60)
    print(classification_report(y, y_pred, target_names=['LOW (0)', 'MEDIUM (1)', 'HIGH (2)']))
    print("\nConfusion Matrix:")
    print(confusion_matrix(y, y_pred))
    print("\nSaved Model Metrics:", artifacts['metrics'])

if __name__ == '__main__':
    run_evaluation()
