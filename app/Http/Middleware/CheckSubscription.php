<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscription
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        if ($user->role === 'admin') {
            return $next($request);
        }

        $hasActiveSubscription = $user->subscriptions()->where('status', 'active')->exists();
        $hasActiveTrial = $user->trial_ends_at && $user->trial_ends_at->isFuture();

        if ($hasActiveSubscription || $hasActiveTrial) {
            return $next($request);
        }

        return redirect()->route('payment.checkout')->with('error', 'Please subscribe to continue.');
    }
}
