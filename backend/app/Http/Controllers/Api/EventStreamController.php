<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EventStreamController extends Controller
{
    public function stream(Request $request): StreamedResponse
    {
        $token = $request->query('token');
        if (!$token) {
            abort(401, 'Token required');
        }

        $accessToken = PersonalAccessToken::findToken($token);
        if (!$accessToken) {
            abort(401, 'Invalid token');
        }

        return new StreamedResponse(function () {
            set_time_limit(0);
            $lastCheck = now();
            $maxDuration = 25; // seconds before closing connection
            $start = time();

            while ((time() - $start) < $maxDuration) {
                if (connection_aborted()) break;

                $tasks = Task::where('updated_at', '>', $lastCheck)
                    ->with(['assignedUser', 'creator'])
                    ->get();

                if ($tasks->isNotEmpty()) {
                    echo "event: task-updated\n";
                    echo "data: " . json_encode($tasks) . "\n\n";
                } else {
                    echo ": heartbeat\n\n";
                }

                if (ob_get_level()) ob_flush();
                flush();

                $lastCheck = now();
                sleep(5);
            }

            echo "event: reconnect\n";
            echo "data: {}\n\n";
            if (ob_get_level()) ob_flush();
            flush();
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
