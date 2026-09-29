import pandas as pd
import numpy as np

def clean_and_impute_dataset(df):
    """
    Cleans raw tourist risk telemetry dataset:
    - handles missing numerical values via median
    - clips outliers
    - standardizes column names
    """
    cleaned = df.copy()

    # Fill numerical NaNs with column medians
    numerical_cols = cleaned.select_dtypes(include=[np.number]).columns
    for col in numerical_cols:
        if cleaned[col].isnull().sum() > 0:
            cleaned[col] = cleaned[col].fillna(cleaned[col].median())

    # Ensure distance bounds
    if 'distance_from_danger_zone' in cleaned.columns:
        cleaned['distance_from_danger_zone'] = cleaned['distance_from_danger_zone'].clip(lower=0, upper=25000)
    if 'distance_from_restricted_zone' in cleaned.columns:
        cleaned['distance_from_restricted_zone'] = cleaned['distance_from_restricted_zone'].clip(lower=0, upper=25000)
    if 'speed' in cleaned.columns:
        cleaned['speed'] = cleaned['speed'].clip(lower=0, upper=140)

    return cleaned
