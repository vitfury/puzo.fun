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
        // Modify ENUM to include 'training' type
        DB::statement("ALTER TABLE activities MODIFY COLUMN type ENUM('daily_task', 'ongoing_rule', 'training', 'music_walk') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove 'training' from ENUM (will fail if there are records with this type)
        DB::statement("ALTER TABLE activities MODIFY COLUMN type ENUM('daily_task', 'ongoing_rule', 'music_walk') NOT NULL");
    }
};
