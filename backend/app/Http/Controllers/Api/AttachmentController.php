<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TaskAttachment;
use App\Jobs\ProcessFileUpload;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AttachmentController extends Controller
{
    private const MAX_FILE_SIZE = 50 * 1024; // 50MB in KB
    private const ALLOWED_MIMES = 'jpeg,png,gif,webp,pdf,doc,docx,xls,xlsx,csv,txt,mp4,webm,zip';

    public function store(Request $request, Task $task)
    {
        $request->validate([
            'file' => 'required|file|max:' . self::MAX_FILE_SIZE . '|mimes:' . self::ALLOWED_MIMES,
        ]);

        $file = $request->file('file');
        $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('attachments/' . $task->id, $fileName);

        $attachment = TaskAttachment::create([
            'task_id' => $task->id,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ]);

        ProcessFileUpload::dispatch($attachment);

        return response()->json([
            'success' => true,
            'data' => $attachment,
            'message' => 'File uploaded successfully',
        ], 201);
    }

    public function download(TaskAttachment $attachment)
    {
        if (!Storage::exists($attachment->file_path)) {
            return response()->json(['success' => false, 'message' => 'File not found'], 404);
        }

        return Storage::download($attachment->file_path, $attachment->file_name);
    }

    public function destroy(TaskAttachment $attachment)
    {
        Storage::delete($attachment->file_path);
        $attachment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Attachment deleted successfully',
        ]);
    }
}
