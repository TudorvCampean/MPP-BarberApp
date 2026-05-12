<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceApiCors
{
    public function handle(Request $request, Closure $next): Response
    {
        // Păcălim browserul spunându-i că permitem exact adresa de pe care vine el, nu "*"
        $origin = $request->header('Origin') ?: '*';

        // Am adăugat 'ngrok-skip-browser-warning' în lista de headere permise!
        $allowedHeaders = 'Content-Type, Authorization, Accept, X-Requested-With, ngrok-skip-browser-warning';

        if ($request->isMethod('OPTIONS')) {
            return response('', 200)
                ->header('Access-Control-Allow-Origin', $origin)
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', $allowedHeaders)
                ->header('Access-Control-Allow-Credentials', 'true');
        }

        /** @var Response $response */
        $response = $next($request);

        $response->headers->set('Access-Control-Allow-Origin', $origin);
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', $allowedHeaders);
        $response->headers->set('Access-Control-Allow-Credentials', 'true');

        return $response;
    }
}
