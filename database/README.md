# YATRALOK DATABASE (MEMBER 3 - DATABASE DEVELOPER)

**Database Name:** `yatralok_db`  
**RDBMS:** MySQL 8.0+ / MariaDB 10.5+  
**Collation:** `utf8mb4_unicode_ci`  

---

## 1. Overview & Purpose
The YatraLok database is the single source of truth for tourist identity verification (Digital Tourist IDs), active GPS route trails, circular geo-fencing definitions (DANGER & RESTRICTED zones), emergency SOS triggers, real-time incident lifecycle states, police dispatches, and audit telemetry.

---

## 2. Directory Structure
```
database/
├── schema.sql              # Complete DDL for all 12 tables and foreign keys
├── seed.sql                # Complete initial seed data with hashed credentials
├── sample_data.sql         # Runner script importing seed.sql
├── indexes.sql             # Performance indices on high-cardinality columns
├── views.sql               # Materialized and reporting SQL views
├── queries.sql             # Standard operational CRUD and business queries
├── analytics_queries.sql   # Aggregate queries for dashboard telemetry
├── er_diagram/
│   ├── yatralok_er_diagram.svg  # Vector diagram
│   └── README.md
└── README.md               # Database Developer Documentation
```

---

## 3. Tables & Schema Specifications

| # | Table Name | Primary Key | Description |
|---|---|---|---|
| 1 | `users` | `id` | Core authentication table (`TOURIST`, `POLICE`, `ADMIN`) |
| 2 | `tourists` | `id` | Tourist profile with unique Digital ID (`YL-2026-000123`) |
| 3 | `police_officers` | `id` | Law enforcement officers with badge and precinct station |
| 4 | `trips` | `id` | Tourist travel sessions (`ACTIVE`, `COMPLETED`) |
| 5 | `location_points` | `id` | Granular GPS breadcrumbs (`lat`, `lng`, `accuracy`, `timestamp`) |
| 6 | `emergency_contacts` | `id` | Up to 3 emergency contacts per tourist for SOS dispatch |
| 7 | `geo_zones` | `id` | Circular geo-fence perimeters (`DANGER`, `RESTRICTED`) |
| 8 | `incidents` | `id` | SOS triggers and alerts with full status machine |
| 9 | `incident_status_history`| `id` | Audit trail of incident lifecycle transitions |
| 10| `notifications` | `id` | In-app alerts delivered to tourists and officers |
| 11| `audit_logs` | `id` | Security audit trail of critical CRUD actions |
| 12| `risk_predictions` | `id` | AI/ML risk scoring output (`LOW`, `MEDIUM`, `HIGH`) |

---

## 4. Setup & Installation Instructions

### Step 1: Log in to MySQL Client
```bash
mysql -u root -p
```

### Step 2: Import the Schema
```sql
SOURCE database/schema.sql;
```

### Step 3: Apply Optimized Indices
```sql
SOURCE database/indexes.sql;
```

### Step 4: Create Views
```sql
SOURCE database/views.sql;
```

### Step 5: Seed Sample Data
```sql
SOURCE database/seed.sql;
```

---

## 5. Default Seed Accounts

All seed user accounts are provisioned with password: **`Password123!`**

- **Admin:** `admin@yatralok.gov.in` (Commander Vikram Malhotra)
- **Police Officers:**
  - `rajesh.police@yatralok.gov.in` (Agra Tourist Police Station)
  - `sunita.police@yatralok.gov.in` (Varanasi Riverfront Outpost)
  - `amit.police@yatralok.gov.in` (Manali Mall Road Patrol)
- **Tourists:**
  - `aarav.patel@gmail.com` (`YL-2026-000101`)
  - `priya.nair@gmail.com` (`YL-2026-000102`)
  - `david.miller@yahoo.com` (`YL-2026-000103`)
  - `ananya.s@outlook.com` (`YL-2026-000104`)
  - `rohan.mehra@gmail.com` (`YL-2026-000105`)

---

## 6. Incident Status Lifecycle
```
NEW ──► ACKNOWLEDGED ──► ASSIGNED ──► EN_ROUTE ──► RESOLVED ──► CLOSED
```
All transitions are automatically preserved in `incident_status_history` for operational compliance.
