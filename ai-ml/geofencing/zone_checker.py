from .haversine import haversine_distance_meters

# Default reference danger zones in India if none passed
DEFAULT_ZONES = [
    {
        "id": 1,
        "name": "Baga Beach Rip Current Hazard",
        "latitude": 15.5553,
        "longitude": 73.7517,
        "radius": 400.0,
        "zone_type": "DANGER",
        "description": "Severe undertows and rip currents"
    },
    {
        "id": 2,
        "name": "Rohtang Pass Avalanche Ridge",
        "latitude": 32.3716,
        "longitude": 77.2466,
        "radius": 1200.0,
        "zone_type": "RESTRICTED",
        "description": "High altitude landslide/scree slope"
    },
    {
        "id": 3,
        "name": "Varanasi Cremation Ghat Buffer",
        "latitude": 25.3109,
        "longitude": 83.0136,
        "radius": 250.0,
        "zone_type": "RESTRICTED",
        "description": "Restricted funeral pyre boundary"
    },
    {
        "id": 4,
        "name": "Sundarbans Mudflats Wildlife Boundary",
        "latitude": 21.9497,
        "longitude": 88.8535,
        "radius": 1500.0,
        "zone_type": "DANGER",
        "description": "Wild crocodile and tiger corridor"
    }
]

def check_point_in_zones(lat, lon, zones=None):
    """
    Checks if a given coordinate (lat, lon) is inside any circular geo-fence.
    Returns details on breached zones, distance, and nearest danger zone.
    """
    if zones is None:
        zones = DEFAULT_ZONES

    inside_zones = []
    nearest_zone = None
    min_distance = float('inf')

    for zone in zones:
        dist = haversine_distance_meters(lat, lon, zone["latitude"], zone["longitude"])
        
        if dist < min_distance:
            min_distance = dist
            nearest_zone = {
                "zone_id": zone.get("id"),
                "zone_name": zone.get("name"),
                "zone_type": zone.get("zone_type"),
                "distance": dist,
                "radius": zone.get("radius")
            }

        if dist <= zone["radius"]:
            inside_zones.append({
                "zone_id": zone.get("id"),
                "zone_name": zone.get("name"),
                "zone_type": zone.get("zone_type"),
                "distance": dist,
                "radius": zone.get("radius"),
                "warning": True
            })

    if inside_zones:
        # Return first breached zone with highest priority
        primary = inside_zones[0]
        return {
            "inside_zone": True,
            "zone_id": primary["zone_id"],
            "zone_name": primary["zone_name"],
            "zone_type": primary["zone_type"],
            "distance": primary["distance"],
            "warning": True,
            "all_breached_zones": inside_zones,
            "nearest_zone": nearest_zone
        }
    else:
        return {
            "inside_zone": False,
            "zone_name": None,
            "zone_type": None,
            "distance": min_distance if nearest_zone else None,
            "warning": False,
            "nearest_zone": nearest_zone
        }
