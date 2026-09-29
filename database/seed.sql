-- =======================================================
-- YATRALOK SEED SCRIPT
-- Populates yatralok_db with clean test fixtures
-- Default password for all seed accounts: Password123!
-- Bcrypt Hash: $2b$10$5M8y3QvO9aW0hFh1rQj5xOGqH2sI1eO9sI2sW8eD7eM9bC1o2n3u
-- =======================================================

USE yatralok_db;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE risk_predictions;
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE notifications;
TRUNCATE TABLE incident_status_history;
TRUNCATE TABLE incidents;
TRUNCATE TABLE geo_zones;
TRUNCATE TABLE emergency_contacts;
TRUNCATE TABLE location_points;
TRUNCATE TABLE trips;
TRUNCATE TABLE police_officers;
TRUNCATE TABLE tourists;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- -------------------------------------------------------
-- 1. USERS: 1 Admin, 3 Police Officers, 5 Tourists
-- -------------------------------------------------------
INSERT INTO users (id, name, email, phone, password_hash, role) VALUES
(1, 'Commander Vikram Malhotra', 'admin@yatralok.gov.in', '+919811000001', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'ADMIN'),
(2, 'Inspector Rajesh Sharma', 'rajesh.police@yatralok.gov.in', '+919811000002', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'POLICE'),
(3, 'Sub-Inspector Sunita Rao', 'sunita.police@yatralok.gov.in', '+919811000003', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'POLICE'),
(4, 'Constable Amit Verma', 'amit.police@yatralok.gov.in', '+919811000004', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'POLICE'),
(5, 'Aarav Patel', 'aarav.patel@gmail.com', '+919811000005', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'TOURIST'),
(6, 'Priya Nair', 'priya.nair@gmail.com', '+919811000006', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'TOURIST'),
(7, 'David Miller', 'david.miller@yahoo.com', '+919811000007', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'TOURIST'),
(8, 'Ananya Sengupta', 'ananya.s@outlook.com', '+919811000008', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'TOURIST'),
(9, 'Rohan Mehra', 'rohan.mehra@gmail.com', '+919811000009', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'TOURIST');

-- -------------------------------------------------------
-- 2. POLICE OFFICERS: 3 Records
-- -------------------------------------------------------
INSERT INTO police_officers (id, user_id, badge_number, station_name) VALUES
(1, 2, 'UP-AGR-401', 'Taj Ganj Tourist Police Station, Agra'),
(2, 3, 'UP-VNS-208', 'Dashashwamedh Riverfront Outpost, Varanasi'),
(3, 4, 'HP-MNL-112', 'Mall Road Tourist Patrol Unit, Manali');

-- -------------------------------------------------------
-- 3. TOURISTS: 5 Records with Digital IDs
-- -------------------------------------------------------
INSERT INTO tourists (id, user_id, digital_id, date_of_birth, address) VALUES
(1, 5, 'YL-2026-000101', '1998-05-14', 'B-42, Satellite Nagar, Ahmedabad, Gujarat'),
(2, 6, 'YL-2026-000102', '1995-11-23', 'Flat 302, Palm Meadows, Kochi, Kerala'),
(3, 7, 'YL-2026-000103', '1992-02-18', '742 Evergreen Terrace, London, UK'),
(4, 8, 'YL-2026-000104', '2001-08-30', '12 Lake View Road, Kolkata, West Bengal'),
(5, 9, 'YL-2026-000105', '1999-04-12', 'C-15, Greater Kailash-I, New Delhi');

-- -------------------------------------------------------
-- 4. EMERGENCY CONTACTS (1 to 3 per tourist)
-- -------------------------------------------------------
INSERT INTO emergency_contacts (tourist_id, name, phone, relation) VALUES
(1, 'Ramesh Patel', '+919822001101', 'Father'),
(1, 'Kavita Patel', '+919822001102', 'Sister'),
(2, 'Suresh Nair', '+919822002201', 'Spouse'),
(3, 'Sarah Miller', '+447911123456', 'Mother'),
(4, 'Debashis Sengupta', '+919822004401', 'Father'),
(5, 'Sunita Mehra', '+919822005501', 'Mother');

