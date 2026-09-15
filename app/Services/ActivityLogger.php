<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Request;

class ActivityLogger
{
    /**
     * Log an activity for a given user.
     *
     * @param \App\Models\User|null $user
     * @param string $action
     * @param string $description
     * @param array|null $details
     * @return void
     */
    public static function log($user, string $action, string $description, ?array $details = null)
    {
        if (!$user || !$user->activity_logging_enabled) {
            return;
        }

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => $action,
            'description' => $description,
            'details' => $details,
            'ip_address' => Request::ip(),
        ]);
    }
}
