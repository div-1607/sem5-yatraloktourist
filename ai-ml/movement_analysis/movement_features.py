from datetime import datetime
from .speed_analysis import calculate_speed_kmh, detect_stationary_duration_minutes
from .route_analysis import compute_route_deviation_score
from ..geofencing.haversine import haversine_distance_meters
from ..geofencing.zone_checker import DEFAULT_ZONES

def extract_movement_feature_vector(gps_trail, current_point, active_zones=None, user_context=None):
    """
    Extracts high-dimensional movement feature vector from GPS stream for AI Risk Prediction.
    """
    if active_zones is None:
        active_zones = DEFAULT_ZONES

    lat = current_point['latitude']
    lon = current_point['longitude']

    # 1. Distances to danger and restricted zones
    danger_dists = [haversine_distance_meters(lat, lon, z['latitude'], z['longitude']) for z in active_zones if z['zone_type'] == 'DANGER']
    restricted_dists = [haversine_distance_meters(lat, lon, z['latitude'], z['longitude']) for z in active_zones if z['zone_type'] == 'RESTRICTED']

    dist_danger = min(danger_dists) if danger_dists else 5000.0
    dist_restricted = min(restricted_dists) if restricted_dists else 5000.0

    # 2. Speed
    speed = current_point.get('speed', 0.0)
    if not speed and len(gps_trail) >= 2:
        speed = calculate_speed_kmh(gps_trail[-2], gps_trail[-1])

    # 3. Time of day (hour 0-23)
    t = current_point.get('timestamp')
    if isinstance(t, str):
        try:
            t = datetime.fromisoformat(t.replace('Z', '+00:00'))
        except:
            t = datetime.now()
    elif not isinstance(t, datetime):
        t = datetime.now()
    hour = t.hour

    # 4. Stationary Duration & Route Deviation
    stationary_mins = detect_stationary_duration_minutes(gps_trail) if gps_trail else 0.0
    route_deviation = compute_route_deviation_score(gps_trail) if gps_trail else 1.0

    # 5. Remote Area Duration & Frequency
    duration_remote = 0.0
    if dist_danger < 500.0 or dist_restricted < 500.0:
        duration_remote = min(60.0, stationary_mins + (len(gps_trail) * 1.5))

    movement_freq = len(gps_trail)

    # 6. User context flags
    ctx = user_context or {}
    zone_entry_history = ctx.get('zone_entry_count', 0)
    previous_incidents = ctx.get('previous_incident_count', 0)

    return {
        "distance_from_danger_zone": round(dist_danger, 1),
        "distance_from_restricted_zone": round(dist_restricted, 1),
        "speed": round(speed, 2),
        "time_of_day": hour,
        "duration_in_remote_area": round(duration_remote, 1),
        "movement_frequency": movement_freq,
        "route_deviation": round(route_deviation, 2),
        "stationary_duration": round(stationary_mins, 1),
        "zone_entry_history": zone_entry_history,
        "previous_incident_context": previous_incidents
    }
