<?php

namespace App\Jobs;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ExportTasks implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $userId) {}

    public function handle(): void
    {
        $tasks = Task::with(['assignedUser', 'creator'])->get();

        $csv = "ID,Title,Status,Priority,Assigned To,Created By,Due Date\n";
        foreach ($tasks as $task) {
            $csv .= implode(',', [
                $task->id,
                '"' . str_replace('"', '""', $task->title) . '"',
                $task->status,
                $task->priority,
                $task->assignedUser?->name ?? 'Unassigned',
                $task->creator->name,
                $task->due_date?->format('Y-m-d') ?? 'N/A',
            ]) . "\n";
        }

        $path = "exports/tasks_{$this->userId}_" . now()->format('Ymd_His') . ".csv";
        Storage::put($path, $csv);

        Log::info("Task export completed", ['path' => $path, 'user_id' => $this->userId]);
    }
}
