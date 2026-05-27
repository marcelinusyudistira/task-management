<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->token = $this->user->createToken('test')->plainTextToken;
    }

    public function test_can_list_tasks(): void
    {
        Task::factory()->count(5)->create(['created_by' => $this->user->id]);

        $response = $this->getJson('/api/tasks', [
            'Authorization' => "Bearer {$this->token}",
        ]);

        $response->assertOk()
            ->assertJsonStructure(['success', 'data' => ['data']]);
    }

    public function test_can_create_task(): void
    {
        $response = $this->postJson('/api/tasks', [
            'title' => 'Test Task',
            'description' => 'Test description',
            'priority' => 'high',
            'status' => 'pending',
        ], ['Authorization' => "Bearer {$this->token}"]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', 'Test Task');
    }

    public function test_create_task_requires_title(): void
    {
        $response = $this->postJson('/api/tasks', [
            'description' => 'No title',
        ], ['Authorization' => "Bearer {$this->token}"]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors('title');
    }

    public function test_can_update_task(): void
    {
        $task = Task::factory()->create(['created_by' => $this->user->id]);

        $response = $this->putJson("/api/tasks/{$task->id}", [
            'title' => 'Updated Title',
            'status' => 'completed',
        ], ['Authorization' => "Bearer {$this->token}"]);

        $response->assertOk()
            ->assertJsonPath('data.title', 'Updated Title')
            ->assertJsonPath('data.status', 'completed');
    }

    public function test_can_delete_task(): void
    {
        $task = Task::factory()->create(['created_by' => $this->user->id]);

        $response = $this->deleteJson("/api/tasks/{$task->id}", [], [
            'Authorization' => "Bearer {$this->token}",
        ]);

        $response->assertOk();
        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    public function test_can_filter_tasks_by_status(): void
    {
        Task::factory()->create(['created_by' => $this->user->id, 'status' => 'pending']);
        Task::factory()->create(['created_by' => $this->user->id, 'status' => 'completed']);

        $response = $this->getJson('/api/tasks?status=pending', [
            'Authorization' => "Bearer {$this->token}",
        ]);

        $response->assertOk();
        $tasks = $response->json('data.data');
        foreach ($tasks as $task) {
            $this->assertEquals('pending', $task['status']);
        }
    }

    public function test_unauthenticated_access_denied(): void
    {
        $response = $this->getJson('/api/tasks');
        $response->assertUnauthorized();
    }
}
