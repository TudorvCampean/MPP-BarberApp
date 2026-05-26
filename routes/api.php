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
    // ⚠️ ÎNLOCUIEȘTE AICI CU EMAIL-UL EXACT PE CARE L-AI ÎNREGISTRAT PE SITE
    $email = 'campeantudor5@gmail.com';

    $user = \App\Models\User::where('email', $email)->first();

    if (!$user) {
        return response()->json([
            'status' => 'eroare',
            'mesaj' => "Utilizatorul cu email-ul '$email' NU exista in baza de date din cloud! Asigura-te ca te-ai inregistrat mai intai pe site."
        ]);
    }

    $user->role = 'admin';
    $user->save();

    return response()->json([
        'status' => 'succes',
        'mesaj' => "Utilizatorul '$email' a fost transformat in ADMIN cu succes!",
        'date_utilizator' => [
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role
        ]
    ]);
});
