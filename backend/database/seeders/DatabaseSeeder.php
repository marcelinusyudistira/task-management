<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create users
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $manager = User::create([
            'name' => 'Manager User',
            'email' => 'manager@example.com',
            'password' => Hash::make('password'),
            'role' => 'manager',
        ]);

        $members = collect();
        foreach (['Alice Johnson', 'Bob Smith', 'Charlie Brown'] as $i => $name) {
            $members->push(User::create([
                'name' => $name,
                'email' => strtolower(str_replace(' ', '.', $name)) . '@example.com',
                'password' => Hash::make('password'),
                'role' => 'member',
            ]));
        }

        $allUsers = collect([$admin, $manager])->merge($members);

        // Create tasks
        $statuses = ['pending', 'in_progress', 'completed', 'cancelled'];
        $priorities = ['low', 'medium', 'high', 'urgent'];
        $tasks = collect();

        $taskData = [
            ['title' => 'Setup project infrastructure', 'description' => 'Configure CI/CD pipeline and deployment environment'],
            ['title' => 'Design database schema', 'description' => 'Create ERD and define table relationships'],
            ['title' => 'Implement user authentication', 'description' => 'Build login, registration, and password reset'],
            ['title' => 'Create REST API endpoints', 'description' => 'Develop CRUD operations for all resources'],
            ['title' => 'Build frontend dashboard', 'description' => 'Create responsive task management UI'],
            ['title' => 'Add file upload feature', 'description' => 'Support multiple file types with validation'],
            ['title' => 'Implement real-time notifications', 'description' => 'Use SSE for live task updates'],
            ['title' => 'Write unit tests', 'description' => 'Cover critical business logic with tests'],
            ['title' => 'Performance optimization', 'description' => 'Add caching and query optimization'],
            ['title' => 'Security audit', 'description' => 'Review and fix potential vulnerabilities'],
            ['title' => 'Mobile responsive design', 'description' => 'Ensure UI works on all screen sizes'],
            ['title' => 'API documentation', 'description' => 'Create OpenAPI specification'],
            ['title' => 'Data export feature', 'description' => 'Export tasks to CSV and PDF formats'],
            ['title' => 'User role management', 'description' => 'Implement RBAC system'],
            ['title' => 'Deploy to production', 'description' => 'Setup production server and deploy'],
        ];

        foreach ($taskData as $i => $data) {
            $tasks->push(Task::create([
                'title' => $data['title'],
                'description' => $data['description'],
                'status' => $statuses[$i % 4],
                'priority' => $priorities[$i % 4],
                'assigned_user_id' => $allUsers->random()->id,
                'created_by' => $allUsers->random()->id,
                'due_date' => now()->addDays(rand(1, 30)),
            ]));
        }

        // Create comments
        $commentTexts = [
            'Great progress on this task!',
            'Need more details on the requirements.',
            'Blocked by dependency on another task.',
            'Updated the implementation approach.',
            'Ready for code review.',
            'Found a bug, investigating.',
            'This is now complete, please verify.',
            'Moved to next sprint.',
            'Added unit tests for this feature.',
            'Documentation updated.',
        ];

        foreach ($commentTexts as $i => $text) {
            TaskComment::create([
                'task_id' => $tasks->random()->id,
                'user_id' => $allUsers->random()->id,
                'comment' => $text,
            ]);
        }
    }
}
