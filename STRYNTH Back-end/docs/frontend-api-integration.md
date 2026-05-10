# Frontend API Integration Guide

This document is the single source of truth for connecting the frontend to the STRYNTH backend.

---

## 1) Base URL

```text
http://localhost:5000/api/v1
```

> The backend also exposes legacy aliases (`/auth`, `/sessions`, `/bookings`, `/payments`) but always use the `/api/v1/...` prefix.

---

## 2) Standard Response Format

Every endpoint returns JSON in one of these two shapes.

**Success**
```json
{
  "success": true,
  "message": "Optional message",
  "data": {}
}
```

**Error**
```json
{
  "success": false,
  "message": "Description of the error"
}
```

---

## 3) Authentication

The backend uses **JWT Bearer tokens**.

After login the frontend receives an `access_token`. Send it on every protected route:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 4) Endpoints

### Health Check

#### `GET /health`

No auth required. Use this to confirm the server is up.

**Response**
```json
{
  "success": true,
  "message": "Server is healthy"
}
```

---

### Auth

#### `POST /api/v1/auth/signup`

Create a new account.

**Request body**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "user@example.com",
  "password": "secret123",
  "role": "trainee"
}
```

**Allowed roles:** `admin`, `trainer`, `trainee`, `member` (`member` is normalized to `trainee`)

**All fields are required.**

**Success response**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "user@example.com",
    "role": "trainee",
    "profile_image_url": null,
    "created_at": "2026-04-06T10:00:00.000Z"
  }
}
```

---

#### `POST /api/v1/auth/login`

Login and receive a JWT token.

**Request body**
```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Success response**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "JWT_TOKEN_HERE",
    "user": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "user@example.com",
      "role": "trainee",
      "profile_image_url": null,
      "created_at": "2026-04-06T10:00:00.000Z"
    }
  }
}
```

Store both values after login:
```js
localStorage.setItem("access_token", result.data.access_token);
localStorage.setItem("user", JSON.stringify(result.data.user));
```

---

#### `POST /api/v1/auth/logout`

🔒 Protected.

**Response**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

#### `PATCH /api/v1/auth/me/profile-image`

🔒 Protected. Any authenticated user. Upload or replace your profile image.

Send as `multipart/form-data` with the file under the field name `profile_image`.

- Accepted formats: JPEG, PNG, WebP
- Max size: 5 MB (default)
- Replaces any existing image automatically

**Request (multipart/form-data)**
```
field: profile_image  →  <image file>
```

**Success response**
```json
{
  "success": true,
  "message": "Profile image updated successfully",
  "data": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "user@example.com",
    "role": "trainee",
    "profile_image_url": "/uploads/profile-images/user-1-1746440000000.jpg",
    "created_at": "2026-04-06T10:00:00.000Z"
  }
}
```

To display the image, prepend the base server URL:
```js
const imageUrl = `http://localhost:5000${user.profile_image_url}`;
```

---

### Trainers

---

#### `GET /api/v1/trainers`

🔒 Protected. Returns all users with `role = trainer`, including their profile details.

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane@example.com",
      "role": "trainer",
      "profile_image_url": "/uploads/profile-images/user-2-1746440000000.jpg",
      "created_at": "2026-04-06T10:00:00.000Z",
      "description": "Certified strength coach with 8 years of experience.",
      "specialties": "Strength Training, HIIT, Mobility",
      "years_experience": 8
    }
  ]
}
```

> `description`, `specialties`, and `years_experience` are `null` until the trainer fills in their profile.

---

#### `GET /api/v1/trainers/:id`

🔒 Protected. Returns a single trainer by ID, including their profile details.

**Example**
```text
GET /api/v1/trainers/2
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane@example.com",
    "role": "trainer",
    "profile_image_url": "/uploads/profile-images/user-2-1746440000000.jpg",
    "created_at": "2026-04-06T10:00:00.000Z",
    "description": "Certified strength coach with 8 years of experience.",
    "specialties": "Strength Training, HIIT, Mobility",
    "years_experience": 8
  }
}
```

---

#### `PUT /api/v1/trainers/profile`

🔒 Protected. Trainer only. Create or update the authenticated trainer's profile. All fields are optional — send only what you want to change.

**Request body**
```json
{
  "description": "Certified strength coach with 8 years of experience.",
  "specialties": "Strength Training, HIIT, Mobility",
  "years_experience": 8
}
```

