# QueueLess — Real-Time Virtual Queue Management System (MVP)

QueueLess is a real-time virtual queue management web platform designed to eliminate physical waiting lines. Service organizations (clinics, salons, diagnostic centers, repair centers, consultation offices) register and manage services, while guest customers join queues remotely with zero friction, get virtual tickets, and track live positions and status via WebSocket.

---

## 1. Problem
Physical service queues waste customer time, create crowded and chaotic waiting areas, and provide poor visibility into waiting order and accurate ETAs. Organizations often struggle with manual paper token slips or disorganized walk-in management.

## 2. Solution
QueueLess transforms physical queues into a live virtual experience:
- **Guest Customers**: Discover services, view live waiting counts and queue status (`OPEN`/`CLOSED`), join with just name and phone, and track live turn progression in real time without creating an account or downloading an app.
- **Organization Owners**: Register an account, manage multiple service queues, open/close queues dynamically, and operate a live dispatch console to call next customers in FIFO order, start serving, complete services, or mark no-shows.

---

## 3. Features
- **Zero-Login Guest Access**: Customers join with name and phone; secured by cryptographic public tokens (`qtk_...`).
- **Live Ticket Tracker**: Dynamic position indicator, status badges, sound chime when called, and auto-sync on reconnect.
- **Strict FIFO Ordering**: Fair sequential queueing with atomic sequence numbers (`GC-001`, `GC-002`).
- **Duplicate Prevention**: Phone number check prevents duplicate active tickets for the same service.
- **Single Operational Ticket Constraint**: Enforces one active called/serving ticket at a time per counter.
- **Queue Open/Close Control**: Closed queues block new joins while allowing existing waiting customers to finish.
- **Real-Time Push Notifications**: Instant Socket.IO event updates across rooms (`ticket:{id}`, `service:{id}`, `owner:{id}`).
- **Responsive Modern UI**: Built with Tailwind CSS, Lucide icons, and modern SaaS layout.

---

## 4. Architecture
Modular monolith architecture combining persistent durability and high-throughput real-time updates:
```text
Customer / Owner Browser
   │                 ▲
   │ (REST Snapshot) │ (Socket.IO Live Events)
   ▼                 │
Express API Backend (Node.js)
   ├── Route -> Validation -> Controller -> Service Layer
   │
   ├── MongoDB (Mongoose)  <-- Durable Source of Truth
   └── Redis (ioredis)     <-- Operational FIFO Lists & Atomic Sequence INCR
```

---

## 5. Technology Stack
- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Lucide React, Axios, Socket.IO Client, Canvas Confetti.
- **Backend**: Node.js, Express, MongoDB, Mongoose, Redis (ioredis), Socket.IO, JWT, bcryptjs, Cookie-Parser, Express-Validator.
- **Runtime & Testing**: Node.js built-in test runner (`node --test`).

---

## 6. Customer & Owner Flows

### Customer Flow
```text
Landing (/) -> Find a Queue (/customer) -> Search/Filter -> Organization Profile (/customer/organizations/:slug) -> Join Queue -> Ticket Tracker (/customer/tickets/:publicToken) -> WAITING -> CALLED -> SERVING -> COMPLETED
```

### Owner Flow
```text
Landing (/) -> Owner Portal (/organization) -> Register/Login -> Organization Setup (/organization/setup) -> Dashboard (/organization/dashboard) -> Service Queue Console (/organization/queues/:serviceId) -> Open Queue -> View Waiting FIFO -> Call Next -> Start Serving -> Complete / No Show
```

---

## 7. Database Models (MongoDB)
- **`User`**: Owner authentication (`email`, `passwordHash`, `role: "OWNER"`, `status: "ACTIVE"`).
- **`Organization`**: Business profile (`ownerId`, `name`, `slug`, `category`, `city`, `address`, `phone`, `description`, `isActive`).
- **`Service`**: Service catalog (`organizationId`, `name`, `ticketPrefix`, `averageServiceTime`, `description`, `isActive`).
- **`Queue`**: 1-to-1 queue state (`serviceId`, `organizationId`, `status: "OPEN"|"CLOSED"`, `currentTicketId`, `lastSequenceNumber`).
- **`Ticket`**: Virtual ticket (`publicToken`, `ticketNumber`, `sequenceNumber`, `customerName`, `customerPhone`, `status: "WAITING"|"CALLED"|"SERVING"|"COMPLETED"|"CANCELLED"|"NO_SHOW"`).

---

## 8. REST API Summary (Base: `/api/v1`)

### Public / Customer
- `GET /organizations?search=&category=&city=` — Search organizations
- `GET /organizations/:slug` — Organization profile & active services
- `GET /services/:serviceId` — Service details
- `GET /services/:serviceId/queue` — Public queue status & waiting count
- `POST /services/:serviceId/queue/join` — Guest joins queue
- `GET /tickets/:publicToken` — Track live ticket
- `POST /tickets/:publicToken/cancel` — Cancel waiting ticket

