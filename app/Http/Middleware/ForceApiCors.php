<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Explicitly attach CORS headers to every API response.
 *
 * This middleware is intentionally simple and hard-codes permissive CORS
 * settings suited for a university demo where the frontend is hosted on
 * Vercel and the backend is tunnelled through `herd share` (expose.com).
 *
 * For OPTIONS preflight requests the middleware short-circuits the pipeline
 * and returns a 200 immediately with the required headers — no route match
 * is needed, which avoids the 404 / 405 that browsers interpret as a CORS
 * failure.
 */
class ForceApiCors
{
    public function handle(Request $request, Closure $next): Response
    {
        // Short-circuit preflight requests before they reach routing.
        if ($request->isMethod('OPTIONS')) {
            return response('', 200)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
        }

        /** @var Response $response */
        $response = $next($request);

        $response->headers->set('Access-Control-Allow-Origin', '*');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');

        return $response;
    }
}
