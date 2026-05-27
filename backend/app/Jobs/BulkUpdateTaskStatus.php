<?php

namespace App\Jobs;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class BulkUpdateTaskStatus implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public array $taskIds,
        public string $status
    ) {}

    public function handle(): void
    {
        Task::whereIn('id', $this->taskIds)->update(['status' => $this->status]);

        Log::info("Bulk status update completed", [
            'task_count' => count($this->taskIds),
            'new_status' => $this->status,
        ]);
    }
}
