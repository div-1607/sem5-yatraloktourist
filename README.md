# Yatra Lok - Smart Tourism & Crowd Safety Platform

![Yatra Lok](https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&auto=format&fit=crop&q=80)

**Yatra Lok** is a modern full-stack tourism web application engineered for safe, immersive travel exploration across India. It features real-time crowd safety telemetry, GPS-enabled emergency SOS alerts, curated tourism categories, and an administrative control panel.

---

## 🌟 Key Features

### 1. Modern Glassmorphism UI
- Deep Navy Blue (`#0A1F44`), Steel Grey, and Amber accents.
- Frosted glass cards with backdrop blur, subtle rim borders, and ambient glow.
- Micro-interactions, scale click effects, and smooth route transitions via Framer Motion.
- Fully responsive across mobile, tablet, and desktop screens.

### 2. Tourist Authentication & Verification
- Comprehensive registration: Name, Age, Gender, Email, Mobile, City, Address, Password.
- **Email OTP Verification**: 6-digit verification code with instant development preview and automated expiry.
- Secure JWT authentication with role authorization (`tourist` and `admin`).
- Forgot Password workflow with OTP verification and password reset.

### 3. Tourist Dashboard
- Profile card with demographic data, verification badge, and profile editing.
- Saved / Favorite destinations bookmarking.
- Personalized recommendations based on user location and top ratings.
- Recent searches tags for quick query re-triggering.
- Real-time national and regional travel advisories.

### 4. Destination Discovery Module
- Hierarchical filtering: **Country &rarr; State &rarr; City**.
- 8 Curated Tourism Categories:
  - 🏞️ **Tourist Places**
  - 🛕 **Temples**
  - 🏰 **Historical Places**
  - 🛍️ **Shopping Areas**
  - 🏛️ **Old Towns**
  - 🏖️ **Beaches**
  - ✈️ **Airports**
  - ☕ **Cafes & Restaurants**
- Rich details view: Image galleries, interactive Leaflet maps with Google Maps routing, visiting hours, entry fees, and traveler reviews.

### 5. Crowd Safety Indicator
- Real-time 3-level density indicator:
  - 🟢 **Green (Low Crowd)**: Capacity < 40%, calm & serene.
  - 🟡 **Yellow (Moderate Rush)**: Capacity 40-75%, lively atmosphere, standard queues.
  - 🔴 **Red (Heavy Rush / Caution)**: Capacity > 75%, peak footfall, heightened safety advisory.
- Animated status badges with pulsating indicator lights.
- Dedicated Crowd Safety Radar dashboard with aggregate analytics and crowd-avoidance tips.

### 6. SOS Emergency Module
- Global floating SOS button accessible across all pages with animated alert glow.
- Safe-trigger modal with HTML5 Geolocation API coordinate acquisition.
- Direct-dial emergency hotlines: **Police (112 / 100)**, **Ambulance (108)**, **Tourist Helpline (1363)**, **Women Safety (1091)**.
- Transmits distress signals directly to the backend with emergency type and notes.

### 7. Comprehensive Admin Control Panel
- Protected route requiring admin privileges.
- Overview analytics: Destinations count, registered tourists, crowd distribution, and active SOS signals.
- Destination Registry: Complete CRUD (Add, Edit, Delete) with image URLs, coordinates, and in-place crowd level overrides.
- Tourist Management: Search users, view profiles, and activate/block accounts.
- Live SOS Monitor: Real-time emergency feed with GPS coordinates, map links, and status resolvers (`Pending` &rarr; `Responding` &rarr; `Resolved`).

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Framer Motion, Leaflet, React-Leaflet, Axios, React Hot Toast |
| **Backend** | Node.js, Express.js, Mongoose ODM, JSON Web Tokens (JWT), bcryptjs, nodemailer, cors, morgan |
| **Database** | MongoDB (Supports standard MongoDB URI / Atlas, with built-in zero-config In-Memory server fallback) |

---

## 🚀 Quick Setup & Launch

### Prerequisites
- Node.js (v18+ recommended, tested on v24)
- npm (v9+)

