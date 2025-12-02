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
        Schema::create('equipment', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. "Apprentice", "Avadon", "Dynasty"
            $table->string('type'); // 'armor' or 'weapon'
            $table->string('grade'); // 'no-grade', 'D', 'C', 'B', 'A', 'S'
            $table->integer('required_level'); // Minimum level to equip
            $table->integer('price')->default(0); // Price in coins
            $table->integer('sort_order')->default(0); // For ordering in shop
            $table->boolean('is_active')->default(true); // Can be purchased
            $table->timestamps();

            $table->index(['type', 'grade']);
            $table->index('required_level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment');
    }
};

