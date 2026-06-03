# Restful Template

A reusable full-stack REST template with:

- Next.js web app
- NestJS API
- Prisma database package
- Signup and login auth
- Two generic roles: `ROLE1` and `ROLE2`
- Role-based dashboards with zero-state UI ready to customize

## Development

Create a fresh database for each clone of this template before running the API. For local PostgreSQL, create a database named `template` or change `DATABASE_URL` in `.env` to any new empty database name you prefer.

```bash
pnpm install
pnpm generate
pnpm db:push
pnpm dev
```

Do not point a new clone at an old project database. Old enums, tables, and seed data can conflict with the generic `ROLE1` and `ROLE2` schema.

The API runs with the `/api` prefix and exposes auth endpoints:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

Admin user endpoints are protected with bearer auth and require `ROLE1`:

- `GET /api/users` - list all users without password hashes.
- `DELETE /api/users/:id` - delete a user by id. The signed-in user cannot delete their own account.
- `POST /api/users/:id/email` - send a generic HTML template email to a user through configured SMTP.

Swagger documentation is available at `GET /api/docs`.

To enable SMTP email, configure these API environment variables:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

## Customize

Use the current `role1` and `role2` dashboards as placeholders. Add project-specific models to `packages/database/prisma/schema.prisma`, then create new API modules under `apps/api/src`.

## UI Components Reference

### Modal Component
A generic, responsive modal template located at `apps/web/components/modals/modal.tsx`.

**Features:**
- **Two Variants:** `full` (includes name and email) and `simple` (includes email only).
- **Customizable:** Props for `title`, `description`, and `defaultRole`.
- **Form Integration:** Built-in form with `onAction` callback for data submission.
- **Animations:** Smooth fade-in and zoom-in transitions using Tailwind CSS.

**Usage:**
```tsx
import { Modal, ModalData } from "@/components/modals/modal";

// ... inside your component
<Modal 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)} 
  onAction={(data: ModalData) => console.log(data)}
  variant="full"
  title="Add New Member"
  description="Fill in the details below to add a new member."
/>
```

### Form Fields
Reusable form components located at `apps/web/components/ui/form-field.tsx`.

- **FormInput:** Text input with support for labels, placeholders, and Lucide icons.
- **FormSelect:** Dropdown select component with custom styling.

These components ensure a consistent look and feel across all forms in the application.
