-- =======================================================
-- YATRALOK DATABASE VIEWS
-- Specialized reporting and aggregation views
-- =======================================================

USE yatralok_db;

-- 1. View: Active Tourists and their Live Trips & Last Known Coordinates
DROP VIEW IF EXISTS v_active_tourists;
CREATE VIEW v_active_tourists AS
SELECT 
  t.id AS tourist_id,
  t.digital_id,
  u.id AS user_id,
  u.name,
  u.email,
  u.phone,
  tr.id AS active_trip_id,
  tr.destination,
  tr.start_time AS trip_started_at,
  lp.latitude AS last_latitude,
  lp.longitude AS last_longitude,
  lp.accuracy AS last_accuracy,
  lp.timestamp AS last_location_time
FROM tourists t
JOIN users u ON t.user_id = u.id
JOIN trips tr ON tr.tourist_id = t.id AND tr.status = 'ACTIVE'
LEFT JOIN (
  -- Subquery for the latest location point per trip
  SELECT lp1.*
  FROM location_points lp1
  JOIN (
    SELECT trip_id, MAX(id) AS max_id
    FROM location_points
    GROUP BY trip_id
  ) lp2 ON lp1.id = lp2.max_id
) lp ON lp.trip_id = tr.id;

-- 2. View: Active Incidents for Police Dispatch
DROP VIEW IF EXISTS v_active_incidents;
CREATE VIEW v_active_incidents AS
SELECT 
  i.id AS incident_id,
  i.incident_type,
  i.priority,
  i.status,
  i.latitude,
  i.longitude,
  i.description,
  i.created_at,
  i.acknowledged_at,
  t.id AS tourist_id,
  t.digital_id,
  u.name AS tourist_name,
  u.phone AS tourist_phone,
  po.id AS assigned_officer_id,
  po.badge_number,
  po.station_name,
  po_user.name AS officer_name,
  TIMESTAMPDIFF(MINUTE, i.created_at, NOW()) AS elapsed_minutes
FROM incidents i
JOIN tourists t ON i.tourist_id = t.id
JOIN users u ON t.user_id = u.id
LEFT JOIN police_officers po ON i.assigned_officer_id = po.id
LEFT JOIN users po_user ON po.user_id = po_user.id
WHERE i.status NOT IN ('RESOLVED', 'CLOSED');

-- 3. View: Incident Response Summary Metrics
DROP VIEW IF EXISTS v_incident_metrics;
CREATE VIEW v_incident_metrics AS
SELECT 
  status,
  incident_type,
  priority,
  COUNT(*) AS total_count,
  AVG(TIMESTAMPDIFF(MINUTE, created_at, IFNULL(acknowledged_at, NOW()))) AS avg_ack_time_mins,
  AVG(TIMESTAMPDIFF(MINUTE, created_at, IFNULL(resolved_at, NOW()))) AS avg_resolution_time_mins
FROM incidents
GROUP BY status, incident_type, priority;