### 1. Clone or Open Project Directory
```bash
cd "C:\Users\Divyanshi Singh\.gemini\antigravity\scratch\yatra-lok"
```

### 2. Start Backend Server
```bash
cd backend
npm install
npm run dev
```
The backend will boot up at `http://localhost:5000`. If local MongoDB is not running, it will automatically launch the built-in in-memory MongoDB server and seed initial destinations, admin, and tourist accounts!

### 3. Start Frontend Client
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🔐 Default Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@yatralok.com` | `Admin@123` |
| **Verified Tourist** | `tourist@yatralok.com` | `Tourist@123` |

*(Quick-autofill buttons are provided on the Login page for one-tap sign in).*

---

## 📡 Backend API Endpoints

### Authentication & Users
- `POST /api/auth/register` - Create new tourist account (sends OTP)
- `POST /api/auth/verify-otp` - Verify 6-digit OTP code & receive JWT
- `POST /api/auth/resend-otp` - Resend verification code
- `POST /api/auth/login` - Authenticate user & get token
- `POST /api/auth/forgot-password` - Request password reset OTP
- `POST /api/auth/reset-password` - Reset password with OTP
- `GET /api/auth/me` - Get profile of authenticated user
- `PUT /api/users/profile` - Update profile information
- `POST /api/users/favorites/:destId` - Toggle saved destination
- `GET /api/users/favorites` - Get list of saved destinations

### Destinations & Categories
- `GET /api/destinations` - Search & filter with pagination
- `GET /api/destinations/featured` - Get popular destinations for landing page
- `GET /api/destinations/hierarchy` - Get State &rarr; City taxonomy
- `GET /api/destinations/categories` - List tourism categories
- `GET /api/destinations/recommendations` - Smart recommendations
- `GET /api/destinations/:id` - Detailed view with reviews and coordinates

### Reviews
- `GET /api/reviews/:destinationId` - List traveler reviews
- `POST /api/reviews` - Add a review and recalculate destination rating
- `DELETE /api/reviews/:id` - Delete review

### Crowd Safety
- `GET /api/crowd/status` - Aggregate crowd distribution & statistics
- `GET /api/crowd/:destinationId` - Peak hours analysis & safety advisory
- `PUT /api/crowd/:destinationId` - Update crowd level (Admin only)

### Emergency SOS
- `POST /api/sos/create` - Transmit distress signal with GPS coordinates
- `GET /api/sos/active` - Fetch active SOS requests (Admin only)
- `GET /api/sos/all` - List historical SOS requests (Admin only)
- `PATCH /api/sos/:id/status` - Update distress status (Pending / Responding / Resolved)

### Admin Operations
- `GET /api/admin/analytics` - Operational metrics & distribution
- `POST /api/admin/destinations` - Create destination
- `PUT /api/admin/destinations/:id` - Update destination
- `DELETE /api/admin/destinations/:id` - Remove destination
- `GET /api/admin/users` - List registered tourists
- `PATCH /api/admin/users/:id/status` - Block / unblock account

---

## 🗺️ Project Structure

```
yatra-lok/
├── backend/
│   ├── src/
│   │   ├── config/             # DB connection, email transporter, constants
│   │   ├── controllers/        # Controllers for Auth, Users, Destinations, Reviews, Crowd, SOS, Admin
│   │   ├── middleware/         # JWT Auth, Admin check, Error handler
│   │   ├── models/             # User, Destination, Category, Review, CrowdStatus, SOSRequest
│   │   ├── routes/             # Express API routes
│   │   ├── utils/              # OTP generator, token utility, seeder script
│   │   └── server.js           # Server entry point
│   ├── .env.example
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Navbar, Footer, Sidebar, GlassCard, CrowdBadge, FloatingSOS, MapView
│   │   ├── context/            # AuthContext
│   │   ├── pages/              # Landing, Login, Signup, ForgotPassword, Dashboard, Destinations, Crowd, Admin
│   │   ├── services/           # Axios API client
│   │   ├── styles/             # Tailwind & Glassmorphism styles
│   │   ├── App.jsx             # Router & layout
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── package.json                # Root helper commands
└── README.md
```

---

&copy; Yatra Lok. Designed for safe, seamless exploration across India.
