# YatraLok Geo-fencing System (Member 4)

## Architecture & Algorithm
- **Spatial Geometry:** Circular Geo-fencing (`center_lat`, `center_lon`, `radius_meters`).
- **Distance Metric:** Haversine formula on spherical Earth model (R = 6,371,000 meters).
- **Zone Types Supported:**
  - `DANGER`: Unsafe terrain, rip currents, wildlife corridors.
  - `RESTRICTED`: Sensitive border outposts, sacred funeral ghats, private/military perimeters.
- **State Machine:**
  - Prevents continuous alert spamming when a tourist is dwelling inside a zone.
  - Emits `ZONE_ENTRY` on ingress and `ZONE_EXIT` on egress.
