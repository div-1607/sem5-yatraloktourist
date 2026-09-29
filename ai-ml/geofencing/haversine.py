import math

EARTH_RADIUS_METERS = 6371000.0

def haversine_distance_meters(lat1, lon1, lat2, lon2):
    """
    Calculate the great-circle distance between two points on the Earth
    surface in meters using the Haversine formula.
    """
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) *
         (math.sin(delta_lambda / 2.0) ** 2))
    
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(EARTH_RADIUS_METERS * c, 2)

def haversine_distance_km(lat1, lon1, lat2, lon2):
    """Return distance in kilometers."""
    return round(haversine_distance_meters(lat1, lon1, lat2, lon2) / 1000.0, 3)