| Field | Type | Rules |
|-------|------|-------|
| `description` | string | Any text |
| `specialties` | string | Comma-separated list, max 500 chars |
| `years_experience` | integer | Non-negative integer |

**Success response** — returns the full updated trainer object (same shape as `GET /api/v1/trainers/:id`).

```json
{
  "success": true,
  "data": {
    "id": 2,
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane@example.com",
    "role": "trainer",
    "profile_image_url": null,
    "created_at": "2026-04-06T10:00:00.000Z",
    "description": "Certified strength coach with 8 years of experience.",
    "specialties": "Strength Training, HIIT, Mobility",
    "years_experience": 8
  }
}
```

---

### Sessions

Sessions are created and managed by trainers. Trainees browse available sessions and book them.

---

#### `GET /api/v1/sessions/available`

🔒 Protected. Returns all sessions that are `available` and have not started yet.

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "trainer_id": 2,
      "trainer_first_name": "Jane",
      "trainer_last_name": "Smith",
      "session_time": "2026-04-10T15:00:00.000Z",
      "status": "available",
      "capacity": 5,
      "price": 49.99,
      "created_at": "2026-04-06T11:00:00.000Z"
    }
  ]
}
```

---

#### `GET /api/v1/sessions/trainer`

🔒 Protected. Trainer only. Returns all sessions created by the authenticated trainer.

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "trainer_id": 2,
      "trainer_first_name": "Jane",
      "trainer_last_name": "Smith",
      "session_time": "2026-04-10T15:00:00.000Z",
      "status": "available",
      "capacity": 5,
      "price": 49.99,
      "created_at": "2026-04-06T11:00:00.000Z"
    }
  ]
}
```

---

#### `POST /api/v1/sessions`

🔒 Protected. Trainer only. Create a new session.

**Request body**
```json
{
  "session_time": "2026-04-20T10:00:00.000Z",
  "capacity": 5,
  "price": 49.99
}
```

- `session_time` must be a future ISO date-time string
- `capacity` must be a positive integer (defaults to `1` if omitted)
- `price` must be a non-negative number (defaults to `0` if omitted)

**Success response**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "trainer_id": 2,
    "session_time": "2026-04-20T10:00:00.000Z",
    "status": "available",
    "capacity": 5,
    "price": 49.99,
    "created_at": "2026-04-06T11:00:00.000Z"
  }
}
```

---

#### `PATCH /api/v1/sessions/:id`

🔒 Protected. Trainer only. Update a session you own. Send only the fields you want to change.

**Request body** (all fields optional)
```json
{
  "session_time": "2026-04-21T10:00:00.000Z",
  "capacity": 8,
  "status": "cancelled",
  "price": 59.99
}
```

**Allowed status values:** `available`, `booked`, `completed`, `cancelled`

---

#### `DELETE /api/v1/sessions/:id`

🔒 Protected. Trainer only. Delete a session you own.

**Response**
```json
{
  "success": true,
  "message": "Session deleted successfully"
}
```

**Error cases**
| Status | Reason |
|--------|--------|
| `403` | Session belongs to a different trainer |
| `404` | Session not found |
| `409` | Session has confirmed bookings and cannot be deleted |

---

### Bookings

#### Booking lifecycle

| Status | When it is set |
|--------|---------------|
| `confirmed` | Immediately when the payment succeeds — booking and payment are created atomically |
| `cancelled` | When the user cancels the booking |

> There is no `pending` state. A booking either exists as `confirmed` (payment received) or it does not exist at all. There is no expiry timer.

---

#### `POST /api/v1/bookings/pay`

🔒 Protected. Book a session and pay in a single atomic request. The spot is only claimed if the payment succeeds. If two users submit simultaneously for the last spot, only one will succeed.

**Request body**
```json
{
  "session_id": 10,
  "amount": 49.99,
  "payment_method": "card"
}
```

- `session_id` must reference an existing `available` session
- The session must not have already started
- You cannot book the same session twice
- `amount` must be a positive number
- `payment_method`: use `fail`, `failed`, `declined`, or `mock_fail` to simulate a declined payment (returns `402`)

**Success response**
```json
{
  "success": true,
  "message": "Booking confirmed and payment received",
  "data": {
    "id": 5,
    "user_id": 1,
    "user_first_name": "John",
    "user_last_name": "Doe",
    "trainer_first_name": "Jane",
    "trainer_last_name": "Smith",
    "booking_id": 1,
    "amount": 49.99,
    "payment_method": "card",
    "status": "paid",
    "created_at": "2026-04-06T11:05:00.000Z"
  }
}
```

**Declined payment response (402)**
```json
{
  "success": false,
  "message": "Payment was declined"
}
```

---

#### `GET /api/v1/bookings/my`

🔒 Protected. Returns all bookings for the authenticated user.

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "session_id": 10,
      "status": "confirmed",
      "created_at": "2026-04-06T11:00:00.000Z",
      "session": {
        "id": 10,
        "trainer_id": 2,
        "trainer_first_name": "Jane",
        "trainer_last_name": "Smith",
        "session_time": "2026-04-10T15:00:00.000Z",
        "status": "available",
        "capacity": 5
      }
    }
  ]
}
```

