# Architecture Decisions

## Overview

This document outlines the key architectural decisions made for the Task Management Platform.

## Backend Architecture

### Framework: Laravel 11
- **Reason**: Laravel provides built-in support for authentication (Sanctum), queues, file storage, and testing — all required by this project.
- **Alternative considered**: Vanilla PHP — rejected due to time constraints and lack of built-in security features.

### Authentication: Laravel Sanctum (Token-based)
- **Reason**: Sanctum is lightweight, built for SPA authentication, and doesn't require JWT complexity.
- **How it works**: On login, a personal access token is generated and returned. The frontend stores it in localStorage and sends it via `Authorization: Bearer` header.
- **Security**: Tokens are hashed in the database. CORS is configured to only allow the frontend origin.

### Database: MySQL with Proper Indexing
- **Indexes applied**:
  - `tasks(status, priority)` — composite index for common filter queries
  - `tasks(due_date)` — for date-range queries
  - `tasks(assigned_user_id)` — for user-specific task lookups
  - `task_comments(task_id)` — for efficient comment loading
- **Enum fields**: `status` and `priority` use MySQL ENUM for data integrity and query performance.

### Queue System: Database Driver
- **Reason**: Zero additional infrastructure needed. Works out of the box.
- **Jobs implemented**:
  - `SendTaskAssignedNotification` — triggered when a task is assigned
  - `ProcessFileUpload` — handles virus scanning simulation and thumbnail generation
  - `BulkUpdateTaskStatus` — batch status updates
  - `ExportTasks` — CSV export generation
- **Production recommendation**: Switch to Redis driver for better performance.

### File Upload Strategy
- **Storage**: Files stored in `storage/app/attachments/{task_id}/` with UUID filenames to prevent collisions.
- **Validation**: Server-side MIME type and file size validation (max 50MB).
- **Security**: Original filenames preserved in database but not used for storage (prevents path traversal).
- **Processing**: Background job handles post-upload processing (virus scan simulation, thumbnail generation).

### Real-time: Server-Sent Events (SSE)
- **Reason**: Simpler than WebSockets for one-way server-to-client updates. No additional infrastructure (no Pusher/Redis pub-sub needed).
- **How it works**: Client opens persistent connection to `/api/events/tasks`. Server polls for updated tasks every 2 seconds and pushes changes.
- **Trade-off**: Not suitable for high-frequency bidirectional communication, but sufficient for task status updates.

## Frontend Architecture

### Framework: Next.js 16 (App Router)
- **Reason**: Modern React framework with built-in routing, TypeScript support, and optimized builds.
- **Rendering**: Client-side rendering for authenticated pages (dashboard, task detail). No SSR needed since all data is user-specific.

### State Management: React Hooks + Axios
- **Reason**: The app's state is simple enough that React's built-in hooks (useState, useEffect, useCallback) suffice. No need for Redux/Zustand.
- **API layer**: Centralized Axios instance with interceptors for auth token injection and 401 handling.

### UI: Tailwind CSS
- **Reason**: Utility-first CSS for rapid development. No component library dependency.
- **Responsive**: Mobile-first design with responsive breakpoints.

### File Upload: react-dropzone
- **Reason**: Well-maintained library with drag-and-drop support, file type filtering, and size validation.
- **UX**: Progress indicator during upload, toast notifications on success/failure.

## Security Considerations

1. **Input Validation**: All API inputs validated server-side with Laravel's validation rules.
2. **SQL Injection**: Prevented by Eloquent ORM (parameterized queries).
3. **XSS**: React's JSX auto-escapes output. No `dangerouslySetInnerHTML` used.
4. **CORS**: Restricted to frontend origin only.
5. **File Upload**: MIME type validation, size limits, UUID filenames.
6. **Authentication**: Token-based with automatic 401 redirect.

## Scalability Considerations

For production deployment:
1. Switch queue driver to Redis
2. Add Redis caching for task list queries
3. Use S3/cloud storage for file uploads
4. Add rate limiting to API endpoints
5. Implement database read replicas for heavy read workloads
