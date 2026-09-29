# YatraLok ER Diagram Documentation

This directory contains the Entity-Relationship (ER) diagram for the `yatralok_db` relational database.

- Vector SVG: `yatralok_er_diagram.svg`
- Schema Source: `../schema.sql`

## Key Entities & Multiplicities:
1. `users` (1) ── (1) `tourists`
2. `users` (1) ── (1) `police_officers`
3. `users` (1) ── (N) `audit_logs`
4. `tourists` (1) ── (N) `trips`
5. `trips` (1) ── (N) `location_points`
6. `tourists` (1) ── (1..3) `emergency_contacts`
7. `tourists` (1) ── (N) `incidents`
8. `police_officers` (1) ── (N) `incidents` (assigned)
9. `incidents` (1) ── (N) `incident_status_history`
10. `incidents` (1) ── (N) `notifications`
11. `geo_zones` (Spatial circles evaluated against `location_points`)
12. `risk_predictions` (1..N AI predictions per tourist trip)
