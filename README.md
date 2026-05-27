# Task Management Platform

A full-stack task management system built with **Laravel 11** (backend) and **Next.js 16** (frontend).

## Features

- **Authentication**: Token-based auth with Laravel Sanctum
- **Task CRUD**: Create, read, update, delete tasks with pagination, filtering, and sorting
- **File Uploads**: Drag-and-drop file upload with validation (images, documents, videos up to 50MB)
- **Comments**: Real-time commenting system on tasks
- **Background Jobs**: Queue-based processing for notifications, file processing, bulk updates, exports
- **Real-time Updates**: Server-Sent Events (SSE) for live task updates
- **Responsive UI**: Mobile-friendly design with Tailwind CSS

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | PHP 8.2, Laravel 11, MySQL 8.0 |
| Authentication | Laravel Sanctum (token-based) |
| Queue | Database driver (configurable) |
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| State/HTTP | Axios, React Hooks |
| File Upload | react-dropzone |
| Notifications | react-hot-toast |

## Project Structure

```
project-root/
├── backend/                  # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/Api/   # API Controllers
│   │   ├── Jobs/                    # Queue Jobs
│   │   └── Models/                  # Eloquent Models
│   ├── database/
│   │   ├── migrations/              # Database migrations
│   │   ├── seeders/                 # Sample data
│   │   └── schema.sql              # Raw SQL schema
│   ├── routes/api.php              # API routes
│   ├── tests/                      # PHPUnit tests
│   └── README.md
├── frontend/                 # Next.js App
│   ├── src/
│   │   ├── app/                    # App Router pages
│   │   ├── components/             # Reusable components
│   │   ├── lib/                    # API client, auth helpers
│   │   └── types/                  # TypeScript interfaces
│   └── .env.local
├── documentation/
│   ├── api-docs/
│   │   └── openapi.yaml           # API specification
│   └── architecture.md            # Architecture decisions
└── README.md                 # This file
```

## Quick Start

### Prerequisites
- PHP 8.2+ with Composer
- MySQL 8.0+
- Node.js 18+

### Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate

# Configure database in .env, then:
php artisan migrate --seed
php artisan serve
# API runs at http://localhost:8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:3000
```

### Running Queue Worker

```bash
cd backend
php artisan queue:work
```

### Running Tests

```bash
cd backend
php artisan test
```

## Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | password | Admin |
| manager@example.com | password | Manager |
| alice.johnson@example.com | password | Member |

## Architecture Decisions

See [documentation/architecture.md](documentation/architecture.md) for detailed architecture decisions.

## API Documentation

See [backend/README.md](backend/README.md) for full API endpoint documentation.
See [documentation/api-docs/openapi.yaml](documentation/api-docs/openapi.yaml) for OpenAPI specification.
