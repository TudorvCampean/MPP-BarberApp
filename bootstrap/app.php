<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Prepend to the GLOBAL stack (not just the api group) so the
        // middleware intercepts OPTIONS preflight requests before the router
        // runs — the router would return 404 for OPTIONS because no explicit
        // OPTIONS route is registered, which browsers interpret as a CORS failure.
        //$middleware->prepend(\App\Http\Middleware\ForceApiCors::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
