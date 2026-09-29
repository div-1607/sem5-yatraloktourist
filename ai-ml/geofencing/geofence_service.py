from .zone_checker import check_point_in_zones

class GeoFenceService:
    def __init__(self):
        # Maps tourist_id -> currently active breached zone_id (or None)
        self.tourist_zone_state = {}

    def process_tourist_location(self, tourist_id, latitude, longitude, active_zones=None):
        """
        Evaluates tourist GPS against active danger & restricted geo-fences.
        Emits ENTRY, EXIT, or CONTINUOUS states to prevent notification spamming.
        """
        result = check_point_in_zones(latitude, longitude, active_zones)
        prev_zone_id = self.tourist_zone_state.get(tourist_id)

        is_inside = result["inside_zone"]
        current_zone_id = result.get("zone_id") if is_inside else None

        event_type = "NO_CHANGE"
        should_alert = False

        if is_inside and prev_zone_id != current_zone_id:
            # New zone entry!
            event_type = "ZONE_ENTRY"
            should_alert = True
            self.tourist_zone_state[tourist_id] = current_zone_id
        elif not is_inside and prev_zone_id is not None:
            # Exited zone!
            event_type = "ZONE_EXIT"
            should_alert = False
            self.tourist_zone_state[tourist_id] = None
        elif is_inside and prev_zone_id == current_zone_id:
            # Continuous stay inside
            event_type = "CONTINUOUS_INSIDE"
            should_alert = False  # Suppress duplicate alarms

        result["event_type"] = event_type
        result["new_alert"] = should_alert
        result["tourist_id"] = tourist_id
        return result

# Singleton instance
geofence_service = GeoFenceService()
