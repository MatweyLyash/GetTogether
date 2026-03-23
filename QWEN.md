# GetTogether - Event Management Platform

## Project Overview

**GetTogether** is a full-stack event management platform that enables users to create, discover, and manage events. The application features role-based access control (member, organizer, admin), Telegram bot integration for notifications and group linking, QR code scanning for event check-in, and a modern React-based frontend.

### Architecture

The project follows a **monorepo structure** with Docker-based deployment:

```
GetTogether/
├── Back/          # Node.js/Express backend API
├── Front/         # React/TypeScript frontend (Vite)
├── DB/            # Database SQL scripts
├── postgres/      # PostgreSQL initialization scripts
├── qr_test/       # SSL certificates for HTTPS
└── docker-compose.yml
```

### Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Chakra UI, React Router, Vite |
| **Backend** | Node.js, Express, Sequelize ORM |
| **Database** | PostgreSQL 15 |
| **Bot** | Telegram Bot API (node-telegram-bot-api) |
| **Deployment** | Docker, Docker Compose, Nginx (reverse proxy) |
| **Testing** | Jest, supertest, jest-mock-extended |

### Key Features

- **Authentication & Authorization**: JWT-based auth with role-based access (member, organizer, admin)
- **Event Management**: Create, view, register for events with categories and status tracking
- **Telegram Integration**: Bot for account linking, group verification, and notifications
- **QR Code Scanner**: Event check-in functionality
- **Reviews & Ratings**: Users can rate and review events
- **HTTPS Support**: SSL/TLS termination via Nginx

---

## Building and Running

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm

### Docker Deployment (Recommended)

```bash
# Start all services (PostgreSQL, Backend, Frontend)
docker-compose up --build

# Access the application
# Frontend: http://localhost (HTTP) or https://localhost (HTTPS)
# Backend API: http://localhost:5000
# PostgreSQL: localhost:5433
```

### Local Development

#### Backend

```bash
cd Back

# Install dependencies
npm install

# Run migrations and seeders
npm run migrate
npm run seed

# Start development server
npm run dev

# Start production server
npm start
```

#### Frontend

```bash
cd Front/GetTogether

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

#### Run Both Locally

```bash
# From project root
./run_all.sh
```

> **Note**: The script frees ports 3000 and 5000 before starting. Ngrok is currently disabled due to IP restrictions (ERR_NGROK_9040).

### Database Commands

```bash
cd Back

# Run migrations
npm run migrate

# Run seeders
npm run seed

# Undo all migrations
npm run migrate:undo

# Reset database (undo + migrate + seed)
npm run migrate:reset
```

### Testing

```bash
cd Back

# Run tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

---

## Development Conventions

### Project Structure

#### Backend (`Back/`)

```
Back/
├── app.js              # Express app configuration
├── server.js           # Server entry point
├── config/             # Database configuration
├── controllers/        # Request handlers
├── middleware/         # Auth, role, and other middleware
├── models/             # Sequelize models and relations
├── repository/         # Data access layer
├── routes/             # API route definitions
├── services/           # Business logic
├── bot/                # Telegram bot implementation
├── migrations/         # Database migrations
├── seeders/            # Database seeders
└── tests/              # Test files
```

#### Frontend (`Front/`)

```
Front/
├── src/
│   ├── api/            # API client functions
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── AuthContext/    # Authentication context
│   ├── theme/          # Chakra UI theme
│   ├── types/          # TypeScript types
│   └── utils/          # Utility functions
├── public/             # Static assets
└── nginx.conf          # Nginx configuration
```

### Frontend Pages

| Page | Route | Description | Access |
|------|-------|-------------|--------|
| **Home** | `/` | Landing page with hero banner, search, categories carousel, upcoming events, reviews, and CTA | Public |
| **Events** | `/events` | Event catalog with filters (title, location, category, date range, tags) | Public |
| **Event Detail** | `/event/:id` | Single event view with registration, QR code, reviews, organizer info | Public (registration requires auth) |
| **Login/Register** | `/login` | Authentication page with login and registration tabs | Public |
| **Cabinet** | `/cabinet` | User dashboard with tabs: My Events, Organizer Tools, Achievements, Settings | Authenticated |
| **Organizer** | `/organizer/:id` | Organizer public profile page | Public |
| **Admin** | `/admin` | Admin panel: categories, users, organizer requests, events, achievements, tags | Admin only |
| **Scanner** | `/scanner` | QR code scanner for event check-in (organizers only) | Organizers only |
| **Not Found** | `/not-found` | 404 error page | Public |

#### Page Details

**Home (`/pages/Home/Home.tsx`)**
- Hero banner with search by title and location
- Categories grid (navigates to Events with filter)
- Carousel of upcoming events (auto-scrolling)
- Reviews section with mock data
- Call-to-action for unauthenticated users
- Uses Framer Motion animations, Chakra UI, react-slick carousel

**Events (`/pages/Events/Events.tsx`)**
- Full event listing with advanced filtering
- Filters: title, location, category, date range (from/to), tags
- Collapsible filter sidebar (mobile-friendly)
- Active filters display with badges
- Empty state with reset option
- Responsive grid layout (1 column mobile, 2 columns tablet+)

