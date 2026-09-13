# QueueLess

A real-time virtual queue management system built to eliminate physical waiting lines. Customers can join service queues remotely without creating an account and track their live position via WebSockets. Business owners get a dashboard to manage services, monitor queues, and call customers in FIFO order.

## Features

- **Guest Access**: Customers join with just their name and phone number. No app download or registration needed.
- **Live Ticket Tracker**: Real-time position updates, estimated wait time, and audio alerts when called.
- **Owner Dashboard**: Manage multiple services, toggle queue availability, and call the next ticket in line.
- **Real-Time Sync**: Instant status updates across customer and owner interfaces using Socket.IO.
- **Authentication**: Business owner login via email/password or Google OAuth.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Socket.IO Client, Axios
- **Backend**: Node.js, Express, Socket.IO, JWT
- **Databases**: MongoDB (Mongoose), Redis (optional for high-throughput FIFO queuing)

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB instance (local or Atlas)
- Redis instance (optional; falls back to MongoDB if unavailable)

### 1. Clone the repository

```bash
git clone https://github.com/Anivesh91/queue_test.git
cd queue_test
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/queueless
REDIS_URL=redis://127.0.0.1:6379
JWT_SECRET=your_jwt_secret
COOKIE_SECRET=your_cookie_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

In a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SERVER_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Start the frontend:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## Testing

Run backend tests:

```bash
cd backend
npm test
```

## License

MIT

