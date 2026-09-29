import math
from ..geofencing.haversine import haversine_distance_meters

def calculate_bearing(lat1, lon1, lat2, lon2):
    """Calculates compass bearing in degrees between two coordinates."""
    y = math.sin(math.radians(lon2 - lon1)) * math.cos(math.radians(lat2))
    x = math.cos(math.radians(lat1)) * math.sin(math.radians(lat2)) - \
        math.sin(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.cos(math.radians(lon2 - lon1))
    bearing = math.degrees(math.atan2(y, x))
    return (bearing + 360) % 360

def compute_route_deviation_score(gps_trail):
    """
    Computes route wandering/deviation index (ratio of actual path distance vs straight displacement).
    1.0 = direct linear path. > 2.0 = wandering / zig-zag / lost.
    """
    if len(gps_trail) < 3:
        return 1.0

    actual_distance = 0.0
    for i in range(len(gps_trail) - 1):
        actual_distance += haversine_distance_meters(
            gps_trail[i]['latitude'], gps_trail[i]['longitude'],
            gps_trail[i+1]['latitude'], gps_trail[i+1]['longitude']
        )

    direct_displacement = haversine_distance_meters(
        gps_trail[0]['latitude'], gps_trail[0]['longitude'],
        gps_trail[-1]['latitude'], gps_trail[-1]['longitude']
    )

    if direct_displacement < 10.0:
        return 1.5 if actual_distance > 50.0 else 1.0

    ratio = actual_distance / direct_displacement
    return round(min(5.0, ratio), 2)
