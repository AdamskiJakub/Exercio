# 🏋️ Trainly

> Platform connecting fitness & wellness professionals with clients

Modern web application for booking training sessions, managing schedules, and growing your coaching business.

---

## 🎯 Overview

Trainly is a marketplace platform designed for the fitness and wellness industry. It enables trainers, instructors, and coaches to showcase their services, manage availability, and accept bookings from clients.

**Target Users:**
- 👨‍🏫 Personal trainers, yoga instructors, dance teachers
- 💆 Massage therapists, physiotherapists, wellness coaches
- 🏃 Clients looking for professional training services

---

## ✨ Key Features

- 🔐 **User Authentication** - Secure JWT-based auth with role management
- 👤 **Profile Management** - Rich instructor profiles with media galleries
- 📅 **Availability System** - Flexible scheduling with weekly patterns and exceptions
- 📖 **Booking System** - Session reservation with conflict detection
- 🌍 **Internationalization** - Full Polish & English support
- 📱 **Responsive Design** - Mobile-first UI with modern components

---

## 🛠️ Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **Prisma ORM** - Type-safe database access with PostgreSQL
- **JWT** - Authentication & authorization
- **TypeScript** - Type safety across the stack

### Frontend
- **Next.js 15** - React framework with App Router
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality UI components
- **TanStack Query** - Server state management
- **next-intl** - i18n solution

### Infrastructure
- **Docker Compose** - Local development environment
- **PostgreSQL** - Relational database

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker Desktop
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AdamskiJakub/trainly.git
   cd trainly
   ```

2. **Start the database**
   ```bash
   docker-compose up -d
   ```

3. **Backend setup**
   ```bash
   cd backend
   pnpm install
   
   # Setup database
   pnpm run prisma:generate
   pnpm run prisma:migrate:dev
   
   # Start development server
   pnpm run start:dev
   ```

4. **Frontend setup** (in new terminal)
   ```bash
   cd frontend
   pnpm install
   pnpm run dev
   ```

5. **Access the application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:3001](http://localhost:3001)
   - Prisma Studio: `pnpm run prisma:studio` (in backend folder)

---

## 📁 Project Structure

```
trainly/
├── backend/              # NestJS REST API
│   ├── src/
│   │   ├── auth/        # Authentication module
│   │   ├── users/       # User management
│   │   ├── bookings/    # Booking system
│   │   └── ...
│   └── prisma/          # Database schema & migrations
│
├── frontend/            # Next.js application
│   ├── src/
│   │   ├── app/        # App Router pages
│   │   ├── components/ # React components
│   │   └── ...
│   └── messages/       # i18n translations
│
└── docker-compose.yml  # PostgreSQL container
```

---

## � Development

### Environment Variables

Create `.env` files in backend and frontend directories:

**Backend (.env)**
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
CORS_ORIGIN="http://localhost:3000"
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Useful Commands

```bash
# Backend
pnpm run start:dev          # Start dev server
pnpm run build              # Build for production
pnpm run prisma:studio      # Open database GUI
pnpm run lint               # Run ESLint

# Frontend
pnpm run dev                # Start dev server
pnpm run build              # Build for production
pnpm run lint               # Run ESLint
```

---

## 📝 License

This is a private project.

---

## � Author

**Jakub Adamski**

- GitHub: [@AdamskiJakub](https://github.com/AdamskiJakub)
