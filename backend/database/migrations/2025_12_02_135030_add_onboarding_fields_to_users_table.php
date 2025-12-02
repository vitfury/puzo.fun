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
            $table->enum('activity_preference', ['gym', 'bodyweight', 'walking_running'])->nullable()->after('race');
            $table->boolean('onboarding_completed')->default(false)->after('activity_preference');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['activity_preference', 'onboarding_completed']);
        });
    }
};
