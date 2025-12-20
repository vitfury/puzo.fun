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
        $genres = Genre::with(['parent', 'children', 'parents', 'childrenMany'])
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
        // Check if it's a root genre (no parents)
        $hasLegacyParent = $genre->parent_id !== null;
        $hasManyToManyParents = $genre->parents()->exists();
        
        if (!$hasLegacyParent && !$hasManyToManyParents) {
            // Root genre - only the first root genre is available initially
            $firstRoot = Genre::roots()->first();
            return $firstRoot && $genre->id === $firstRoot->id;
        }

        // Child genres are available if at least one parent is completed
        // Check legacy parent
        if ($hasLegacyParent) {
            $parentProgress = $progress[$genre->parent_id] ?? null;
            if ($parentProgress && $parentProgress->isCompleted()) {
                return true;
            }
        }
        
        // Check many-to-many parents
        if ($hasManyToManyParents) {
            foreach ($genre->parents as $parent) {
                $parentProgress = $progress[$parent->id] ?? null;
                if ($parentProgress && $parentProgress->isCompleted()) {
                    return true;
                }
            }
        }
        
        return false;
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

        // Make child genres available (from both legacy and many-to-many relationships)
        DB::transaction(function () use ($userId, $genre) {
            // Legacy children
            $children = $genre->children;
            foreach ($children as $child) {
                // Check if all parents are completed
                if ($this->areAllParentsCompleted($userId, $child)) {
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
            }
            
            // Many-to-many children
            $childrenMany = $genre->childrenMany;
            foreach ($childrenMany as $child) {
                // Check if all parents are completed
                if ($this->areAllParentsCompleted($userId, $child)) {
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
            }
        });

        return $progress;
    }

    private function canUserCompleteGenre(int $userId, Genre $genre): bool
    {
        // Check if it's a root genre (no parents)
        $hasLegacyParent = $genre->parent_id !== null;
        $hasManyToManyParents = $genre->parents()->exists();
        
        if (!$hasLegacyParent && !$hasManyToManyParents) {
            // Root genre - only the first root genre can be completed initially
            $firstRoot = Genre::roots()->first();
            return $firstRoot && $genre->id === $firstRoot->id;
        }

        // Child genres require at least one parent to be completed
        // Check legacy parent
        if ($hasLegacyParent) {
            $parentProgress = UserGenreProgress::where('user_id', $userId)
                ->where('genre_id', $genre->parent_id)
                ->first();
            
            if ($parentProgress && $parentProgress->isCompleted()) {
                return true;
            }
        }
        
        // Check many-to-many parents
        if ($hasManyToManyParents) {
            foreach ($genre->parents as $parent) {
                $parentProgress = UserGenreProgress::where('user_id', $userId)
                    ->where('genre_id', $parent->id)
                    ->first();
                
                if ($parentProgress && $parentProgress->isCompleted()) {
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * Check if all parents of a genre are completed
     * For genres with multiple parents, at least one must be completed
     */
    private function areAllParentsCompleted(int $userId, Genre $genre): bool
    {
        // Get all parents (from both legacy parent_id and many-to-many)
        $parents = collect();
        
        // Legacy single parent
        if ($genre->parent_id) {
            $parent = Genre::find($genre->parent_id);
            if ($parent) {
                $parents->push($parent);
            }
        }
        
        // Many-to-many parents
        $manyToManyParents = $genre->parents;
        $parents = $parents->merge($manyToManyParents)->unique('id');
        
        // If no parents, it's a root genre
        if ($parents->isEmpty()) {
            return true;
        }
        
        // Check if at least one parent is completed
        foreach ($parents as $parent) {
            $parentProgress = UserGenreProgress::where('user_id', $userId)
                ->where('genre_id', $parent->id)
                ->first();
            
            if ($parentProgress && $parentProgress->isCompleted()) {
                return true;
            }
        }
        
        return false;
    }
}
