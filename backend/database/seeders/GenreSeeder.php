<?php

namespace Database\Seeders;

use App\Models\Genre;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GenreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * PRODUCTION DATA - synced from local DB on 2025-12-02
     * 
     * Ієрархія жанрів музики для вивчення історії року:
     * Rock-n-Roll (1945) - корінь
     *   ├── Rockabilly (1950)
     *   └── Rock (1960)
     *       ├── Blues Rock (1960)
     *       ├── Psychedelic Rock (1965)
     *       └── Hard Rock (1960)
     */
    public function run(): void
    {
        // Clear existing genres
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Genre::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Root genre: Rock-n-Roll
        $rockNRoll = Genre::create([
            'name' => 'Rock-n-Roll',
            'description' => "Зародження стилю Рок-н-рол (1940–1950-ті)\nВиник як змішання блюзу, кантрі та госпелу в США на межі 40–50-х років",
            'playlist_url' => 'https://music.youtube.com/playlist?list=PL84C9100FCEF9B6DA',
            'year' => 1945,
            'x_position' => 196,
            'y_position' => -150,
                    'order_index' => 1,
                ]);

        // Child of Rock-n-Roll: Rockabilly
                Genre::create([
            'parent_id' => $rockNRoll->id,
            'name' => 'Rockabilly',
            'description' => "Рання форма рок-н-ролу з елементами кантрі (так званого «hillbilly»-стилю)\nВідрізняється швидкими темпами й характерним звучанням акустичної бас-гітари. Приклади: Carl Perkins, Johnny Cash",
            'playlist_url' => 'https://music.youtube.com/playlist?list=PLfXcQwWMcIfmhHGizJNKJz7q1qO1JEhwy',
            'year' => 1950,
            'x_position' => 408,
            'y_position' => 196,
            'order_index' => 0,
                ]);

        // Child of Rock-n-Roll: Rock
        $rock = Genre::create([
            'parent_id' => $rockNRoll->id,
            'name' => 'Rock',
            'description' => "Рок (1960-ті): Загальний «батьківський» жанр для важкої музики. Класичний рок сформувався з рок-н-ролу, блюзу та ритм-енд-блюзу, ставши популярним у 60-х. \nГітара, бас і ударні – основа звучання; з'являються гучніші гітарні рифи та експерименти зі звуком. \nПриклади: The Beatles, The Rolling Stones.",
            'playlist_url' => 'https://music.youtube.com/playlist?list=PL9xheEG-eSrSzt05VVCLfNRBjnNmRZtbx',
            'year' => 1960,
            'x_position' => -18,
            'y_position' => 196,
            'order_index' => 0,
        ]);

        // Children of Rock
                Genre::create([
            'parent_id' => $rock->id,
            'name' => 'Blues Rock',
            'description' => "Блюз-рок (1960-ті): Поєднання електричного блюзу та рокового драйву.\nВиник у середині 60-х, коли британські та американські гурти (як-от Cream, The Jimi Hendrix Experience) почали грати блюз гучніше й агресивніше. \nЦей стиль – пряма передумова важкого звучання хард-року та металу",
            'playlist_url' => 'https://music.youtube.com/playlist?list=PLw9U13gRyHytuxrcZVS-oRUWWWWQipL85',
            'year' => 1960,
            'x_position' => -385,
            'y_position' => 518,
            'order_index' => 0,
                ]);

                Genre::create([
            'parent_id' => $rock->id,
            'name' => 'Psychedelic Rock',
            'description' => "Психоделічний рок (1965–1969): Рок, натхненний психоделічною культурою (вплив ЛСД та інші наркотики) та експериментами зі звуком. З'явився у середині 60-х, прагнучи відтворити «розширений свідомістю» досвід\n\nВажливі представники: Pink Floyd, The Doors, Jefferson Airplane. Психоделічний рок (зокрема його важче відгалуження – «acid rock») вплинув на формування важкого металу своєю гучністю та спотвореними гітарними ефектами.",
            'playlist_url' => 'https://music.youtube.com/playlist?list=PL_9KyubuEEgj0bnDQLap-VCbf78n6On5Z',
            'year' => 1965,
            'x_position' => 380,
            'y_position' => 517,
            'order_index' => 0,
                ]);

                Genre::create([
            'parent_id' => $rock->id,
            'name' => 'Hard Rock',
            'description' => "Хард-рок (кінець 1960-х): Перший по-справжньому «важкий» рок-стиль. Виник з блюз-року та гаражного року, коли гурти почали грати гучніше, з важкими рифами та потужними барабанами. The Kinks (пісня \"You Really Got Me\", 1964) чи The Who дали ранні приклади перевантажених гітар. До кінця 60-х хард-рок оформився зі створенням у 1968 році гуртів Led Zeppelin, Deep Purple та Black Sabbath – трьох колективів, що задали канони важкого звучання\nХард-рок став прямим прабатьком хеві-металу",
            'playlist_url' => 'https://music.youtube.com/playlist?list=PLpoUYdDxb6P4-KapXl76dLxXVVJYkQK12',
            'year' => 1960,
            'x_position' => -20,
            'y_position' => 515,
            'order_index' => 0,
                ]);

        $this->command->info('✅ Genres seeded!');
        $this->command->info('');
        $this->command->info('🎸 Жанри:');
        $this->command->info('   Rock-n-Roll (1945) - корінь');
        $this->command->info('   ├── Rockabilly (1950)');
        $this->command->info('   └── Rock (1960)');
        $this->command->info('       ├── Blues Rock (1960)');
        $this->command->info('       ├── Psychedelic Rock (1965)');
        $this->command->info('       └── Hard Rock (1960)');
    }
}
