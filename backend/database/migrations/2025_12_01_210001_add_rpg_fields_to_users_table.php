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
            $table->integer('level')->default(1)->after('total_points');
            $table->integer('coins')->default(0)->after('level');
            $table->foreignId('equipped_armor_id')->nullable()->after('coins')
                ->constrained('equipment')->nullOnDelete();
            $table->foreignId('equipped_weapon_id')->nullable()->after('equipped_armor_id')
                ->constrained('equipment')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['equipped_armor_id']);
            $table->dropForeign(['equipped_weapon_id']);
            $table->dropColumn(['level', 'coins', 'equipped_armor_id', 'equipped_weapon_id']);
        });
    }
};