**Event Detail (`/pages/Event/Event.tsx`)**
- Event image, price badge, category, tags
- Organizer info with subscribe buttons
- Event stats: date, location, capacity, price
- Description and Telegram chat link
- Registration flow with modals (confirm, cancel)
- QR code modal for approved registrations
- Reviews section with ratings
- Edit button for organizers
- Past event handling (archived state)

**Login (`/pages/Login/Login.tsx`)**
- Tabbed interface (Login / Register)
- Login: username + password
- Register: username, password (min 8 chars, letters + digits), confirm password
- Framer Motion animations between tabs
- Auto-redirect after login based on role (member→`/`, organizer→`/cabinet`, admin→`/admin`)

**Cabinet (`/pages/Cabinet/Cabinet.tsx`)**
- Multi-tab dashboard for authenticated users
- **My Events Tab**: Future events, past events with review submission
- **Organizer Requests Tab**: Request organizer status, view request status
- **Create/Edit Event Tab**: Event form with image upload, category, tags, date picker
- **My Events Management Tab**: Table of own events with edit/delete, registration requests approval
- **Achievements Tab**: User achievements and progress
- **Settings Tab**: Link Telegram account (with guide modal)
- Telegram link guide modal with step-by-step instructions

**Admin (`/pages/Admin/Admin.tsx`)**
- **Categories Tab**: Add, rename, delete categories
- **Users Tab**: User table with role filter, search, ban/unban, remove organizer role
- **Organizer Requests Tab**: Approve/reject organizer status requests
- **Events Tab**: Admin event management with edit/delete
- **Achievements Tab**: Create/edit/delete achievements with triggers (apply, attend, category), conditions, images
- **Tags Tab**: Add, rename, delete tags
- Mobile-friendly with tab selector dropdown
- Modal confirmations for delete operations

**Scanner (`/pages/Scanner/Scanner.tsx`)**
- QR code scanner using `html5-qrcode` library
- Camera access for scanning participant QR codes
- Real-time verification via API
- Success/error alerts with participant and event details
- Scan history with reset button
- Organizer-only access (role_id === 2)

**Organizer (`/pages/Organizer/Organizer.tsx`)**
- Placeholder page for organizer public profiles
- Currently minimal implementation

**Not Found (`/pages/NotFound/NotFound.tsx`)**
- 404 error page with image
- "Return to Home" button
- Framer Motion animation

### API Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/api/auth` | Authentication endpoints | No |
| `/api/guest` | Guest/public endpoints | No |
| `/api/user` | User-specific endpoints | Yes |
| `/api/organizer` | Organizer endpoints | Yes (organizer) |
| `/api/admin` | Admin endpoints | Yes (admin) |

### Database Schema

**Core Tables:**
- `Role` - User roles (member, organizer, admin)
- `Status` - Generic status table (pending, approved, rejected)
- `Users` - User accounts with login, password hash, Telegram link
- `OrganizerRequest` - Organizer status requests
- `Category` - Event categories
- `Event` - Events with title, description, date, location, capacity
- `EventRegistration` - User-event registrations with status
- `Review` - Event reviews with ratings (1-5)

### Coding Style

- **Backend**: CommonJS modules, async/await for async operations
- **Frontend**: ES modules, TypeScript, React hooks, Chakra UI components
- **Environment Variables**: Use `.env` files (see `Back/.env.test` for example)

### Environment Variables

#### Backend (Production - Docker)

```env
NODE_ENV=production
DB_HOST=postgres
DB_PORT=5433
DB_NAME=gettogether2
DB_USER=postgres
DB_PASSWORD=postgres
PORT=5000
```

#### Frontend (Production)

```env
VITE_API_URL=/api
```

### Telegram Bot

The Telegram bot (`Back/bot/telegramBot.js`) provides:
- `/link <login>` - Link Telegram account to user account
- `/verify <key>` - Verify and link a group to an event (organizer only)
- `/start`, `/help` - Show help menu

**Bot Token**: Stored in `telegramBot.js` (currently hardcoded - should be moved to environment variable for production)

---

## Important Notes

1. **SSL Certificates**: Located in `qr_test/` directory (`cert.pem`, `key.pem`). Required for HTTPS and Docker deployment.

2. **Database Initialization**: The `postgres/init/` directory contains initialization scripts. PostgreSQL data persists in the `postgres_data` Docker volume.

3. **Default Admin User**: Created by seeders with login `admin` (check seeders for default password).

4. **Port Mappings**:
   - PostgreSQL: `5433:5432`
   - Backend: `5000:5000`
   - Frontend: `80:80`, `443:443`

5. **Health Check**: Backend health endpoint available at `/health` (proxied by Nginx).

6. **WebSocket Support**: Nginx configured for WebSocket upgrades (used for real-time features).

---

## Troubleshooting

### Common Issues

- **Port conflicts**: Run `./run_all.sh` to automatically free ports 3000 and 5000
- **Database connection errors**: Ensure PostgreSQL container is healthy (`docker-compose ps`)
- **Telegram bot not responding**: Check bot token validity and network connectivity
- **SSL errors**: Verify certificates in `qr_test/` are valid and properly mounted

### Logs

```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Local development logs
logs/back.log   # Backend logs
logs/front.log  # Frontend logs
```
