<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Jobs\SendTaskAssignedNotification;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = Task::with(['assignedUser', 'creator']);

        // Filtering
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }
        if ($request->filled('assigned_user_id')) {
            $query->where('assigned_user_id', $request->assigned_user_id);
        }
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $allowedSorts = ['title', 'status', 'priority', 'due_date', 'created_at'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        }

        $perPage = min($request->get('per_page', 15), 100);
        $tasks = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $tasks,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'in:pending,in_progress,completed,cancelled',
            'priority' => 'in:low,medium,high,urgent',
            'assigned_user_id' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date|after_or_equal:today',
        ]);

        $validated['created_by'] = $request->user()->id;
        $task = Task::create($validated);

        if ($task->assigned_user_id) {
            SendTaskAssignedNotification::dispatch($task);
        }

        return response()->json([
            'success' => true,
            'data' => $task->load(['assignedUser', 'creator']),
            'message' => 'Task created successfully',
        ], 201);
    }

    public function show(Task $task)
    {
        return response()->json([
            'success' => true,
            'data' => $task->load(['assignedUser', 'creator', 'attachments', 'comments.user']),
        ]);
    }

    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'in:pending,in_progress,completed,cancelled',
            'priority' => 'in:low,medium,high,urgent',
            'assigned_user_id' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
        ]);

        $oldAssignee = $task->assigned_user_id;
        $task->update($validated);

        if (isset($validated['assigned_user_id']) && $validated['assigned_user_id'] !== $oldAssignee) {
            SendTaskAssignedNotification::dispatch($task->fresh());
        }

        return response()->json([
            'success' => true,
            'data' => $task->load(['assignedUser', 'creator']),
            'message' => 'Task updated successfully',
        ]);
    }

    public function destroy(Task $task)
    {
        $task->delete();

        return response()->json([
            'success' => true,
            'message' => 'Task deleted successfully',
        ]);
    }
}
