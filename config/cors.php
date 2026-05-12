<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | This file controls which cross-origin requests your Laravel API will
    | accept.  The Vue.js SPA runs on a completely separate IP / VM, so
    | 'allowed_origins' must include that client's origin.
    |
    | Control this from .env without touching PHP source code:
    |
    |   CORS_ALLOWED_ORIGINS=*                          ← any origin (demo)
    |   CORS_ALLOWED_ORIGINS=http://192.168.1.50:5173   ← exact VM origin
    |
    | Multiple origins (comma-separated) are split below.
    |
    */

    // Match all API routes (and Sanctum cookie endpoint if you use it).
    'paths' => [],

    // Allow all standard HTTP verbs (GET, POST, PUT, PATCH, DELETE, OPTIONS).
    'allowed_methods' => ['*'],

    // -----------------------------------------------------------------------
    // Read allowed origins from .env  →  CORS_ALLOWED_ORIGINS
    //
    // '*' = accept every origin (fine for a university demo).
    // For a tighter setup, set CORS_ALLOWED_ORIGINS=http://192.168.x.y:5173
    // in your .env file and the exact VM origin will be whitelisted.
    // -----------------------------------------------------------------------
    'allowed_origins' => array_map(
        'trim',
        explode(',', env('CORS_ALLOWED_ORIGINS', '*'))
    ),

    // Leave patterns empty — we use the explicit list above.
    'allowed_origins_patterns' => [],

    // Accept any request headers (Content-Type, Authorization, …).
    'allowed_headers' => ['*'],

    // No custom headers need to be exposed to the browser.
    'exposed_headers' => [],

    // Cache the preflight OPTIONS response for 0 s (bump to 3600 in prod).
    'max_age' => 0,

    // Set to true only when using cookies / Sanctum SPA authentication.
    'supports_credentials' => false,

];
