<?php

namespace App\Services;

use App\Models\Genre;
use App\Models\UserGenreProgress;
use Illuminate\Support\Facades\DB;

class GenreService
{
    public function getGenreTreeForUser(int $userId): array
    {
        // Get all genres with their relationships
        $genres = Genre::with(['parent', 'children'])
            ->orderBy('order_index')
            ->get();

        // Get user's progress
        $progress = UserGenreProgress::where('user_id', $userId)
            ->get()
            ->keyBy('genre_id');

        // Build tree structure with availability logic
        $tree = $this->buildTree($genres, $progress, $userId);

        return $tree;
    }

    private function buildTree($genres, $progress, $userId, $parentId = null): array
    {
        $branch = [];

        foreach ($genres as $genre) {
            if ($genre->parent_id === $parentId) {
                $genreData = [
                    'id' => $genre->id,
                    'name' => $genre->name,
                    'description' => $genre->description,
                    'playlist_url' => $genre->playlist_url,
                    'year' => $genre->year,
                    'x_position' => $genre->x_position,
                    'y_position' => $genre->y_position,
                    'order_index' => $genre->order_index,
                    'is_completed' => isset($progress[$genre->id]) && $progress[$genre->id]->isCompleted(),
                    'is_available' => $this->isGenreAvailable($genre, $progress, $userId),
                    'completed_at' => $progress[$genre->id]->completed_at ?? null,
                    'children' => $this->buildTree($genres, $progress, $userId, $genre->id),
                ];

                $branch[] = $genreData;
            }
        }

        return $branch;
    }

    private function isGenreAvailable(Genre $genre, $progress, $userId): bool
    {
        // Root genres (no parent) are always available
        if ($genre->parent_id === null) {
            // Only the first root genre is available initially
            $firstRoot = Genre::roots()->first();
            return $genre->id === $firstRoot->id;
        }

        // Child genres are available if parent is completed
        $parentProgress = $progress[$genre->parent_id] ?? null;
        return $parentProgress && $parentProgress->isCompleted();
    }

    public function completeGenre(int $userId, int $genreId): UserGenreProgress
    {
        $genre = Genre::findOrFail($genreId);

        // Check if genre is available for the user
        if (!$this->canUserCompleteGenre($userId, $genre)) {
            throw new \Exception('Genre is not available for completion');
        }

        // Create or update progress
        $progress = UserGenreProgress::updateOrCreate(
            [
                'user_id' => $userId,
                'genre_id' => $genreId,
            ],
            [
                'completed_at' => now(),
                'is_available' => true,
            ]
        );

        // Make child genres available
        DB::transaction(function () use ($userId, $genre) {
            $children = $genre->children;
            foreach ($children as $child) {
                UserGenreProgress::updateOrCreate(
                    [
                        'user_id' => $userId,
                        'genre_id' => $child->id,
                    ],
                    [
                        'is_available' => true,
                    ]
                );
            }
        });

        return $progress;
    }

    private function canUserCompleteGenre(int $userId, Genre $genre): bool
    {
        // Root genres can always be completed if available
        if ($genre->parent_id === null) {
            $firstRoot = Genre::roots()->first();
            return $genre->id === $firstRoot->id;
        }

        // Child genres require parent to be completed
        $parentProgress = UserGenreProgress::where('user_id', $userId)
            ->where('genre_id', $genre->parent_id)
            ->first();

        return $parentProgress && $parentProgress->isCompleted();
    }
}
