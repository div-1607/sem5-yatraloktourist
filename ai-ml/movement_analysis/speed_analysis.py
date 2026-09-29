from ..geofencing.haversine import haversine_distance_meters
from datetime import datetime

def calculate_speed_kmh(p1, p2):
    """
    Given two points with lat, lon, timestamp, calculate speed in km/h.
    p1, p2: dicts with 'latitude', 'longitude', 'timestamp'
    """
    dist_m = haversine_distance_meters(p1['latitude'], p1['longitude'], p2['latitude'], p2['longitude'])
    
    t1 = p1['timestamp']
    t2 = p2['timestamp']
    if isinstance(t1, str):
        t1 = datetime.fromisoformat(t1.replace('Z', '+00:00'))
    if isinstance(t2, str):
        t2 = datetime.fromisoformat(t2.replace('Z', '+00:00'))

    time_diff_sec = abs((t2 - t1).total_seconds())
    if time_diff_sec < 1.0:
        return 0.0

    speed_mps = dist_m / time_diff_sec
    return round(speed_mps * 3.6, 2)

def detect_stationary_duration_minutes(gps_trail, movement_threshold_meters=15.0):
    """
    Examines trail backwards to see how many minutes tourist remained within a tight cluster.
    """
    if len(gps_trail) < 2:
        return 0.0

    latest = gps_trail[-1]
    stationary_seconds = 0

    for i in range(len(gps_trail) - 2, -1, -1):
        d = haversine_distance_meters(latest['latitude'], latest['longitude'], gps_trail[i]['latitude'], gps_trail[i]['longitude'])
        if d <= movement_threshold_meters:
            t_curr = latest['timestamp']
            t_prev = gps_trail[i]['timestamp']
            if isinstance(t_curr, str): t_curr = datetime.fromisoformat(t_curr.replace('Z', '+00:00'))
            if isinstance(t_prev, str): t_prev = datetime.fromisoformat(t_prev.replace('Z', '+00:00'))
            stationary_seconds = abs((t_curr - t_prev).total_seconds())
        else:
            break

    return round(stationary_seconds / 60.0, 1)
