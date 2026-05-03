# Task Management API

![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0-green?logo=mongodb)
![Docker](https://img.shields.io/badge/Docker-ready-blue?logo=docker)
![License](https://img.shields.io/badge/license-MIT-blue)

A production-ready REST API for task management built with **Node.js**, **TypeScript**, and **MongoDB**. Features JWT authentication with refresh tokens, role-based access control, full CRUD with filtering/pagination, task statistics via MongoDB aggregation, and structured logging.

---

## Features

- **JWT Auth** — access tokens (15m) + refresh tokens (7d) with secure rotation
- **Role-based access** — `admin` sees all tasks; `user` manages only their own
- **Full CRUD** — create, read, update, delete tasks with ownership enforcement
- **Filtering & pagination** — filter by status, priority, full-text search; sort any field
- **Task statistics** — aggregation pipeline returning live KPI counts (total, done, overdue, high-priority)
- **Request validation** — Joi schemas on all endpoints, clean error messages
- **Structured logging** — Winston with daily log rotation (errors + combined)
- **Security** — Helmet, CORS, rate limiting (100 req/15min), MongoDB sanitisation
- **Docker** — single `docker compose up` runs the full stack

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 |
| Language | TypeScript 5.3 |
| Framework | Express.js 4 |
| Database | MongoDB 7 + Mongoose 8 |
| Auth | JWT (jsonwebtoken) |
| Validation | Joi |
| Logging | Winston + daily-rotate-file |
| Testing | Jest + Supertest |
| Container | Docker + docker-compose |

---

## Getting Started

### Option A — Docker (recommended)

```bash
git clone https://github.com/alihassan04ali/task-management-api.git
cd task-management-api
cp .env.example .env        # edit JWT secrets
docker compose up --build
```

API is available at `http://localhost:3000`

### Option B — Local

**Requirements:** Node.js 20+, MongoDB running locally

```bash
git clone https://github.com/alihassan04ali/task-management-api.git
cd task-management-api
npm install
cp .env.example .env        # edit .env values
npm run dev
```

---

## API Reference

### Base URL
```
http://localhost:3000/api/v1
```

### Auth endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | — | Register new user |
| POST | `/auth/login` | — | Login, get tokens |
| POST | `/auth/refresh` | — | Refresh access token |
| POST | `/auth/logout` | ✓ | Invalidate refresh token |
| GET | `/auth/me` | ✓ | Get current user |

### Task endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/tasks` | ✓ | List tasks (paginated, filtered) |
| POST | `/tasks` | ✓ | Create a task |
| GET | `/tasks/stats` | ✓ | Get task statistics |
| GET | `/tasks/:id` | ✓ | Get single task |
| PATCH | `/tasks/:id` | ✓ | Update a task |
| DELETE | `/tasks/:id` | ✓ | Delete a task |

### Query parameters for `GET /tasks`

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (max 100) |
| `status` | string | — | Filter: `todo`, `in_progress`, `done` |
| `priority` | string | — | Filter: `low`, `medium`, `high` |
| `sortBy` | string | `createdAt` | Sort field |
| `order` | string | `desc` | `asc` or `desc` |
| `search` | string | — | Full-text search on title + description |

---

## Example Requests

**Register**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Ali Hassan","email":"ali@example.com","password":"Password123!"}'
```

**Create a task**
```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Deploy API to production","priority":"high","dueDate":"2025-12-31","tags":["devops","backend"]}'
```

**Get tasks with filters**
```bash
curl "http://localhost:3000/api/v1/tasks?status=todo&priority=high&sortBy=dueDate&order=asc&page=1&limit=5" \
  -H "Authorization: Bearer <access_token>"
```

**Get statistics**
```bash
curl http://localhost:3000/api/v1/tasks/stats \
  -H "Authorization: Bearer <access_token>"
```

Response:
```json
{
  "success": true,
  "message": "Task statistics",
  "data": {
    "stats": {
      "total": 24,
      "todo": 10,
      "inProgress": 8,
      "done": 6,
      "highPriority": 5,
      "overdue": 3
    }
  }
}
```

---

## Project Structure

```
src/
├── config/         # App config, DB connection
├── controllers/    # Route handlers (thin layer)
├── middleware/     # Auth, validation, error handler
├── models/         # Mongoose schemas (User, Task)
├── routes/         # Express routers
├── services/       # Business logic
├── types/          # TypeScript interfaces
└── utils/          # Logger, JWT helpers, ApiError
tests/
├── auth.test.ts
└── task.test.ts
```

---

## Running Tests

```bash
npm test                  # run all tests
npm run test:coverage     # with coverage report
```

---

## Environment Variables

See [`.env.example`](.env.example) for all required variables. Key ones:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `PORT` | Server port (default: 3000) |

---

## Author

**Ali Hassan** — Backend Developer  
[LinkedIn](https://www.linkedin.com/in/ali-hassan04) · [GitHub](https://github.com/alihassan04ali)
