import os
import sys
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
os.makedirs(DATA_DIR, exist_ok=True)

print("[YatraLok ML] Generating tourist risk dataset...")

np.random.seed(42)
n_samples = 3500

# 1. Feature simulation
dist_danger = np.random.exponential(scale=1200.0, size=n_samples) + 20.0
dist_restricted = np.random.exponential(scale=1500.0, size=n_samples) + 30.0
speed = np.random.gamma(shape=2.5, scale=2.0, size=n_samples) # km/h (walking to vehicle)
time_of_day = np.random.randint(0, 24, size=n_samples)
duration_remote = np.random.exponential(scale=15.0, size=n_samples)
movement_freq = np.random.poisson(lam=25, size=n_samples)
route_deviation = np.random.lognormal(mean=0.2, sigma=0.4, size=n_samples)
stationary_duration = np.random.exponential(scale=12.0, size=n_samples)
zone_entry_history = np.random.choice([0, 1, 2, 3], size=n_samples, p=[0.75, 0.15, 0.07, 0.03])
prev_incidents = np.random.choice([0, 1, 2], size=n_samples, p=[0.9, 0.08, 0.02])

# Ground truth risk assignment (0: LOW, 1: MEDIUM, 2: HIGH)
risk_latent = (
    (np.maximum(0, 1000.0 - dist_danger) / 1000.0 * 35.0) +
    (np.maximum(0, 800.0 - dist_restricted) / 800.0 * 30.0) +
    (np.where((time_of_day >= 22) | (time_of_day <= 5), 20.0, 0.0)) +
    (np.where((stationary_duration > 25) & (dist_danger < 300), 25.0, 0.0)) +
    (np.where(route_deviation > 2.5, 15.0, 0.0)) +
    (zone_entry_history * 10.0) +
    (prev_incidents * 15.0) +
    np.random.normal(0, 6.0, size=n_samples)
)

labels = []
for val in risk_latent:
    if val < 25.0:
        labels.append(0) # LOW
    elif val < 55.0:
        labels.append(1) # MEDIUM
    else:
        labels.append(2) # HIGH

raw_df = pd.DataFrame({
    'distance_from_danger_zone': dist_danger,
    'distance_from_restricted_zone': dist_restricted,
    'speed': speed,
    'time_of_day': time_of_day,
    'duration_in_remote_area': duration_remote,
    'movement_frequency': movement_freq,
    'route_deviation': route_deviation,
    'stationary_duration': stationary_duration,
    'zone_entry_history': zone_entry_history,
    'previous_incident_context': prev_incidents,
    'risk_level': labels
})

dataset_path = os.path.join(DATA_DIR, 'dataset.csv')
raw_df.to_csv(dataset_path, index=False)
print(f"[OK] Raw dataset saved to {dataset_path} ({n_samples} samples)")

# Preprocessing & Feature Engineering
from preprocessing import clean_and_impute_dataset
from feature_engineering import engineer_features

cleaned_df = clean_and_impute_dataset(raw_df)
processed_df = engineer_features(cleaned_df)
processed_path = os.path.join(DATA_DIR, 'processed_data.csv')
processed_df.to_csv(processed_path, index=False)
print(f"[OK] Processed dataset saved to {processed_path}")

feature_cols = [
    'distance_from_danger_zone', 'distance_from_restricted_zone', 'speed',
    'time_of_day', 'duration_in_remote_area', 'movement_frequency',
    'route_deviation', 'stationary_duration', 'zone_entry_history',
    'previous_incident_context', 'is_night', 'danger_proximity_score',
    'restricted_proximity_score', 'stationary_hazard_interaction', 'lost_indicator'
]

X = processed_df[feature_cols]
y = processed_df['risk_level']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Model 1: Logistic Regression
lr = LogisticRegression(max_iter=1000, random_state=42)
lr.fit(X_train, y_train)
lr_acc = accuracy_score(y_test, lr.predict(X_test))

# Model 2: Decision Tree
dt = DecisionTreeClassifier(max_depth=6, random_state=42)
dt.fit(X_train, y_train)
dt_acc = accuracy_score(y_test, dt.predict(X_test))

# Model 3: Random Forest
rf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
rf.fit(X_train, y_train)
y_pred_rf = rf.predict(X_test)
rf_acc = accuracy_score(y_test, y_pred_rf)
rf_prec = precision_score(y_test, y_pred_rf, average='weighted')
rf_rec = recall_score(y_test, y_pred_rf, average='weighted')
rf_f1 = f1_score(y_test, y_pred_rf, average='weighted')

print(f"\n--- MODEL EVALUATION SUMMARY ---")
print(f"1. Logistic Regression Accuracy: {lr_acc*100:.2f}%")
print(f"2. Decision Tree Accuracy:       {dt_acc*100:.2f}%")
print(f"3. Random Forest (Selected):")
print(f"   - Accuracy:  {rf_acc*100:.2f}%")
print(f"   - Precision: {rf_prec*100:.2f}%")
print(f"   - Recall:    {rf_rec*100:.2f}%")
print(f"   - F1-Score:  {rf_f1*100:.2f}%")
print("\nConfusion Matrix (Random Forest):")
print(confusion_matrix(y_test, y_pred_rf))

# Save selected model and feature metadata
model_artifacts = {
    'model': rf,
    'feature_cols': feature_cols,
    'target_mapping': {0: 'LOW', 1: 'MEDIUM', 2: 'HIGH'},
    'metrics': {
        'accuracy': float(rf_acc),
        'f1': float(rf_f1),
        'precision': float(rf_prec),
        'recall': float(rf_rec)
    }
}

model_save_path = os.path.join(BASE_DIR, 'model.pkl')
joblib.dump(model_artifacts, model_save_path)
print(f"\n[SUCCESS] Best Random Forest model saved to {model_save_path}")
