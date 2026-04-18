<?php

use App\Http\Controllers\Api\AppointmentController;
use Illuminate\Support\Facades\Route;

Route::prefix('appointments')->group(function (): void {
    Route::get('/', [AppointmentController::class, 'index']);
    Route::post('/', [AppointmentController::class, 'store']);
    Route::get('/statistics', [AppointmentController::class, 'statistics']);
    Route::get('/{id}', [AppointmentController::class, 'show'])->whereNumber('id');
    Route::put('/{id}', [AppointmentController::class, 'update'])->whereNumber('id');
    Route::patch('/{id}', [AppointmentController::class, 'update'])->whereNumber('id');
    Route::delete('/{id}', [AppointmentController::class, 'destroy'])->whereNumber('id');
});

