-- Task Management Platform Database Schema
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS task_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE task_management;

-- Users table
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'member') DEFAULT 'member',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Personal access tokens (Sanctum)
CREATE TABLE personal_access_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    abilities TEXT NULL,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX personal_access_tokens_tokenable_type_tokenable_id_index (tokenable_type, tokenable_id)
) ENGINE=InnoDB;

-- Tasks table
CREATE TABLE tasks (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    assigned_user_id BIGINT UNSIGNED NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    due_date DATE NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tasks_status_priority (status, priority),
    INDEX idx_tasks_due_date (due_date),
    INDEX idx_tasks_assigned_user (assigned_user_id),
    FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Task attachments table
CREATE TABLE task_attachments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT UNSIGNED NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size BIGINT UNSIGNED NOT NULL,
    mime_type VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Task comments table
CREATE TABLE task_comments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_task_comments_task_id (task_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Jobs table (for queue system)
CREATE TABLE jobs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    queue VARCHAR(255) NOT NULL,
    payload LONGTEXT NOT NULL,
    attempts TINYINT UNSIGNED NOT NULL,
    reserved_at INT UNSIGNED NULL,
    available_at INT UNSIGNED NOT NULL,
    created_at INT UNSIGNED NOT NULL,
    INDEX idx_jobs_queue (queue)
) ENGINE=InnoDB;

-- Failed jobs table
CREATE TABLE failed_jobs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(255) NOT NULL UNIQUE,
    connection TEXT NOT NULL,
    queue TEXT NOT NULL,
    payload LONGTEXT NOT NULL,
    exception LONGTEXT NOT NULL,
    failed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Seed data
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@example.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Manager User', 'manager@example.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager'),
('Alice Johnson', 'alice.johnson@example.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'member'),
('Bob Smith', 'bob.smith@example.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'member'),
('Charlie Brown', 'charlie.brown@example.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'member');
-- Password for all users: "password"

INSERT INTO tasks (title, description, status, priority, assigned_user_id, created_by, due_date) VALUES
('Setup project infrastructure', 'Configure CI/CD pipeline and deployment environment', 'pending', 'high', 1, 1, DATE_ADD(CURDATE(), INTERVAL 7 DAY)),
('Design database schema', 'Create ERD and define table relationships', 'in_progress', 'high', 2, 1, DATE_ADD(CURDATE(), INTERVAL 3 DAY)),
('Implement user authentication', 'Build login, registration, and password reset', 'completed', 'urgent', 3, 2, DATE_ADD(CURDATE(), INTERVAL 5 DAY)),
('Create REST API endpoints', 'Develop CRUD operations for all resources', 'in_progress', 'high', 3, 1, DATE_ADD(CURDATE(), INTERVAL 10 DAY)),
('Build frontend dashboard', 'Create responsive task management UI', 'pending', 'medium', 4, 2, DATE_ADD(CURDATE(), INTERVAL 14 DAY)),
('Add file upload feature', 'Support multiple file types with validation', 'pending', 'medium', 5, 1, DATE_ADD(CURDATE(), INTERVAL 12 DAY)),
('Implement real-time notifications', 'Use SSE for live task updates', 'pending', 'low', 3, 2, DATE_ADD(CURDATE(), INTERVAL 20 DAY)),
('Write unit tests', 'Cover critical business logic with tests', 'in_progress', 'medium', 4, 1, DATE_ADD(CURDATE(), INTERVAL 8 DAY)),
('Performance optimization', 'Add caching and query optimization', 'pending', 'low', 5, 2, DATE_ADD(CURDATE(), INTERVAL 25 DAY)),
('Security audit', 'Review and fix potential vulnerabilities', 'pending', 'urgent', 1, 1, DATE_ADD(CURDATE(), INTERVAL 5 DAY)),
('Mobile responsive design', 'Ensure UI works on all screen sizes', 'in_progress', 'medium', 4, 2, DATE_ADD(CURDATE(), INTERVAL 15 DAY)),
('API documentation', 'Create OpenAPI specification', 'pending', 'low', 2, 1, DATE_ADD(CURDATE(), INTERVAL 18 DAY)),
('Data export feature', 'Export tasks to CSV and PDF formats', 'pending', 'medium', 5, 2, DATE_ADD(CURDATE(), INTERVAL 22 DAY)),
('User role management', 'Implement RBAC system', 'completed', 'high', 1, 1, DATE_ADD(CURDATE(), INTERVAL 2 DAY)),
('Deploy to production', 'Setup production server and deploy', 'pending', 'urgent', 2, 1, DATE_ADD(CURDATE(), INTERVAL 30 DAY));

INSERT INTO task_comments (task_id, user_id, comment) VALUES
(1, 2, 'Great progress on this task!'),
(2, 1, 'Need more details on the requirements.'),
(3, 3, 'Blocked by dependency on another task.'),
(4, 4, 'Updated the implementation approach.'),
(5, 5, 'Ready for code review.'),
(1, 3, 'Found a bug, investigating.'),
(2, 4, 'This is now complete, please verify.'),
(6, 1, 'Moved to next sprint.'),
(8, 2, 'Added unit tests for this feature.'),
(10, 5, 'Documentation updated.');
