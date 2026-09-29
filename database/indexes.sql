-- =======================================================
-- YATRALOK DATABASE INDEXES
-- Optimizes query performance for high-concurrency GPS and incident flows
-- =======================================================

USE yatralok_db;

-- 1. Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

-- 2. Tourists table indexes
CREATE INDEX idx_tourists_digital_id ON tourists(digital_id);
CREATE INDEX idx_tourists_user_id ON tourists(user_id);

-- 3. Police Officers table indexes
CREATE INDEX idx_police_badge ON police_officers(badge_number);
CREATE INDEX idx_police_station ON police_officers(station_name);

-- 4. Trips table indexes
CREATE INDEX idx_trips_tourist_id ON trips(tourist_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_start_time ON trips(start_time);

-- 5. Location Points table indexes
CREATE INDEX idx_location_trip_id ON location_points(trip_id);
CREATE INDEX idx_location_timestamp ON location_points(timestamp);
CREATE INDEX idx_location_trip_timestamp ON location_points(trip_id, timestamp DESC);

-- 6. Emergency Contacts table indexes
CREATE INDEX idx_contacts_tourist_id ON emergency_contacts(tourist_id);

-- 7. Geo Zones table indexes
CREATE INDEX idx_geozones_status ON geo_zones(status);
CREATE INDEX idx_geozones_type ON geo_zones(zone_type);
CREATE INDEX idx_geozones_status_type ON geo_zones(status, zone_type);

-- 8. Incidents table indexes
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_tourist_id ON incidents(tourist_id);
CREATE INDEX idx_incidents_trip_id ON incidents(trip_id);
CREATE INDEX idx_incidents_created_at ON incidents(created_at);
CREATE INDEX idx_incidents_officer_id ON incidents(assigned_officer_id);
CREATE INDEX idx_incidents_type_status ON incidents(incident_type, status);

-- 9. Incident Status History table indexes
CREATE INDEX idx_status_history_incident ON incident_status_history(incident_id);
CREATE INDEX idx_status_history_changed_at ON incident_status_history(changed_at);

-- 10. Notifications table indexes
CREATE INDEX idx_notif_user_unread ON notifications(user_id, is_read);

-- 11. Audit Logs table indexes
CREATE INDEX idx_audit_user_action ON audit_logs(user_id, action);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);

-- 12. Risk Predictions table indexes
CREATE INDEX idx_risk_tourist_created ON risk_predictions(tourist_id, created_at DESC);
CREATE INDEX idx_risk_level ON risk_predictions(risk_level);
