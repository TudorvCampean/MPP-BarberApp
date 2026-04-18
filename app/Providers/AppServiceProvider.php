<?php

namespace App\Providers;

use App\Domain\Appointments\Contracts\AppointmentRepositoryInterface;
use App\Domain\Appointments\Contracts\AppointmentServiceInterface;
use App\Domain\Appointments\Services\AppointmentService;
use App\Infrastructure\Appointments\InMemoryAppointmentRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(AppointmentRepositoryInterface::class, InMemoryAppointmentRepository::class);
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
