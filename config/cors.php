<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | This file controls which cross-origin requests your Laravel API will
    | accept. The Vue.js SPA runs on a completely different IP / VM, so
    | the 'allowed_origins' must include that client's origin.
    |
    | For the university presentation  →  '*' (accept all origins) is fine.
    |
    | For a real deployment, replace '*' with the exact client URL, e.g.:
    |   'allowed_origins' => ['http://192.168.1.50:5173'],
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    // Match all API routes.
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    // Allow all standard HTTP verbs (GET, POST, PUT, PATCH, DELETE, OPTIONS).
    'allowed_methods' => ['*'],

    // -----------------------------------------------------------------------
    // ⚠  PRODUCTION TIP
    // Replace '*' with your Vue.js client's actual origin when deploying:
    //   'allowed_origins' => ['http://192.168.x.y:5173'],
    // -----------------------------------------------------------------------
    'allowed_origins' => ['*'],

    // Leave patterns empty — we use the explicit list above.
    'allowed_origins_patterns' => [],

    // Accept any request headers (Content-Type, Authorization, X-Requested-With …).
    'allowed_headers' => ['*'],

    // No custom headers need to be exposed to the browser.
    'exposed_headers' => [],

    // Cache the preflight OPTIONS response for 0 seconds (change to e.g. 3600 in prod).
    'max_age' => 0,

    // Set to true only when using cookies / Sanctum SPA authentication.
    'supports_credentials' => false,

];
