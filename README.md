# bookmark-server

Node + Express + PostgreSQL (Neon) backend for the Bookmarkly frontend.

## Stack

- **Express** — HTTP server and routing
- **pg** — raw SQL against PostgreSQL (no ORM)
- **Neon** — serverless PostgreSQL host
- **jsonwebtoken + bcryptjs** — login and password hashing
- **cheerio** — scrapes `<title>` / `og:image` when a bookmark is created
- **tsx** — runs TypeScript directly (dev and prod)

## Endpoints

All responses are JSON. Base path: `/api`.

Interactive docs (Swagger UI): `/api/docs`, raw OpenAPI spec: `/api/docs.json`
(source: `src/docs/openapi.ts` — update it when routes change).

| Method | Path                            | Body                                   | Notes                                    |
| ------ | ------------------------------- | -------------------------------------- | ---------------------------------------- |
| POST   | `/api/auth/login`               | `{ email, password }`                  | Returns `{ token }` (JWT)                |
| GET    | `/api/auth/profile`             | —                                      | Bearer token; `{ email, name }`          |
| GET    | `/api/profile`                  | —                                      | Bearer token; `{ name }`                 |
| GET    | `/api/categories`               | —                                      | Array of categories                      |
| POST   | `/api/categories`               | `{ name, alias }`                      | Creates a category                       |
| PUT    | `/api/categories/:id`           | `{ name, alias }`                      | Updates a category                       |
| DELETE | `/api/categories/:id`           | —                                      | Deletes a category (+ bookmarks)         |
| GET    | `/api/categories/:id/bookmarks` | —                                      | Bookmarks of one category                |
| POST   | `/api/bookmarks`                | `{ category_id, url, title?, image? }` | Missing title/image scraped from the URL |
| DELETE | `/api/bookmarks/:id`            | —                                      | Deletes a bookmark                       |

> Reads and writes are open (no token required), matching the original demo
> backend. Login validates credentials and hands out a JWT; enforcing it on the
> other routes is a later step — see `src/middleware/async-handler.ts` for where
> an `authRequired` guard would plug in.

## Local setup

```bash
npm install
cp .env.example .env      # then paste your Neon connection string into DATABASE_URL
npm run db:reset          # create tables + seed demo data
npm run dev               # http://localhost:3000
```

Use the **pooled** Neon connection string (the host contains `-pooler`).

## Scripts

- `npm run dev` — start with watch/reload
- `npm start` — start once (used in production)
- `npm run type-check` — TypeScript check, no emit
- `npm run db:migrate` — create tables (idempotent)
- `npm run db:seed` — wipe and reload demo data
- `npm run db:reset` — migrate + seed

## Deploy to Render

1. Push this folder to its own GitHub repo.
2. Render → **New → Blueprint** and pick the repo (uses `render.yaml`), or
   **New → Web Service** with Build `npm install` and Start `npm start`.
3. Set environment variables: `DATABASE_URL` (Neon pooled string),
   `SEED_USER_EMAIL`, `SEED_USER_PASSWORD`, `SEED_USER_NAME`. `JWT_SECRET` is
   generated automatically by the blueprint.
4. After the first deploy, run `npm run db:reset` once from the Render Shell
   (or locally against the same database) to create and seed the tables.
5. Point the frontend at the deployed URL: set `API_BASE` in
   `bookmark-app/src/constants.ts` to `https://<your-service>.onrender.com/api`.
