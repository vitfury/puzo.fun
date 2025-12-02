<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Migrate existing points:
        // - music_walk -> coins (only training gives coins)
        // - daily_task and ongoing_rule -> experience (tasks and rules give experience)

        DB::table('activities')
            ->where('type', 'music_walk')
            ->update([
                'coins' => DB::raw('points'),
                'experience' => 0,
            ]);

        DB::table('activities')
            ->whereIn('type', ['daily_task', 'ongoing_rule'])
            ->update([
                'experience' => DB::raw('points'),
                'coins' => 0,
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to reverse - the old 'points' column still exists
    }
};