---

#### `GET /api/v1/bookings/trainer`

🔒 Protected. Trainer only. Returns all `confirmed` bookings for sessions owned by the authenticated trainer.

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 3,
      "user_first_name": "John",
      "user_last_name": "Doe",
      "session_id": 10,
      "status": "confirmed",
      "created_at": "2026-04-06T11:00:00.000Z",
      "session": {
        "id": 10,
        "session_time": "2026-04-10T15:00:00.000Z",
        "status": "available",
        "capacity": 5,
        "price": 49.99
      }
    }
  ]
}
```

---

#### `DELETE /api/v1/bookings/:id`

🔒 Protected. Cancel one of your own bookings.

**Example**
```text
DELETE /api/v1/bookings/1
```

**Response**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "user_first_name": "John",
    "user_last_name": "Doe",
    "session_id": 10,
    "status": "cancelled",
    "created_at": "2026-04-06T11:00:00.000Z",
    "session": {
      "id": 10,
      "trainer_id": 2,
      "trainer_first_name": "Jane",
      "trainer_last_name": "Smith",
      "session_time": "2026-04-10T15:00:00.000Z",
      "status": "available",
      "capacity": 5,
      "price": 49.99
    }
  }
}
```

---

### Admin

> All admin endpoints require a JWT token where `role = "admin"`. Any other role receives `403 Forbidden`.

---

#### `GET /api/v1/admin/users`

🔒 Protected. Admin only. Returns every user in the system (trainers and trainees).

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "role": "trainee",
      "profile_image_url": null,
      "created_at": "2026-04-06T10:00:00.000Z"
    },
    {
      "id": 2,
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane@example.com",
      "role": "trainer",
      "profile_image_url": "/uploads/profile-images/user-2-1746440000000.jpg",
      "created_at": "2026-04-06T10:00:00.000Z"
    }
  ]
}
```

---

#### `GET /api/v1/admin/bookings`

🔒 Protected. Admin only. Returns all bookings across all users, including session and trainer details.

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "user_first_name": "John",
      "user_last_name": "Doe",
      "session_id": 10,
      "status": "confirmed",
      "created_at": "2026-04-06T11:00:00.000Z",
      "session": {
        "id": 10,
        "trainer_id": 2,
        "trainer_first_name": "Jane",
        "trainer_last_name": "Smith",
        "session_time": "2026-04-10T15:00:00.000Z",
        "status": "booked",
        "capacity": 5,
        "price": 49.99
      }
    }
  ]
}
```

---

#### `GET /api/v1/admin/sessions`

🔒 Protected. Admin only. Returns all sessions across all trainers.

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "trainer_id": 2,
      "trainer_first_name": "Jane",
      "trainer_last_name": "Smith",
      "session_time": "2026-04-10T15:00:00.000Z",
      "status": "booked",
      "capacity": 5,
      "price": 49.99,
      "created_at": "2026-04-06T11:00:00.000Z"
    }
  ]
}
```

---

#### `PUT /api/v1/admin/users/:id`

🔒 Protected. Admin only. Edit any user's basic information. All fields are optional.

**Example**
```text
PUT /api/v1/admin/users/3
```

**Request body**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "role": "trainer"
}
```

| Field | Type | Rules |
|-------|------|-------|
| `first_name` | string | Cannot be empty |
| `last_name` | string | Cannot be empty |
| `email` | string | Must contain `@` |
| `role` | string | `member`, `trainer`, or `admin` |

**Success response** — returns the full updated user object.

```json
{
  "success": true,
  "data": {
    "id": 3,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "role": "trainer",
    "profile_image_url": null,
    "created_at": "2026-04-06T10:00:00.000Z"
  }
}
```