### Owner Authentication & Dashboard
- `POST /auth/register` — Owner register
- `POST /auth/login` — Owner login
- `POST /auth/logout` — Owner logout
- `GET /auth/me` — Current owner profile
- `GET /owner/dashboard` — Dashboard metrics & queues summary

### Owner Organization & Services
- `POST /organizations` — Create organization
- `GET /organizations/me` — Owner organization
- `PATCH /organizations/:organizationId` — Update organization
- `POST /organizations/:organizationId/services` — Create service (auto-creates closed queue)
- `PATCH /services/:serviceId` — Update service
- `DELETE /services/:serviceId` — Soft-deactivate service

### Queue Operations
- `GET /services/:serviceId/queue/manage` — Full queue console data
- `POST /services/:serviceId/queue/open` — Open queue
- `POST /services/:serviceId/queue/close` — Close queue
- `POST /services/:serviceId/queue/call-next` — Call next ticket (FIFO)
- `POST /tickets/:ticketId/start` — Start serving (CALLED -> SERVING)
- `POST /tickets/:ticketId/complete` — Complete service (SERVING -> COMPLETED)
- `POST /tickets/:ticketId/no-show` — Mark no-show (CALLED -> NO_SHOW)

---

## 9. Redis Operational Engine
- `queue:{serviceId}:waiting` -> Redis List for sub-millisecond FIFO operations (`RPUSH` join, `LPOP` call-next, `LREM` cancel).
- `queue:{serviceId}:sequence` -> Atomic sequence counter (`INCR`).
- **Graceful Fallback & Recovery**: Backend operates seamlessly if Redis is offline with durable MongoDB atomic sequences, and reconstructs Redis lists via `rebuildQueue(serviceId)`.

---

## 10. Socket.IO Real-Time Design
- **Rooms**: `ticket:{ticketId}`, `service:{serviceId}`, `owner:{ownerId}`.
- **Events**: `ticket:positionUpdated`, `ticket:called`, `ticket:serving`, `ticket:completed`, `ticket:cancelled`, `ticket:noShow`, `queue:updated`, `queue:statusChanged`.
- **Reconnect Strategy**: On client reconnection, a REST snapshot is refetched to guarantee data consistency.

---

## 11. Security
- Passwords hashed with `bcryptjs` (salt 10).
- Owner JWT auth stored in secure HTTP-only cookies with bearer token header fallback.
- Server-side tenant isolation enforcing `organization.ownerId == req.user.id`.
- Request body and param validation on all endpoints.
- Standardized error format: `{ success: false, message: "...", errors: [] }`.

---

## 12. Testing
Run backend unit and state machine invariant tests:
```bash
cd backend
npm test
```

---

## 13. Local Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://127.0.0.1:27017` (or MongoDB Atlas URI)
- Redis running locally on `redis://127.0.0.1:6379` (optional)

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
# Backend runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 14. Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/queueless
REDIS_URL=redis://127.0.0.1:6379
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRES_IN=7d
COOKIE_SECRET=your_secure_cookie_secret_key
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SERVER_URL=http://localhost:5000
```

---

## 15. Dockerization (Hardening Phase)
A containerized production deployment can be run with Docker Compose orchestrating Node.js, MongoDB, and Redis containers.

---

## 16. Deployment
- **Frontend**: Deploy on Vercel, Netlify, or Cloudflare Pages.
- **Backend**: Deploy on Render, Railway, AWS ECS, or Fly.io (Node host supporting persistent WebSockets).
- **Database**: MongoDB Atlas.
- **Redis**: Upstash Redis or Redis Cloud.

---

## 17. Smoke Test Verification
1. Owner registers at `/organization/register` and completes organization onboarding.
2. Owner creates service `General Consultation` (Prefix: `GC`) and opens the queue.
3. Guest Customer A opens `/customer/organizations/:slug` in a separate browser tab, joins queue -> receives ticket `GC-001` with position 0 (Next in line).
4. Guest Customer B joins queue -> receives ticket `GC-002` with 1 person ahead (~10 min ETA).
5. Owner sees both in FIFO waiting list, clicks **"Call Next Customer"**.
6. Customer A's screen immediately alerts **"It's your turn!"** with audio chime without page reload.
7. Owner clicks **"Start Serving"** -> customer screen reflects `SERVING`.
8. Owner clicks **"Complete"** -> customer screen shows completion confetti, and Customer B moves to position 0.

---

## 18. Future Roadmap (Post-MVP)
- Staff and multi-counter assignments.
- SMS / WhatsApp turn notifications.
- Multi-branch hierarchy.
- Scheduled appointment queues & calendar integration.
