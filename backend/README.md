# BookNSmash Backend

Simple, production-ready backend for the BookNSmash sports platform built with Node.js, Express, and TypeScript.

## Features

- ✅ JWT Authentication (access + refresh tokens)
- ✅ Role-Based Access Control (USER/ADMIN)
- ✅ RESTful API endpoints
- ✅ In-memory data storage (easily replaceable)
- ✅ Input validation with Zod
- ✅ Security headers with Helmet
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ TypeScript with strict mode

## Tech Stack

- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Zod** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin requests

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and update the values (especially JWT secrets for production)

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `JWT_SECRET` | JWT access token secret | (required) |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | (required) |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | User registration | Public |
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/admin/login` | Admin login | Public |
| POST | `/api/auth/refresh` | Refresh access token | Public |
| POST | `/api/auth/logout` | Logout | Public |

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/me` | Get current user | User |
| PUT | `/api/users/me` | Update profile | User |
| GET | `/api/users` | List all users | Admin |
| GET | `/api/users/:id` | Get user by ID | Admin |

### Events

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/events` | List events (filter: sport, status) | Public |
| GET | `/api/events/:id` | Get event details | Public |
| POST | `/api/events` | Create event | Admin |
| PUT | `/api/events/:id` | Update event | Admin |
| DELETE | `/api/events/:id` | Delete event | Admin |
| POST | `/api/events/:id/register` | Register for event | User |
| DELETE | `/api/events/:id/register` | Unregister from event | User |

### Venues

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/venues` | List venues (filter: sport, location) | Public |
| GET | `/api/venues/:id` | Get venue details | Public |
| POST | `/api/venues` | Create venue | Admin |
| PUT | `/api/venues/:id` | Update venue | Admin |
| DELETE | `/api/venues/:id` | Delete venue | Admin |

### Teams

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/teams` | List teams (filter: sport) | Public |
| GET | `/api/teams/:id` | Get team details | Public |
| POST | `/api/teams` | Create team | User |
| PUT | `/api/teams/:id` | Update team | Captain |
| DELETE | `/api/teams/:id` | Delete team | Captain |
| POST | `/api/teams/:id/members` | Add team member | Captain |
| DELETE | `/api/teams/:id/members/:userId` | Remove member | Captain |

### Health Check

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Server health status | Public |

## Authentication Flow

### Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

Response:
```json
{
  "message": "Registration successful",
  "user": { "id": "user-000001", "name": "John Doe", "email": "john@example.com", "role": "USER" },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### Using Protected Endpoints
```bash
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Admin Login
```bash
curl -X POST http://localhost:3000/api/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@booknsmash.com",
    "password": "admin123"
  }'
```

## Default Admin Credentials

- **Email:** `admin@booknsmash.com`
- **Password:** `admin123`

⚠️ **Change these credentials in production!**

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── env.ts              # Environment configuration
│   ├── middleware/
│   │   ├── auth.ts             # JWT authentication
│   │   ├── rbac.ts             # Role-based access control
│   │   ├── validate.ts         # Input validation
│   │   └── errorHandler.ts    # Error handling
│   ├── models/
│   │   ├── User.ts             # User model & storage
│   │   ├── Event.ts            # Event model & storage
│   │   ├── Venue.ts            # Venue model & storage
│   │   └── Team.ts             # Team model & storage
│   ├── routes/
│   │   ├── auth.ts             # Auth endpoints
│   │   ├── users.ts            # User endpoints
│   │   ├── events.ts           # Event endpoints
│   │   ├── venues.ts           # Venue endpoints
│   │   └── teams.ts            # Team endpoints
│   ├── services/
│   │   ├── jwt.ts              # JWT token service
│   │   └── password.ts         # Password hashing
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   ├── utils/
│   │   └── validators.ts       # Zod schemas
│   └── server.ts               # Express app setup
├── .env                        # Environment variables
├── .env.example                # Environment template
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies
└── README.md                   # This file
```

## Security Features

- **JWT Tokens:** Access tokens (15 min) + Refresh tokens (7 days)
- **Password Hashing:** Bcrypt with 10 salt rounds
- **Rate Limiting:** 100 requests per 15 minutes per IP
- **Helmet:** Security headers (XSS, CSP, etc.)
- **CORS:** Configured for frontend origin
- **Input Validation:** Zod schemas for all endpoints
- **Role-Based Access:** USER and ADMIN roles

## Business Rules

### Teams
- One team per user per sport
- Only team captain can update/delete team
- Only team captain can add/remove members
- Captain cannot be removed (must transfer or delete team)

### Events
- Users can register for events
- Events have maximum participant limits
- Registration checks for duplicates and capacity

## Development

### Run in development mode with auto-reload:
```bash
npm run dev
```

### Lint code:
```bash
npm run lint
```

### Format code:
```bash
npm run format
```

## Testing with curl

See the examples in the Authentication Flow section above. More examples:

### Create Event (Admin)
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Summer Cricket Tournament",
    "description": "Annual cricket championship",
    "sport": "cricket",
    "startDate": "2026-03-15",
    "endDate": "2026-03-17",
    "entryFee": 1000,
    "maxParticipants": 16,
    "venueId": "venue-001"
  }'
```

### Create Team
```bash
curl -X POST http://localhost:3000/api/teams \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Thunder Strikers",
    "sport": "cricket"
  }'
```

## Frontend Integration

Update your React frontend's `AuthContext` to call these API endpoints instead of using localStorage. Example:

```javascript
const loginUser = async (email, password) => {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (response.ok) {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setCurrentUser(data.user);
    return { success: true };
  }
  
  return { success: false, message: data.message };
};
```

## Production Deployment

1. Set strong JWT secrets in `.env`
2. Change admin password
3. Build the project: `npm run build`
4. Run: `npm start`
5. Use a process manager like PM2
6. Set up reverse proxy (nginx)
7. Enable HTTPS

## License

MIT

---

Built with ❤️ for BookNSmash Sports Platform
