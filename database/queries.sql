-- =======================================================
-- YATRALOK STANDARD BUSINESS QUERIES
-- Core queries utilized by the Node.js backend controllers
-- =======================================================

USE yatralok_db;

-- -------------------------------------------------------
-- A. TOURIST QUERIES
-- -------------------------------------------------------

-- 1. Get all tourists with user account info
SELECT 
  t.id AS tourist_id,
  t.digital_id,
  u.name,
  u.email,
  u.phone,
  t.date_of_birth,
  t.address,
  t.created_at
FROM tourists t
JOIN users u ON t.user_id = u.id
ORDER BY t.created_at DESC;

-- 2. Get active tourists (currently on an ACTIVE trip)
SELECT 
  t.id AS tourist_id,
  t.digital_id,
  u.name,
  u.phone,
  tr.id AS active_trip_id,
  tr.destination,
  tr.start_time
FROM tourists t
JOIN users u ON t.user_id = u.id
JOIN trips tr ON tr.tourist_id = t.id
WHERE tr.status = 'ACTIVE';

-- 3. Get tourist by Digital ID (e.g. 'YL-2026-000101')
SELECT 
  t.id AS tourist_id,
  t.digital_id,
  u.id AS user_id,
  u.name,
  u.email,
  u.phone,
  t.address
FROM tourists t
JOIN users u ON t.user_id = u.id
WHERE t.digital_id = 'YL-2026-000101';

-- -------------------------------------------------------
-- B. TRIP QUERIES
-- -------------------------------------------------------

-- 1. Get all currently active trips
SELECT 
  tr.id AS trip_id,
  tr.tourist_id,
  t.digital_id,
  u.name AS tourist_name,
  tr.destination,
  tr.start_time,
  TIMESTAMPDIFF(MINUTE, tr.start_time, NOW()) AS elapsed_minutes
FROM trips tr
JOIN tourists t ON tr.tourist_id = t.id
JOIN users u ON t.user_id = u.id
WHERE tr.status = 'ACTIVE'
ORDER BY tr.start_time DESC;

-- 2. Get specific tourist trip history
SELECT 
  tr.id AS trip_id,
  tr.destination,
  tr.start_time,
  tr.end_time,
  tr.status,
  COUNT(lp.id) AS total_gps_points
FROM trips tr
LEFT JOIN location_points lp ON tr.id = lp.trip_id
WHERE tr.tourist_id = 1
GROUP BY tr.id
ORDER BY tr.start_time DESC;

-- -------------------------------------------------------
-- C. LOCATION QUERIES
-- -------------------------------------------------------

-- 1. Get latest GPS location for a specific tourist
SELECT 
  lp.id,
  lp.trip_id,
  lp.latitude,
  lp.longitude,
  lp.accuracy,
  lp.timestamp
FROM location_points lp
JOIN trips tr ON lp.trip_id = tr.id
WHERE tr.tourist_id = 1
ORDER BY lp.timestamp DESC
LIMIT 1;

-- 2. Get complete GPS route trail for a specific trip
SELECT 
  lp.latitude,
  lp.longitude,
  lp.accuracy,
  lp.timestamp
FROM location_points lp
WHERE lp.trip_id = 1
ORDER BY lp.timestamp ASC;

-- -------------------------------------------------------
-- D. INCIDENT QUERIES
-- -------------------------------------------------------

-- 1. Get all NEW SOS incidents requiring immediate attention
SELECT 
  i.id AS incident_id,
  i.incident_type,
  i.priority,
  i.latitude,
  i.longitude,
  i.description,
  i.created_at,
  t.digital_id,
  u.name AS tourist_name,
  u.phone AS tourist_phone
FROM incidents i
JOIN tourists t ON i.tourist_id = t.id
JOIN users u ON t.user_id = u.id
WHERE i.incident_type = 'SOS' AND i.status = 'NEW'
ORDER BY i.created_at DESC;

-- 2. Get all active (unresolved) incidents
SELECT 
  i.id,
  i.incident_type,
  i.priority,
  i.status,
  i.latitude,
  i.longitude,
  i.description,
  i.created_at,
  i.assigned_officer_id,
  u.name AS tourist_name
FROM incidents i
JOIN tourists t ON i.tourist_id = t.id
JOIN users u ON t.user_id = u.id
WHERE i.status NOT IN ('RESOLVED', 'CLOSED')
ORDER BY 
  FIELD(i.priority, 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'),
  i.created_at ASC;

-- 3. Get incidents assigned to a specific police officer
SELECT 
  i.id AS incident_id,
  i.incident_type,
  i.priority,
  i.status,
  i.description,
  i.created_at,
  i.acknowledged_at,
  t.digital_id,
  u.name AS tourist_name,
  u.phone AS tourist_phone
FROM incidents i
JOIN tourists t ON i.tourist_id = t.id
JOIN users u ON t.user_id = u.id
WHERE i.assigned_officer_id = 1
ORDER BY i.created_at DESC;

-- 4. Get incidents filtered by status (e.g. 'ASSIGNED')
SELECT *
FROM incidents
WHERE status = 'ASSIGNED'
ORDER BY created_at DESC;

-- 5. Get incidents occurring within or near a specific danger geo-zone (Zone ID 1)
SELECT 
  i.id,
  i.incident_type,
  i.latitude,
  i.longitude,
  i.status,
  z.name AS zone_name,
  (6371000 * ACOS(
    COS(RADIANS(z.latitude)) * COS(RADIANS(i.latitude)) *
    COS(RADIANS(i.longitude) - RADIANS(z.longitude)) +
    SIN(RADIANS(z.latitude)) * SIN(RADIANS(i.latitude))
  )) AS distance_to_zone_center_meters
FROM incidents i
CROSS JOIN geo_zones z ON z.id = 1
HAVING distance_to_zone_center_meters <= z.radius + 1000
ORDER BY distance_to_zone_center_meters ASC;
