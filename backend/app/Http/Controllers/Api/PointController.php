<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PointTransactionResource;
use App\Services\PointService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PointController extends Controller
{
    public function __construct(
        private PointService $pointService
    ) {
    }

    public function transactions(Request $request): AnonymousResourceCollection
    {
        $days = $request->input('days', 30);
        $user = $request->user();

        $transactions = $this->pointService->getUserTransactions($user, $days);

        return PointTransactionResource::collection($transactions);
    }

    public function balance(Request $request): JsonResponse
    {
        $user = $request->user();
        $balance = $this->pointService->getUserBalance($user);

        return response()->json([
            'balance' => $balance,
        ]);
    }
}
