<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_streaks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('activity_id')->constrained()->onDelete('cascade');
            $table->integer('current_streak')->default(0);
            $table->integer('longest_streak')->default(0);
            $table->date('last_completed_date')->nullable();
            $table->integer('total_completions')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'activity_id']);
            $table->index(['user_id', 'current_streak']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_streaks');
    }
};

