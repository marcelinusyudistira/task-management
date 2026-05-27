<?php

namespace App\Jobs;

use App\Models\TaskAttachment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessFileUpload implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public TaskAttachment $attachment) {}

    public function handle(): void
    {
        Log::info("Processing file upload", [
            'attachment_id' => $this->attachment->id,
            'file_name' => $this->attachment->file_name,
            'mime_type' => $this->attachment->mime_type,
        ]);

        // Simulate virus scanning
        Log::info("Virus scan passed for: {$this->attachment->file_name}");

        // Simulate thumbnail generation for images
        if (str_starts_with($this->attachment->mime_type, 'image/')) {
            Log::info("Thumbnail generated for: {$this->attachment->file_name}");
        }
    }
}
