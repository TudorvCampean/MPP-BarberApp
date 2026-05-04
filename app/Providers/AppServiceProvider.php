<?php

namespace App\Providers;

use App\Domain\Appointments\Contracts\AppointmentRepositoryInterface;
use App\Domain\Appointments\Contracts\AppointmentServiceInterface;
use App\Domain\Appointments\Services\AppointmentService;
use App\Infrastructure\Appointments\DatabaseAppointmentRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * The DatabaseAppointmentRepository is the active implementation.
     * It satisfies the same AppointmentRepositoryInterface contract that
     * the old InMemoryAppointmentRepository fulfilled, so nothing else
     * in the application needs to change.
     */
    public function register(): void
    {
        $this->app->singleton(AppointmentRepositoryInterface::class, DatabaseAppointmentRepository::class);
        $this->app->singleton(AppointmentServiceInterface::class, AppointmentService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
