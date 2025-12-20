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
        Schema::create('genre_parents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('genre_id')->constrained('genres')->onDelete('cascade');
            $table->foreignId('parent_id')->constrained('genres')->onDelete('cascade');
            $table->timestamps();

            // Unique constraint to prevent duplicate parent-child relationships
            $table->unique(['genre_id', 'parent_id']);
            
            // Indexes for performance
            $table->index('genre_id');
            $table->index('parent_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('genre_parents');
    }
};

