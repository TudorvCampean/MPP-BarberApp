<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Verifică dacă aplicația este în modul mentenanță...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Înregistrează autoloader-ul Composer...
require __DIR__.'/../vendor/autoload.php';

// Pornește Laravel și gestionează cererea...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
