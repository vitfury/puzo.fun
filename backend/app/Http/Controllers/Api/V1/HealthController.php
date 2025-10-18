<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class HealthController extends BaseController
{
    /**
     * Health check endpoint
     */
    public function index()
    {
        $services = [
            'api' => 'ok',
            'database' => $this->checkDatabase(),
            'redis' => $this->checkRedis(),
        ];

        $allHealthy = !in_array('error', $services);

        return $this->success([
            'status' => $allHealthy ? 'healthy' : 'degraded',
            'timestamp' => now()->toIso8601String(),
            'services' => $services,
            'version' => config('app.version', '1.0.0'),
        ], 'API Health Check');
    }

    private function checkDatabase(): string
    {
        try {
            DB::connection()->getPdo();
            return 'ok';
        } catch (\Exception $e) {
            return 'error';
        }
    }

    private function checkRedis(): string
    {
        try {
            Redis::ping();
            return 'ok';
        } catch (\Exception $e) {
            return 'error';
        }
    }
}
