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
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['daily_task', 'ongoing_rule', 'music_walk']);
            $table->text('description')->nullable();
            $table->integer('points')->default(0);
            $table->date('active_from')->nullable();
            $table->date('active_to')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('order_index')->default(0);
            $table->timestamps();

            $table->index(['type', 'is_active']);
            $table->index('active_from');
            $table->index('active_to');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activities');
    }
};
