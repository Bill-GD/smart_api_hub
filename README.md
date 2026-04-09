# Smart API Hub

## Tech Stack

- Node.js + TypeScript + Express
- PostgreSQL + Knex
- Swagger UI for API documentation
- Docker (via `Dockerfile`)

## Prerequisites

- Node.js 20+
- npm
- PostgreSQL 18
- Docker (optional, for container deployment)

## Environment Setup

- Write a `.env` file based on `.env.example`, with values matching your local/database environment.

## Run Locally

Install dependencies:

```bash
npm install
```

Run in development mode:

```bash
npm run dev
```

Build and run production mode:

```bash
npm run build
npm start
```

By default, the app runs on `http://localhost:3000` when `PORT=3000`.
If you see the app running on port `2000`, that means `.env` was not registered correctly.

## Docker Deployment

Build image from `Dockerfile`:

```bash
docker build -t smart-api-hub:<tag> .
```

Run container:

```bash
docker run --name smart-api-hub:<tag> \
  -p 3000:3000 \
  --env-file .env \
  smart-api-hub
```

## API Documentation (Swagger UI)

After starting the server, open `http://localhost:3000/api-docs`, by either direct URL
or clicking the link shown in `http://localhost:3000`.

Base endpoints:

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- Dynamic resource routes: `/:resource` and `/:resource/:id` (examples: `/users`, `/posts`, `/comments`)

## Postman Collection

This repository includes the exported Postman collection: `smart-api-hub.postman_collection.json`

### How to use it

1. Open Postman.
2. Click **Import**.
3. Select `smart-api-hub.postman_collection.json` from the project root.
4. Create or select an environment with variables like:
  - `baseUrl` = `http://localhost:3000`
  - `resource` = `users`, `posts`, or `comments`
  - `id` = `1`
  - `token` = your JWT access token (automatically added to the environment after login)

### Request URL pattern

Use these reusable URLs in the collection. Change `{{resource}}` and `{{id}}` per request:

- `{{baseUrl}}/health`
- `{{baseUrl}}/auth/register`
- `{{baseUrl}}/auth/login`
- `{{baseUrl}}/{{resource}}`
- `{{baseUrl}}/{{resource}}/{{id}}`

For example:

- `{{baseUrl}}/users`
- `{{baseUrl}}/posts/1`
- `{{baseUrl}}/comments/5`

## Running Tests

```bash
npm run test
npm run test:cov
```
