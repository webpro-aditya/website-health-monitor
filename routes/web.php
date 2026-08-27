<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DomainController;
use App\Http\Controllers\SubscriptionController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::middleware(['auth', 'verified', 'subscribed'])->group(function () {
    Route::get('/dashboard', [DomainController::class, 'index'])->name('dashboard');
    Route::get('/subscription', [SubscriptionController::class, 'index'])->name('subscription.index');
    Route::post('/domains', [DomainController::class, 'store'])->name('domains.store');
    Route::put('/domains/{id}', [DomainController::class, 'update'])->name('domains.update');
    Route::delete('/domains/{id}', [DomainController::class, 'destroy'])->name('domains.destroy');
    Route::post('/domains/set-all', [DomainController::class, 'setAll'])->name('domains.set_all');
    Route::post('/notifications', [DomainController::class, 'saveNotifications'])->name('notifications.save');
    Route::post('/settings/advanced', [DomainController::class, 'saveAdvancedSettings'])->name('settings.advanced.save');
});

use App\Http\Controllers\PaymentController;
use App\Http\Controllers\WebhookController;

Route::middleware('auth')->group(function () {
    Route::get('/payment/checkout', [PaymentController::class, 'checkout'])->name('payment.checkout');
    Route::post('/payment/skip', [PaymentController::class, 'skipPayment'])->name('payment.skip');
    Route::post('/payment/subscription', [PaymentController::class, 'createSubscription'])->name('payment.subscription');
    Route::post('/payment/verify', [PaymentController::class, 'verifyPayment'])->name('payment.verify');
    
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::post('/webhooks/razorpay', [WebhookController::class, 'handle'])->name('webhooks.razorpay');

require __DIR__.'/auth.php';

// Admin Routes
use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\AdminDashboardController;

Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('login', [AdminAuthController::class, 'showLoginForm'])->name('login');
    Route::post('login', [AdminAuthController::class, 'login']);
    
    Route::middleware(['admin'])->group(function () {
        Route::get('dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::post('config/email', [AdminDashboardController::class, 'updateEmailConfig'])->name('config.email');
        Route::post('config/sms', [AdminDashboardController::class, 'updateSmsConfig'])->name('config.sms');
        Route::post('logout', [AdminAuthController::class, 'logout'])->name('logout');
        Route::get('logout', [AdminAuthController::class, 'logout'])->name('logout.get');
    });
});