---

#### `PUT /api/v1/admin/trainers/:id/profile`

🔒 Protected. Admin only. Edit any trainer's profile details. The user must have `role = trainer`. All fields are optional.

**Example**
```text
PUT /api/v1/admin/trainers/2/profile
```

**Request body**
```json
{
  "description": "Certified strength coach with 8 years of experience.",
  "specialties": "Strength Training, HIIT, Mobility",
  "years_experience": 8
}
```

**Success response** — returns the full updated trainer object (same shape as `GET /api/v1/trainers/:id`).

**Error cases**
| Status | Reason |
|--------|--------|
| `400` | User exists but is not a trainer |
| `404` | User not found |

---

#### `PUT /api/v1/admin/sessions/:id`

🔒 Protected. Admin only. Edit any session regardless of which trainer owns it. All fields are optional.

**Example**
```text
PUT /api/v1/admin/sessions/10
```

**Request body**
```json
{
  "session_time": "2026-04-21T10:00:00.000Z",
  "status": "cancelled",
  "capacity": 10,
  "price": 59.99
}
```

**Allowed status values:** `available`, `booked`, `completed`, `cancelled`

**Success response** — returns the updated session object.

**Error cases**
| Status | Reason |
|--------|--------|
| `404` | Session not found |

---

### Payments

---

#### `GET /api/v1/payments/:id`

🔒 Protected. Get a payment by ID. You can only access your own payments (admins can access any).

**Response**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "user_id": 1,
    "user_first_name": "John",
    "user_last_name": "Doe",
    "trainer_first_name": "Jane",
    "trainer_last_name": "Smith",
    "booking_id": 1,
    "amount": 49.99,
    "payment_method": "card",
    "status": "paid",
    "created_at": "2026-04-06T11:05:00.000Z"
  }
}
```

---

## 5) Frontend API Helper

```js
const API_BASE_URL = "http://localhost:5000/api/v1";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}
```

**Signup**
```js
await apiRequest("/auth/signup", {
  method: "POST",
  body: JSON.stringify({
    first_name: "John",
    last_name: "Doe",
    email: "user@example.com",
    password: "secret123",
    role: "trainee",
  }),
});
```

**Login**
```js
const result = await apiRequest("/auth/login", {
  method: "POST",
  body: JSON.stringify({ email: "user@example.com", password: "secret123" }),
});
localStorage.setItem("access_token", result.data.access_token);
localStorage.setItem("user", JSON.stringify(result.data.user));
```

**Browse available sessions**
```js
const sessions = await apiRequest("/sessions/available");
```

**Get all trainers**
```js
const trainers = await apiRequest("/trainers");
```

**Get a single trainer**
```js
const trainer = await apiRequest("/trainers/2");
```

**Book a session and pay**
```js
const payment = await apiRequest("/bookings/pay", {
  method: "POST",
  body: JSON.stringify({ session_id: 10, amount: 49.99, payment_method: "card" }),
});
```

**My bookings**
```js
const bookings = await apiRequest("/bookings/my");
```

**Upload profile image**
```js
const formData = new FormData();
formData.append("profile_image", fileInput.files[0]);

