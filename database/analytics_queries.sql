-- =======================================================
-- YATRALOK ANALYTICS QUERIES
-- High-level telemetry and KPI queries for Police & Admin Dashboards
-- =======================================================

USE yatralok_db;

-- 1. Total Registered Tourists
SELECT COUNT(*) AS total_tourists
FROM tourists;

-- 2. Currently Active Tourists (on active trips)
SELECT COUNT(DISTINCT tourist_id) AS active_tourists
FROM trips
WHERE status = 'ACTIVE';

-- 3. Total Incident Count
SELECT COUNT(*) AS total_incidents
FROM incidents;

-- 4. Total Emergency SOS Triggers
SELECT COUNT(*) AS total_sos_count
FROM incidents
WHERE incident_type = 'SOS';

-- 5. Incidents Grouped by Status
SELECT 
  status,
  COUNT(*) AS count,
  ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM incidents)), 1) AS percentage
FROM incidents
GROUP BY status
ORDER BY count DESC;

-- 6. Incidents Grouped by Zone Proximity
SELECT 
  z.id AS zone_id,
  z.name AS zone_name,
  z.zone_type,
  COUNT(i.id) AS incidents_within_perimeter
FROM geo_zones z
LEFT JOIN incidents i ON (
  (6371000 * ACOS(
    COS(RADIANS(z.latitude)) * COS(RADIANS(i.latitude)) *
    COS(RADIANS(i.longitude) - RADIANS(z.longitude)) +
    SIN(RADIANS(z.latitude)) * SIN(RADIANS(i.latitude))
  )) <= z.radius
)
GROUP BY z.id, z.name, z.zone_type
ORDER BY incidents_within_perimeter DESC;

-- 7. Daily Incident Inflow (Last 14 Days)
SELECT 
  DATE(created_at) AS incident_date,
  COUNT(*) AS total_incidents,
  SUM(CASE WHEN incident_type = 'SOS' THEN 1 ELSE 0 END) AS sos_count,
  SUM(CASE WHEN incident_type = 'GEOFENCE' THEN 1 ELSE 0 END) AS geofence_breach_count
FROM incidents
WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
GROUP BY DATE(created_at)
ORDER BY incident_date ASC;

-- 8. Weekly SOS Emergency Trend (Last 8 Weeks)
SELECT 
  YEARWEEK(created_at, 1) AS year_week,
  CONCAT('Week ', WEEK(created_at, 1)) AS week_label,
  COUNT(*) AS sos_trigger_count
FROM incidents
WHERE incident_type = 'SOS'
  AND created_at >= DATE_SUB(CURDATE(), INTERVAL 8 WEEK)
GROUP BY YEARWEEK(created_at, 1), week_label
ORDER BY year_week ASC;

-- 9. Police Average Response & Resolution Times
SELECT 
  ROUND(AVG(TIMESTAMPDIFF(MINUTE, created_at, acknowledged_at)), 1) AS avg_ack_time_minutes,
  ROUND(AVG(TIMESTAMPDIFF(MINUTE, created_at, resolved_at)), 1) AS avg_resolution_time_minutes,
  MIN(TIMESTAMPDIFF(MINUTE, created_at, acknowledged_at)) AS fastest_ack_minutes,
  MAX(TIMESTAMPDIFF(MINUTE, created_at, acknowledged_at)) AS slowest_ack_minutes
FROM incidents
WHERE acknowledged_at IS NOT NULL;
