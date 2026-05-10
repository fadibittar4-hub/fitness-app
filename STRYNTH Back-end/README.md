# Fitness Booking Backend

Node.js + Express backend scaffold for a fitness booking and payment system.

## Tech

- Node.js (ES Modules)
- Express
- dotenv

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
