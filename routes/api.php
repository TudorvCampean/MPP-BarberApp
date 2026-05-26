<?php

use App\Domain\Appointments\Contracts\AppointmentRepositoryInterface;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

// 1. Rute PUBLICE (Oricine trebuie să poată face cont sau să se logheze)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// 2. Rute PROTEJATE (Doar utilizatorii cu token valid au acces)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::prefix('appointments')->group(function (): void {
        Route::get('/', [AppointmentController::class, 'index']);
        Route::post('/', [AppointmentController::class, 'store']);
        Route::get('/statistics', [AppointmentController::class, 'statistics']); // Aceasta e suficientă
        Route::get('/{id}', [AppointmentController::class, 'show'])->whereNumber('id');
        Route::put('/{id}', [AppointmentController::class, 'update'])->whereNumber('id');
        Route::patch('/{id}', [AppointmentController::class, 'update'])->whereNumber('id');
        Route::delete('/{id}', [AppointmentController::class, 'destroy'])->whereNumber('id');
    });

});

// Rute de testare (opțional, le poți lăsa în afara sau în interiorul grupului)
if (app()->environment(['local', 'testing'])) {
    Route::get('/testing/reset-appointments', function () {
        app(AppointmentRepositoryInterface::class)->reset();
        return response()->json(['ok' => true]);
    });
}

Route::get('/make-me-admin', function () {
    \App\Models\User::where('email', 'adresa_ta_de_email@aici.com')->update(['role' => 'admin']);
    return 'Cont actualizat la admin cu succes!';
});