-- -------------------------------------------------------
-- 5. GEO ZONES (DANGER / RESTRICTED)
-- -------------------------------------------------------
INSERT INTO geo_zones (id, name, latitude, longitude, radius, zone_type, description, status) VALUES
(1, 'Baga Beach Rip Current Hazard', 15.5553000, 73.7517000, 400.00, 'DANGER', 'Dangerous seaward undertows and hidden reef trenches. Swimming strictly prohibited.', 'ACTIVE'),
(2, 'Rohtang Pass Steep Avalanche Ridge', 32.3716000, 77.2466000, 1200.00, 'RESTRICTED', 'High altitude avalanche path with loose scree. Requires special army permit.', 'ACTIVE'),
(3, 'Varanasi Manikarnika Cremation Ghat Buffer', 25.3109000, 83.0136000, 250.00, 'RESTRICTED', 'Solemn funeral pyre grounds. Photography and unauthorized drone flights banned.', 'ACTIVE'),
(4, 'Sundarbans Mudflats Wildlife Boundary', 21.9497000, 88.8535000, 1500.00, 'DANGER', 'Active saltwater crocodile and Bengal tiger habitat. No unauthorized foot entry.', 'ACTIVE'),
(5, 'Old Delhi Yamuna Floodplain Shallows', 28.6650000, 77.2450000, 600.00, 'DANGER', 'Monsoon deep water silt sinkholes and non-potable current.', 'ACTIVE');

-- -------------------------------------------------------
-- 6. TRIPS: Active & Completed
-- -------------------------------------------------------
INSERT INTO trips (id, tourist_id, destination, start_time, end_time, status) VALUES
(1, 1, 'Agra Heritage Circuit & Taj Mahal', DATE_SUB(NOW(), INTERVAL 3 HOUR), NULL, 'ACTIVE'),
(2, 2, 'Varanasi Spiritual Ghat Walk', DATE_SUB(NOW(), INTERVAL 5 HOUR), NULL, 'ACTIVE'),
(3, 3, 'Manali Solang Valley Winter Trek', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), 'COMPLETED'),
(4, 4, 'Goa Coastal Exploration', DATE_SUB(NOW(), INTERVAL 1 HOUR), NULL, 'ACTIVE'),
(5, 5, 'Jaipur Pink City Heritage Forts', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), 'COMPLETED');

-- -------------------------------------------------------
-- 7. LOCATION POINTS (GPS Breadcrumbs for Trips)
-- -------------------------------------------------------
INSERT INTO location_points (trip_id, latitude, longitude, accuracy, timestamp) VALUES
(1, 27.1751000, 78.0421000, 5.20, DATE_SUB(NOW(), INTERVAL 120 MINUTE)),
(1, 27.1762000, 78.0435000, 6.10, DATE_SUB(NOW(), INTERVAL 60 MINUTE)),
(1, 27.1770000, 78.0450000, 4.80, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),

(2, 25.3076000, 83.0107000, 8.00, DATE_SUB(NOW(), INTERVAL 180 MINUTE)),
(2, 25.3090000, 83.0120000, 7.50, DATE_SUB(NOW(), INTERVAL 45 MINUTE)),

(4, 15.5520000, 73.7540000, 5.00, DATE_SUB(NOW(), INTERVAL 40 MINUTE)),
(4, 15.5548000, 73.7522000, 6.40, DATE_SUB(NOW(), INTERVAL 5 MINUTE)); -- Proximity to Baga Danger zone!

