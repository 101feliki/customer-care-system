<h1 align="center">Customer Care Notification System</h1>

<p align="center">
  A full-stack platform for reaching customers by <b>email</b> and <b>SMS</b> — send one-off messages, run bulk campaigns from CSV lists, manage templates and recipients, and track delivery from one dashboard.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white" />
  <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" />
  <img src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" />
  <img src="https://img.shields.io/badge/-Jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white" />
</p>

---

## Features

**Messaging**
- Send email notifications through any SMTP provider (Nodemailer)
- Send SMS through the TextSMS Kenya API
- Reusable email templates with variables
- Bulk sending — to a list, to all recipients, or straight from an uploaded CSV
- Bulk job tracking: total, processed, success and failure counts
- Mark notifications read / unread, or cancel them

**Recipients**
- Add, edit and delete recipients
- Import recipients in bulk from CSV

**Users & security**
- JWT login with refresh tokens
- Email verification and password reset
- Role-based access: `USER`, `ADMIN`, `SUPERADMIN`
- Admin panel to manage users, roles and stats

**Dashboard**
- Analytics dashboard with charts (Recharts)
- Light / dark theme
- Filters and search across notifications

---

## Architecture

```
┌──────────────────────┐   REST + JWT   ┌──────────────────────────┐
│  frontend-vite        │ ─────────────▶ │  backend (NestJS)         │
│  React + Tailwind     │                │  Clean architecture       │
└──────────────────────┘                │  use-cases / repositories │
                                        └─────┬────────┬─────────┬──┘
                                              │        │         │
                                        PostgreSQL   SMTP    TextSMS API
                                         (Prisma)   (email)    (SMS)
```

```
customer-care-system/
├── backend/                 # NestJS API
│   ├── src/app/             # Entities and use-cases (business logic)
│   ├── src/infra/http/      # Controllers, DTOs, guards
│   ├── src/infra/database/  # Prisma schema, migrations, repositories
│   ├── src/infra/services/  # Email, SMS, auth, admin services
│   └── test/                # Jest tests and in-memory repositories
└── frontend-vite/           # React dashboard
    ├── src/pages/           # Dashboard, Notifications, Recipients, Templates, Settings…
    ├── src/components/      # Sidebar, modals, cards, charts
    └── src/services/        # API clients
```

---

## API Overview

| Area | Endpoints |
|---|---|
| **Auth** | `POST /auth/register` · `POST /auth/login` · `POST /auth/refresh-token` · `POST /auth/forgot-password` · `POST /auth/reset-password` · `GET /auth/verify-email/:token` · `GET /auth/profile` |
| **Notifications** | `GET /notifications` · `POST /notifications` · `POST /notifications/send-template` · `PATCH /notifications/:id/read` · `PATCH /notifications/:id/unread` · `PATCH /notifications/:id/cancel` |
| **Bulk** | `POST /bulk-notifications/send` · `POST /bulk-notifications/send-to-all` · `POST /bulk-notifications/send-by-csv` |
| **Recipients** | `GET/POST /recipients` · `PUT/DELETE /recipients/:id` · `POST /recipients/upload-csv` |
| **Templates** | `GET/POST /templates` · `GET/PUT/DELETE /templates/:id` |
| **Admin** | `GET /admin/users` · `POST /admin/users` · `PUT /admin/users/:id/role` · `DELETE /admin/users/:id` · `GET /admin/stats` |

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- An SMTP account (e.g. Gmail app password, Resend, Mailgun)
- A TextSMS account for SMS (optional)

### 1. Clone
```bash
git clone https://github.com/101feliki/customer-care-system.git
cd customer-care-system
```

### 2. Backend
Create `backend/.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/customer_care
PORT=3000

JWT_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASS=your-smtp-password
FROM_EMAIL=you@example.com

TEXTSMS_API_KEY=your-api-key
TEXTSMS_PARTNER_ID=your-partner-id
TEXTSMS_SENDER_ID=your-sender-id
```
Then:
```bash
cd backend
npm install
npx prisma migrate dev --schema src/infra/database/prisma/schema.prisma
npm run start:dev
```

### 3. Frontend
Create `frontend-vite/.env`:
```env
VITE_API_URL=http://localhost:3000
```
Then:
```bash
cd frontend-vite
npm install
npm run dev
```

### 4. Tests
```bash
cd backend
npm test
```

> Keep your `.env` files out of Git — they hold passwords and API keys.

---

## Author

**Felix Kariuki** — [@101feliki](https://github.com/101feliki)
