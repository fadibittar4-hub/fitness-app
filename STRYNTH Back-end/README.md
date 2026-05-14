# STRYNTH — Backend

Node.js / Express REST API for the STRYNTH fitness booking platform.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22 (ESM modules) |
| Framework | Express 5 |
| Database | MySQL 8 via `mysql2` |
| Auth | JWT (`jsonwebtoken`) + `bcrypt` password hashing |
| File uploads | `multer` (multipart/form-data) |
| Config | `dotenv` |
| Container | Docker (node:22-alpine) |

---

## Project Structure

```
src/
  server.js               — entry point, starts HTTP server
  app.js                  — Express app setup, CORS, route registration, error handler
  config/
    db.js                 — MySQL connection pool (mysql2/promise)
  routes/
    auth.routes.js
    booking.routes.js
    payment.routes.js
    session.routes.js
    trainer.routes.js
    admin.routes.js
  controllers/            — thin HTTP handlers, delegate to services
  services/               — business logic, validation
  repositories/           — all SQL queries
  middleware/
    auth.middleware.js    — JWT verification, populates req.user
    upload.middleware.js  — multer config (JPEG/PNG/WebP, 5 MB limit)
    errorHandler.js       — centralised error → JSON response
  models/                 — shared data-shape helpers
  utils/
    serviceHelpers.js     — buildError, validatePositiveId, resolveAuthenticatedUserId
database/
  schema.mysql.sql        — full DDL (CREATE TABLE statements)
uploads/
  profile-images/         — served as static files at /uploads/
```

---

## Database Schema

```
users            id, first_name, last_name, email, password_hash, role, profile_image_url, created_at
trainer_profiles id, user_id, description, specialties, years_experience
sessions         id, trainer_id, session_time, status, capacity, price, created_at
bookings         id, user_id, session_id, status, created_at
payments         id, user_id, booking_id, amount, payment_method, status, created_at
```

All tables use `InnoDB`, `utf8mb4_unicode_ci`, and foreign key constraints with cascade deletes.

---

## API Overview

Base path: `/api/v1`

| Method | Path | Auth | Role |
|--------|------|------|------|
| GET | `/health` | No | — |
| POST | `/api/v1/auth/signup` | No | — |
| POST | `/api/v1/auth/login` | No | — |
| POST | `/api/v1/auth/logout` | Yes | Any |
| PATCH | `/api/v1/auth/me/profile-image` | Yes | Any |
| GET | `/api/v1/trainers` | Yes | Any |
| GET | `/api/v1/trainers/:id` | Yes | Any |
| PUT | `/api/v1/trainers/profile` | Yes | Trainer |
| GET | `/api/v1/sessions/available` | Yes | Any |
| GET | `/api/v1/sessions/trainer` | Yes | Trainer |
| POST | `/api/v1/sessions` | Yes | Trainer |
| PATCH | `/api/v1/sessions/:id` | Yes | Trainer |
| DELETE | `/api/v1/sessions/:id` | Yes | Trainer |
| POST | `/api/v1/bookings/pay` | Yes | Any |
| GET | `/api/v1/bookings/my` | Yes | Any |
| GET | `/api/v1/bookings/trainer` | Yes | Trainer |
| DELETE | `/api/v1/bookings/:id` | Yes | Any |
| GET | `/api/v1/payments/:id` | Yes | Any |
| GET | `/api/v1/admin/users` | Yes | Admin |
| GET | `/api/v1/admin/bookings` | Yes | Admin |
| GET | `/api/v1/admin/sessions` | Yes | Admin |
| PUT | `/api/v1/admin/users/:id` | Yes | Admin |
| PUT | `/api/v1/admin/trainers/:id/profile` | Yes | Admin |
| PUT | `/api/v1/admin/sessions/:id` | Yes | Admin |

All responses follow a consistent envelope:

```json
{ "success": true,  "data": {} }
{ "success": false, "message": "Description" }
```

---

## Key Implementation Details

### Atomic book-and-pay

`POST /api/v1/bookings/pay` creates a booking and a payment record in a single MySQL transaction with a `SELECT … FOR UPDATE` row lock. Two simultaneous requests for the last spot are serialised — only one succeeds.

### Mock payment

Any `payment_method` value except `fail`, `failed`, `declined`, or `mock_fail` is treated as successful and stored as `status = 'paid'`. Free sessions (`amount = 0`) are fully supported.

### Session auto-status

When confirmed bookings reach the session's capacity, the session row is updated to `status = 'booked'` inside the same transaction. It will no longer appear in `GET /sessions/available`.

### Auth middleware

`authenticateToken` verifies the JWT, normalises the user id to an integer, and attaches `req.user`. Role-based access is enforced per-route via `authorizeRoles()` or inline role checks in services.

### Profile images

Uploaded via `PATCH /api/v1/auth/me/profile-image` as `multipart/form-data`. Files are stored at `uploads/profile-images/user-{id}-{timestamp}.{ext}` and served as static files. The previous image is deleted on replacement.

---

## Environment Variables

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=strynth
DB_USER=root
DB_PASSWORD=yourpassword
JWT_SECRET=change_me_in_production
PORT=5000
NODE_ENV=production
```

---

## Running Locally (without Docker)

```bash
cd "STRYNTH Back-end"
npm install
# Create .env with the variables above
# Apply the schema:  mysql -u root -p < database/schema.mysql.sql
node src/server.js
```

Requires MySQL 8+ with the `strynth` database created from `database/schema.mysql.sql`.

---

## Docker

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
RUN mkdir -p uploads/profile-images
EXPOSE 5000
CMD ["node", "src/server.js"]
```

The `uploads/` directory is bind-mounted at runtime so profile images persist across container restarts.

---

## CORS

Allowed origins: `http://localhost:4200` (Angular dev server) and `http://localhost` (Docker / nginx).

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Structure

```text
src/
  app.js
  server.js
  routes/
  controllers/
  services/
  repositories/
  models/
  middleware/
  config/
```

## Notes

- `src/config/db.js` prepares environment-based configuration for either MySQL or PostgreSQL.
- No DB connection logic is implemented yet by design.
