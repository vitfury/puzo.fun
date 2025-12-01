<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('current_streak', 'current_music_walk_streak');
            $table->renameColumn('longest_streak', 'longest_music_walk_streak');
            $table->renameColumn('last_activity_date', 'last_music_walk_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('current_music_walk_streak', 'current_streak');
            $table->renameColumn('longest_music_walk_streak', 'longest_streak');
            $table->renameColumn('last_music_walk_date', 'last_activity_date');
        });
    }
};
