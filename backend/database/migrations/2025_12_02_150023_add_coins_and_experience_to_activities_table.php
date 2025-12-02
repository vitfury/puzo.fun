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
        Schema::table('activities', function (Blueprint $table) {
            // Add new reward fields
            $table->integer('coins')->default(0)->after('points');
            $table->integer('experience')->default(0)->after('coins');

            // Migrate existing data: points -> experience for rules, points -> coins for tasks
            // This will be handled in a separate data migration
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('activities', function (Blueprint $table) {
            $table->dropColumn(['coins', 'experience']);
        });
    }
};