const token = localStorage.getItem("access_token");
const response = await fetch("http://localhost:5000/api/v1/auth/me/profile-image", {
  method: "PATCH",
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});
const result = await response.json();
// result.data.profile_image_url contains the path, prepend the server base URL to display it
```

**Trainer: update own profile**
```js
await apiRequest("/trainers/profile", {
  method: "PUT",
  body: JSON.stringify({
    description: "Certified strength coach with 8 years of experience.",
    specialties: "Strength Training, HIIT, Mobility",
    years_experience: 8,
  }),
});
```

**Admin: get all users**
```js
const users = await apiRequest("/admin/users");
```

**Admin: get all bookings**
```js
const bookings = await apiRequest("/admin/bookings");
```

**Admin: get all sessions**
```js
const sessions = await apiRequest("/admin/sessions");
```

**Admin: update a user**
```js
await apiRequest("/admin/users/3", {
  method: "PUT",
  body: JSON.stringify({ role: "trainer" }),
});
```

**Admin: update a trainer's profile**
```js
await apiRequest("/admin/trainers/2/profile", {
  method: "PUT",
  body: JSON.stringify({ description: "Updated bio", years_experience: 5 }),
});
```

**Admin: update a session**
```js
await apiRequest("/admin/sessions/10", {
  method: "PUT",
  body: JSON.stringify({ status: "cancelled" }),
});
```

---

## 6) Suggested Frontend Flow (Trainee)

1. Sign up or log in → store `access_token`
2. Browse trainers on home page → `GET /api/v1/trainers`
3. Browse sessions → `GET /api/v1/sessions/available`
4. Book and pay in one step → `POST /api/v1/bookings/pay`
5. View your bookings → `GET /api/v1/bookings/my`
6. View a payment receipt → `GET /api/v1/payments/:id`

## 6b) Suggested Frontend Flow (Trainer)

1. Log in → store `access_token`
2. Upload a profile image → `PATCH /api/v1/auth/me/profile-image`
3. Fill in profile details → `PUT /api/v1/trainers/profile`
4. Create a session → `POST /api/v1/sessions`
5. View your sessions → `GET /api/v1/sessions/trainer`
6. View bookings on your sessions → `GET /api/v1/bookings/trainer`
7. Update or delete a session → `PATCH /api/v1/sessions/:id` / `DELETE /api/v1/sessions/:id`

## 6c) Suggested Frontend Flow (Admin)

1. Log in → store `access_token`
2. View all users → `GET /api/v1/admin/users`
3. Edit a user's info or role → `PUT /api/v1/admin/users/:id`
4. Edit a trainer's profile → `PUT /api/v1/admin/trainers/:id/profile`
5. View all sessions → `GET /api/v1/admin/sessions`
6. Edit any session → `PUT /api/v1/admin/sessions/:id`
7. View all bookings → `GET /api/v1/admin/bookings`

## 6c) Suggested Frontend Flow (Admin)

1. Log in with an admin account → store `access_token`
2. View all users → `GET /api/v1/admin/users`
3. View all sessions → `GET /api/v1/admin/sessions`
4. View all bookings → `GET /api/v1/admin/bookings`

---

## 7) CORS

If your frontend runs on a different origin (e.g. `http://localhost:3000`), add CORS support in the backend:

```js
import cors from "cors";
app.use(cors({ origin: "http://localhost:3000" }));
```

---

## 8) Pre-launch Checklist

- [ ] Backend running on port `5000`
- [ ] Database connected and migrated (`users` table has `first_name`, `last_name`, `profile_image_url`)
- [ ] `access_token` stored after login
- [ ] All protected routes send `Authorization: Bearer <token>`
- [ ] Signup sends `first_name`, `last_name`, `email`, `password`, `role`
- [ ] Book+pay sends `session_id`, `amount`, `payment_method` to `POST /api/v1/bookings/pay`
- [ ] Profile image upload uses `multipart/form-data` with field name `profile_image` (do **not** set `Content-Type` manually — the browser sets it with the boundary)
- [ ] Display profile images by prepending `http://localhost:5000` to `profile_image_url`
- [ ] Admin routes are only called with a token where `role = "admin"`

---

## 9) All Endpoints Reference

| Method | Path | Auth | Role |
|--------|------|------|------|
| `GET` | `/health` | No | Any |
| `POST` | `/api/v1/auth/signup` | No | Any |
| `POST` | `/api/v1/auth/login` | No | Any |
| `POST` | `/api/v1/auth/logout` | Yes | Any |
| `PATCH` | `/api/v1/auth/me/profile-image` | Yes | Any |
| `GET` | `/api/v1/trainers` | Yes | Any |
| `GET` | `/api/v1/trainers/:id` | Yes | Any |
| `GET` | `/api/v1/sessions/available` | Yes | Any |
| `GET` | `/api/v1/sessions/trainer` | Yes | Trainer |
| `POST` | `/api/v1/sessions` | Yes | Trainer |
| `PATCH` | `/api/v1/sessions/:id` | Yes | Trainer |
| `DELETE` | `/api/v1/sessions/:id` | Yes | Trainer |
| `POST` | `/api/v1/bookings/pay` | Yes | Any |
| `GET` | `/api/v1/bookings/my` | Yes | Any |
| `GET` | `/api/v1/bookings/trainer` | Yes | Trainer |
| `DELETE` | `/api/v1/bookings/:id` | Yes | Any |
| `GET` | `/api/v1/payments/:id` | Yes | Any |
| `GET` | `/api/v1/admin/users` | Yes | Admin |
| `GET` | `/api/v1/admin/bookings` | Yes | Admin |
| `GET` | `/api/v1/admin/sessions` | Yes | Admin |
