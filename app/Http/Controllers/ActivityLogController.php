<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ActivityLog;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $logs = ActivityLog::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(50);
            
        return Inertia::render('ActivityLog/Index', [
            'logs' => $logs
        ]);
    }
}
