# XWZ Kigali Parking System Architecture

## Overview

The upgraded XWZ parking system is split into a fullstack monorepo with clear ownership boundaries:

- `apps/web`: Next.js frontend for admins and parking attendants.
- `apps/api`: NestJS REST API for authentication, parking management, car entry/exit, billing, and reports.
- `packages/database`: Prisma/PostgreSQL package owned by `@workspace/db`.
- `packages/ui`: shared UI primitives.

## Runtime Flow

1. Users sign up or log in from the Next.js app.
2. The NestJS API validates credentials, hashes passwords, and returns a JWT.
3. The frontend stores the JWT locally and sends it as a bearer token.
4. Nest guards validate JWTs and role metadata before protected operations.
5. Prisma reads and writes PostgreSQL data through the shared `@workspace/db` package.

## Roles

- `ADMIN`: manages parking locations and reports.
- `ATTENDANT`: views parking availability, records car entry, generates tickets, records exit, and generates bills.

## Database Model

- `User`: account profile, email, password hash, and role.
- `Parking`: parking code, name, location, total spaces, available spaces, and hourly fee.
- `ParkingSession`: vehicle parking record with ticket number, plate number, entry time, nullable exit time, charged amount, and links to parking/user records.
- `UserRole`: `ADMIN` or `ATTENDANT`.

## API Areas

- `/api/auth/signup`: create account.
- `/api/auth/login`: authenticate and receive JWT.
- `/api/auth/me`: inspect current bearer token user.
- `/api/parkings`: create/list parking locations.
- `/api/sessions/entry`: register incoming car and generate ticket.
- `/api/sessions/:id/exit`: register outgoing car and generate bill.
- `/api/sessions/active`: list cars still parked.
- `/api/reports/entered`: cars entered between two datetimes.
- `/api/reports/outgoing`: cars exited between two datetimes with total charged amount.
- `/api/docs`: Swagger UI.

## Security And Validation

- Passwords are stored as salted hashes, not plain text.
- JWT bearer tokens protect operational routes.
- Role guards restrict admin-only reporting and parking registration.
- Global validation strips unknown request fields.
- CORS is limited through `WEB_ORIGIN`.
- Helmet adds common HTTP hardening headers.

## Environment

The single required database variable is:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/car_parking_fullstack?schema=public"
```

The API also reads `PORT`, `WEB_ORIGIN`, `JWT_SECRET`, and `JWT_EXPIRES_IN`.
