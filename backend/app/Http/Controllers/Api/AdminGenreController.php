<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\GenreResource;
use App\Models\Genre;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AdminGenreController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        // For admin, return all genres as flat list (easier for editing)
        $genres = Genre::with('parents')->orderBy('order_index')->get();

        return GenreResource::collection($genres);
    }

    public function store(Request $request): GenreResource
    {
        $validated = $request->validate([
            'parent_id' => 'nullable|exists:genres,id',
            'parent_ids' => 'nullable|array',
            'parent_ids.*' => 'exists:genres,id',
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
            'playlist_url' => 'nullable|url',
            'year' => 'nullable|integer|min:1900|max:2100',
            'x_position' => 'required|integer',
            'y_position' => 'required|integer',
            'order_index' => 'required|integer',
        ]);

        $parentIds = $validated['parent_ids'] ?? [];
        unset($validated['parent_ids']);

        $genre = Genre::create($validated);

        // Sync many-to-many parents
        if (!empty($parentIds)) {
            $genre->parents()->sync($parentIds);
        }

        $genre->load('parents');

        return new GenreResource($genre);
    }

    public function update(Request $request, Genre $genre): GenreResource
    {
        $validated = $request->validate([
            'parent_id' => 'nullable|exists:genres,id',
            'parent_ids' => 'nullable|array',
            'parent_ids.*' => 'exists:genres,id',
            'name' => 'sometimes|required|string|max:100',
            'description' => 'nullable|string',
            'playlist_url' => 'nullable|url',
            'year' => 'nullable|integer|min:1900|max:2100',
            'x_position' => 'sometimes|required|integer',
            'y_position' => 'sometimes|required|integer',
            'order_index' => 'sometimes|required|integer',
        ]);

        $parentIds = $validated['parent_ids'] ?? null;
        if (isset($validated['parent_ids'])) {
            unset($validated['parent_ids']);
        }

        $genre->update($validated);

        // Sync many-to-many parents if provided
        if ($parentIds !== null) {
            $genre->parents()->sync($parentIds);
        }

        $genre->load('parents');

        return new GenreResource($genre);
    }

    public function destroy(Genre $genre): JsonResponse
    {
        $genre->delete();

        return response()->json([
            'message' => 'Genre deleted successfully',
        ]);
    }
}
