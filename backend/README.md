# Task Management API - Backend

## Tech Stack
- PHP 8.2+
- Laravel 11
- MySQL 8.0
- Laravel Sanctum (Authentication)
- Queue System (Database driver)

## Setup Instructions

### Prerequisites
- PHP 8.2+
- Composer
- MySQL 8.0+

### Installation

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

### Database Setup

```bash
# Create database
mysql -u root -e "CREATE DATABASE task_management"

# Run migrations and seed
php artisan migrate --seed

# Or import SQL directly
mysql -u root task_management < database/schema.sql
```

### Running the Server

```bash
php artisan serve
# API available at http://localhost:8000/api
```

### Running Queue Worker

```bash
php artisan queue:work
```

### Running Tests

```bash
php artisan test
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login with email/password |
| POST | /api/auth/logout | Logout (requires token) |
| GET | /api/auth/me | Get current user |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | List tasks (paginated) |
| POST | /api/tasks | Create task |
| GET | /api/tasks/{id} | Get task detail |
| PUT | /api/tasks/{id} | Update task |
| DELETE | /api/tasks/{id} | Delete task |

### Attachments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/tasks/{id}/attachments | Upload file |
| GET | /api/attachments/{id}/download | Download file |
| DELETE | /api/attachments/{id} | Delete file |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks/{id}/comments | List comments |
| POST | /api/tasks/{id}/comments | Add comment |
| DELETE | /api/comments/{id} | Delete comment |

### Real-time
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/events/tasks | SSE stream for task updates |

## Query Parameters (GET /api/tasks)
- `status` - Filter by status (pending, in_progress, completed, cancelled)
- `priority` - Filter by priority (low, medium, high, urgent)
- `assigned_user_id` - Filter by assignee
- `search` - Search in title and description
- `sort_by` - Sort field (title, status, priority, due_date, created_at)
- `sort_dir` - Sort direction (asc, desc)
- `per_page` - Items per page (max 100)

## Test Credentials
- Email: `admin@example.com`
- Password: `password`
