<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\GenreCommentResource;
use App\Http\Resources\GenreResource;
use App\Models\Genre;
use App\Models\GenreComment;
use App\Services\GenreUnlockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class GenreController extends Controller
{
    public function __construct(
        private GenreUnlockService $unlockService
    ) {
    }
    public function tree(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        if ($user) {
            // Initialize user genres if not done yet (ensures root genres are available)
            $this->unlockService->initializeUserGenres($user);

            // Check and unlock child genres that should be unlocked today
            // (completed yesterday with music walk yesterday)
            $this->unlockService->checkAndUnlockPendingGenres($user);
        }

        $genres = Genre::roots()
            ->with(['children' => function ($query) {
                $query->with('children');
            }])
            ->withCount('comments')
            ->get();

        return GenreResource::collection($genres);
    }

    public function show(Genre $genre): GenreResource
    {
        $genre->load(['children', 'comments' => function ($query) {
            $query->with('user')->latest()->limit(10);
        }])->loadCount('comments');

        return new GenreResource($genre);
    }

    public function complete(Request $request, Genre $genre): JsonResponse
    {
        $user = $request->user();

        $result = $this->unlockService->completeGenre($user, $genre);

        if ($result['already_completed']) {
            return response()->json([
                'message' => 'Genre already completed',
                'progress' => [
                    'is_completed' => true,
                ],
                'unlocked_count' => 0,
            ], 200);
        }

        $message = 'Genre completed successfully';
        if (!$result['can_unlock']) {
            $message .= ' (Child genres locked: ' . $result['reason'] . ')';
        } elseif ($result['unlocked_count'] > 0) {
            $message .= sprintf(' (%d new genre%s unlocked)',
                $result['unlocked_count'],
                $result['unlocked_count'] === 1 ? '' : 's'
            );
        }

        return response()->json([
            'message' => $message,
            'progress' => [
                'is_completed' => true,
            ],
            'unlocked_count' => $result['unlocked_count'],
            'can_unlock' => $result['can_unlock'],
            'unlock_reason' => $result['reason'],
        ]);
    }

    public function addComment(Request $request, Genre $genre): GenreCommentResource
    {
        $validated = $request->validate([
            'comment' => 'required|string|max:1000',
        ]);

        $comment = GenreComment::create([
            'user_id' => $request->user()->id,
            'genre_id' => $genre->id,
            'comment' => $validated['comment'],
        ]);

        $comment->load('user');

        return new GenreCommentResource($comment);
    }
}
