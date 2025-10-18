<?php

namespace Database\Seeders;

use App\Models\Genre;
use Illuminate\Database\Seeder;

class GenreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Root genres (starting points)
        $roots = [
            [
                'name' => 'Rock',
                'description' => 'The foundation of modern music. Start your journey here.',
                'playlist_url' => 'https://www.youtube.com/playlist?list=PLxxxxxx',
                'year' => 1950,
                'x_position' => 100,
                'y_position' => 100,
                'order_index' => 1,
            ],
            [
                'name' => 'Electronic',
                'description' => 'Digital sounds and synthetic beats.',
                'playlist_url' => 'https://www.youtube.com/playlist?list=PLyyyyyy',
                'year' => 1970,
                'x_position' => 300,
                'y_position' => 100,
                'order_index' => 2,
            ],
            [
                'name' => 'Hip-Hop',
                'description' => 'Rhythm, rhymes, and culture.',
                'playlist_url' => 'https://www.youtube.com/playlist?list=PLzzzzzz',
                'year' => 1980,
                'x_position' => 500,
                'y_position' => 100,
                'order_index' => 3,
            ],
        ];

        foreach ($roots as $rootData) {
            $root = Genre::create($rootData);

            // Add child genres for Rock
            if ($root->name === 'Rock') {
                Genre::create([
                    'parent_id' => $root->id,
                    'name' => 'Hard Rock',
                    'description' => 'Louder, harder, faster!',
                    'playlist_url' => 'https://www.youtube.com/playlist?list=PLaaaaaa',
                    'year' => 1968,
                    'x_position' => 100,
                    'y_position' => 250,
                    'order_index' => 1,
                ]);

                Genre::create([
                    'parent_id' => $root->id,
                    'name' => 'Punk Rock',
                    'description' => 'Raw energy and rebellion.',
                    'playlist_url' => 'https://www.youtube.com/playlist?list=PLbbbbbb',
                    'year' => 1974,
                    'x_position' => 150,
                    'y_position' => 250,
                    'order_index' => 2,
                ]);
            }

            // Add child genres for Electronic
            if ($root->name === 'Electronic') {
                Genre::create([
                    'parent_id' => $root->id,
                    'name' => 'House',
                    'description' => 'Four on the floor beats.',
                    'playlist_url' => 'https://www.youtube.com/playlist?list=PLcccccc',
                    'year' => 1980,
                    'x_position' => 300,
                    'y_position' => 250,
                    'order_index' => 1,
                ]);

                Genre::create([
                    'parent_id' => $root->id,
                    'name' => 'Techno',
                    'description' => 'Detroit innovation.',
                    'playlist_url' => 'https://www.youtube.com/playlist?list=PLdddddd',
                    'year' => 1985,
                    'x_position' => 350,
                    'y_position' => 250,
                    'order_index' => 2,
                ]);
            }

            // Add child genres for Hip-Hop
            if ($root->name === 'Hip-Hop') {
                Genre::create([
                    'parent_id' => $root->id,
                    'name' => 'Old School',
                    'description' => 'Where it all began.',
                    'playlist_url' => 'https://www.youtube.com/playlist?list=PLeeeeee',
                    'year' => 1980,
                    'x_position' => 500,
                    'y_position' => 250,
                    'order_index' => 1,
                ]);

                Genre::create([
                    'parent_id' => $root->id,
                    'name' => 'Trap',
                    'description' => 'Modern bass-heavy beats.',
                    'playlist_url' => 'https://www.youtube.com/playlist?list=PLffffff',
                    'year' => 2003,
                    'x_position' => 550,
                    'y_position' => 250,
                    'order_index' => 2,
                ]);
            }
        }
    }
}
