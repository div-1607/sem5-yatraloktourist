import numpy as np

def engineer_features(df):
    """
    Constructs safety-critical domain features:
    - is_night: 1 if time is between 22:00 and 05:00
    - danger_proximity_risk: exponential decay of danger distance
    - stationary_hazard_interaction: stationary long in remote/danger zone
    - route_wandering_flag: high deviation with slow speed (lost)
    """
    df_feat = df.copy()

    # 1. Night flag
    df_feat['is_night'] = ((df_feat['time_of_day'] >= 22) | (df_feat['time_of_day'] <= 5)).astype(int)

    # 2. Hazard proximity score (1.0 = 0m away, approaches 0 as dist > 2000m)
    df_feat['danger_proximity_score'] = np.exp(-df_feat['distance_from_danger_zone'] / 400.0)
    df_feat['restricted_proximity_score'] = np.exp(-df_feat['distance_from_restricted_zone'] / 300.0)

    # 3. High risk composite indicator
    df_feat['stationary_hazard_interaction'] = (df_feat['stationary_duration'] > 15) & (df_feat['distance_from_danger_zone'] < 200)
    df_feat['stationary_hazard_interaction'] = df_feat['stationary_hazard_interaction'].astype(int)

    # 4. Lost in remote wilderness index
    df_feat['lost_indicator'] = ((df_feat['route_deviation'] > 2.5) & (df_feat['duration_in_remote_area'] > 20)).astype(int)

    return df_feat
