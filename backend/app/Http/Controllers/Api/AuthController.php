<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\UpdateUserHealthRequest;
use App\Http\Resources\UserResource;
use App\Models\Equipment;
use App\Models\User;
use App\Models\UserEquipment;
use App\Services\GenreUnlockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function __construct(
        private GenreUnlockService $unlockService
    ) {
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'nickname' => $request->nickname,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'date_of_birth' => $request->date_of_birth,
            'race' => $request->race,
        ]);

        // Initialize root genres for new user
        $this->unlockService->initializeUserGenres($user);

        // Give starter Apprentice armor to new user
        $apprenticeArmor = Equipment::where('name', 'Apprentice')
            ->where('type', Equipment::TYPE_ARMOR)
            ->first();
        
        if ($apprenticeArmor) {
            UserEquipment::create([
                'user_id' => $user->id,
                'equipment_id' => $apprenticeArmor->id,
                'purchased_price' => 0,
            ]);
            
            // Auto-equip Apprentice armor
            $user->equipped_armor_id = $apprenticeArmor->id;
        }

        // Give starter Club weapon to new user
        $clubWeapon = Equipment::where('name', 'Club')
            ->where('type', Equipment::TYPE_WEAPON)
            ->first();
        
        if ($clubWeapon) {
            UserEquipment::create([
                'user_id' => $user->id,
                'equipment_id' => $clubWeapon->id,
                'purchased_price' => 0,
            ]);
            
            // Auto-equip Club weapon
            $user->equipped_weapon_id = $clubWeapon->id;
        }

        $user->save();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()),
        ]);
    }

    public function updateHealth(UpdateUserHealthRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        if (isset($data['weight'])) {
            $data['weight_updated_at'] = now();
        }

        $user->update($data);

        return response()->json([
            'user' => new UserResource($user->fresh()),
            'message' => 'Health data updated successfully',
        ]);
    }
}
