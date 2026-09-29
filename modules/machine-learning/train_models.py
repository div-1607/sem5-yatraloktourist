import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, mean_squared_error

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'saved_models')
DATA_DIR = os.path.join(BASE_DIR, 'datasets')
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

print("[YatraLok ML] Starting Model Training Pipeline...")

# ==========================================
# 1. CROWD PREDICTION MODEL (Classification)
# ==========================================
# Target: 0 (Low / Green), 1 (Medium / Yellow), 2 (High / Red)
np.random.seed(42)
n_samples = 4000

# Features:
# - hour: 0-23
# - is_weekend: 0 or 1
# - season_code: 0 (winter), 1 (summer), 2 (monsoon), 3 (autumn)
# - is_festival: 0 or 1
# - temp_c: 5 - 45
# - base_popularity: 1 - 10
hours = np.random.randint(0, 24, n_samples)
is_weekend = np.random.choice([0, 1], size=n_samples, p=[0.71, 0.29])
season_code = np.random.choice([0, 1, 2, 3], size=n_samples)
is_festival = np.random.choice([0, 1], size=n_samples, p=[0.88, 0.12])
temp_c = np.random.uniform(10, 42, size=n_samples)
base_popularity = np.random.randint(1, 11, size=n_samples)

# Generate realistic crowd levels
crowd_scores = (
    base_popularity * 4.5 +
    (is_weekend * 22) +
    (is_festival * 35) +
    # Peak hours around 10am-12pm and 4pm-7pm
    np.where((hours >= 10) & (hours <= 12), 25, 0) +
    np.where((hours >= 16) & (hours <= 19), 30, 0) +
    np.where((hours >= 23) | (hours <= 5), -35, 0) +
    np.where(season_code == 0, 12, 0) + # Winter rush
    np.random.normal(0, 8, n_samples)
)

crowd_labels = []
for s in crowd_scores:
    if s < 38:
        crowd_labels.append(0) # Low / Green
    elif s < 68:
        crowd_labels.append(1) # Medium / Yellow
    else:
        crowd_labels.append(2) # High / Red

df_crowd = pd.DataFrame({
    'hour': hours,
    'is_weekend': is_weekend,
    'season_code': season_code,
    'is_festival': is_festival,
    'temp_c': temp_c,
    'base_popularity': base_popularity,
    'crowd_label': crowd_labels
})
df_crowd.to_csv(os.path.join(DATA_DIR, 'crowd_training_data.csv'), index=False)

X_crowd = df_crowd[['hour', 'is_weekend', 'season_code', 'is_festival', 'temp_c', 'base_popularity']]
y_crowd = df_crowd['crowd_label']

X_train, X_test, y_train, y_test = train_test_split(X_crowd, y_crowd, test_size=0.2, random_state=42)
crowd_model = RandomForestClassifier(n_estimators=120, max_depth=12, random_state=42)
crowd_model.fit(X_train, y_train)

acc = crowd_model.score(X_test, y_test)
print(f"[OK] Crowd Model Trained - Accuracy: {acc * 100:.2f}%")
joblib.dump(crowd_model, os.path.join(MODELS_DIR, 'crowd_rf_model.pkl'))


# ==========================================
# 2. SAFETY PREDICTION MODEL (Regression)
# ==========================================
# Target: Safety Score from 0 to 100
# Features:
# - crowd_level: 0 (low), 1 (medium), 2 (high)
# - local_incidents_30d: 0 - 8
# - hour_of_day: 0 - 23
# - is_night: 0 or 1
# - distance_to_emergency_facility_km: 0.2 - 25.0
n_safety_samples = 3000
s_crowd = np.random.choice([0, 1, 2], size=n_safety_samples, p=[0.4, 0.4, 0.2])
s_incidents = np.random.poisson(lam=0.8, size=n_safety_samples)
s_hours = np.random.randint(0, 24, n_safety_samples)
s_is_night = np.where((s_hours >= 21) | (s_hours <= 5), 1, 0)
s_emergency_dist = np.random.exponential(scale=3.5, size=n_safety_samples) + 0.3

safety_scores = (
    95.0
    - (s_incidents * 7.5)
    - (s_is_night * 12.0)
    - np.where(s_crowd == 2, 14.0, 0.0) # extreme crowd stampede/pickpocketing
    - np.where((s_crowd == 0) & (s_is_night == 1), 10.0, 0.0) # deserted dark street
    - np.clip(s_emergency_dist * 0.8, 0, 15)
    + np.random.normal(0, 3, n_safety_samples)
)
safety_scores = np.clip(safety_scores, 15.0, 99.0)

df_safety = pd.DataFrame({
    'crowd_level': s_crowd,
    'local_incidents': s_incidents,
    'hour': s_hours,
    'is_night': s_is_night,
    'emergency_dist_km': s_emergency_dist,
    'safety_score': safety_scores
})
df_safety.to_csv(os.path.join(DATA_DIR, 'safety_training_data.csv'), index=False)

X_safety = df_safety[['crowd_level', 'local_incidents', 'hour', 'is_night', 'emergency_dist_km']]
y_safety = df_safety['safety_score']

Xs_train, Xs_test, ys_train, ys_test = train_test_split(X_safety, y_safety, test_size=0.2, random_state=42)
safety_model = GradientBoostingRegressor(n_estimators=100, max_depth=5, random_state=42)
safety_model.fit(Xs_train, ys_train)

safety_r2 = safety_model.score(Xs_test, ys_test)
print(f"[OK] Safety Model Trained - R2 Score: {safety_r2:.3f}")
joblib.dump(safety_model, os.path.join(MODELS_DIR, 'safety_gb_model.pkl'))

print("[SUCCESS] All Scikit-Learn Machine Learning Models successfully trained and saved!")
