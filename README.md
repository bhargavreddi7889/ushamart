# USHA MART WHOLESALE

A production-ready wholesale e-commerce web application built with Next.js 15, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

**Tagline:** No Middlemen - Wholesale Prices For Everyone

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Shadcn-style UI
- **Backend:** Next.js Server Actions & API Routes
- **Database:** Neon PostgreSQL with Prisma ORM
- **Auth:** NextAuth.js (Auth.js) with JWT & RBAC
- **Storage:** Cloudinary for image uploads
- **Notifications:** In-app notifications + Telegram order alerts
- **Deployment:** Vercel-ready

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### 3. Set up database

```bash
npx prisma db push
npm run db:seed
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Default Accounts (after seeding)

| Role     | Email                  | Password      |
|----------|------------------------|---------------|
| Admin    | admin@ushamart.com     | admin123      |
| Customer | customer@ushamart.com  | customer123   |

## Features

### Customer
- Browse products, categories, search with instant suggestions
- Guest cart (session-based) + authenticated cart
- Checkout with COD & UPI payment
- Order tracking with status timeline
- Profile & address management
- In-app notifications

### Admin Dashboard (`/admin`)
- Dashboard with stats, revenue charts
- Product, Category, Brand management
- Offers, Coupons, Banners
- Order management with status workflow
- Customer management (block/unblock)
- Inventory tracking with low-stock alerts
- Store settings (delivery charges, homepage sections)

## Project Structure

```
src/
├── actions/          # Server actions (cart, orders, products, admin)
├── app/              # Next.js App Router pages
│   ├── (shop)/       # Customer-facing pages
│   ├── (auth)/       # Login & register
│   ├── admin/        # Admin dashboard
│   └── api/          # API routes
├── components/       # React components
├── lib/              # Utilities, validations, db, auth helpers
└── types/            # TypeScript types
prisma/
├── schema.prisma     # Database schema
└── seed.ts           # Seed data
```

## Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables from `.env.example`
4. Connect Neon PostgreSQL database
5. Deploy

## Telegram Notifications

When a new order is placed, a Telegram message is sent if `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are configured.