-- -------------------------------------------------------
-- 8. INCIDENTS (SOS, Geofence breach)
-- -------------------------------------------------------
INSERT INTO incidents (id, tourist_id, trip_id, latitude, longitude, incident_type, priority, description, status, assigned_officer_id, created_at, acknowledged_at) VALUES
(1, 4, 4, 15.5548000, 73.7522000, 'SOS', 'CRITICAL', 'Tourist activated emergency SOS! Proximity to rip-current hazard zone reported.', 'NEW', NULL, DATE_SUB(NOW(), INTERVAL 5 MINUTE), NULL),
(2, 1, 1, 27.1770000, 78.0450000, 'GEOFENCE', 'HIGH', 'Tourist crossed buffer perimeter near eastern gate of monument.', 'ASSIGNED', 1, DATE_SUB(NOW(), INTERVAL 25 MINUTE), DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
(3, 2, 2, 25.3090000, 83.0120000, 'MEDICAL', 'HIGH', 'Heat exhaustion and dehydration reported near Dashashwamedh Ghat.', 'RESOLVED', 2, DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR 50 MINUTE));

-- -------------------------------------------------------
-- 9. INCIDENT STATUS HISTORY
-- -------------------------------------------------------
INSERT INTO incident_status_history (incident_id, changed_by, old_status, new_status, remarks, changed_at) VALUES
(1, 5, NULL, 'NEW', 'Automated SOS panic trigger broadcasted from mobile app.', DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
(2, 1, NULL, 'NEW', 'Automated geofence boundary warning created.', DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
(2, 1, 'NEW', 'ACKNOWLEDGED', 'Command center operator acknowledged alert.', DATE_SUB(NOW(), INTERVAL 22 MINUTE)),
(2, 1, 'ACKNOWLEDGED', 'ASSIGNED', 'Assigned to Inspector Rajesh Sharma (Agra Tourist Police).', DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
(3, 2, 'NEW', 'ASSIGNED', 'Assigned to SI Sunita Rao.', DATE_SUB(NOW(), INTERVAL 2 HOUR 50 MINUTE)),
(3, 2, 'ASSIGNED', 'RESOLVED', 'Paramedics arrived at riverside booth; tourist stabilized.', DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- -------------------------------------------------------
-- 10. NOTIFICATIONS
-- -------------------------------------------------------
INSERT INTO notifications (user_id, incident_id, title, message, is_read) VALUES
(5, 1, 'SOS Alert Received', 'Your emergency SOS has been received. Police officers and local first-responders have been notified.', 0),
(2, 1, 'CRITICAL SOS: Tourist #YL-2026-000104', 'Immediate response required at coordinates 15.5548, 73.7522 near Baga hazard zone.', 0),
(2, 2, 'Assigned Incident #2', 'You have been assigned to monument buffer crossing at Agra.', 1);

-- -------------------------------------------------------
-- 11. AUDIT LOGS
-- -------------------------------------------------------
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_value, new_value) VALUES
(1, 'USER_LOGIN', 'users', 1, NULL, JSON_OBJECT('ip', '127.0.0.1', 'device', 'Chrome/Windows')),
(2, 'INCIDENT_ACKNOWLEDGE', 'incidents', 2, JSON_OBJECT('status', 'NEW'), JSON_OBJECT('status', 'ACKNOWLEDGED')),
(1, 'GEOFENCE_CREATE', 'geo_zones', 1, NULL, JSON_OBJECT('name', 'Baga Beach Rip Current Hazard', 'radius', 400));

-- -------------------------------------------------------
-- 12. RISK PREDICTIONS (AI / ML)
-- -------------------------------------------------------
INSERT INTO risk_predictions (tourist_id, trip_id, risk_score, risk_level, reason, model_version) VALUES
(4, 4, 0.88, 'HIGH', 'Tourist GPS location is within 45m of active rip current zone with declining light.', 'v1.0-rf'),
(1, 1, 0.22, 'LOW', 'Tourist moving within designated well-lit heritage corridor at normal walking speed.', 'v1.0-rf'),
(2, 2, 0.58, 'MEDIUM', 'Dense riverfront pedestrian cluster with elevated ambient temperature.', 'v1.0-rf');
