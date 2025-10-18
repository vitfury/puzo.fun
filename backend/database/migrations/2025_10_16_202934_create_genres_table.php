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
        Schema::create('genres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('genres')->onDelete('cascade');
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->string('playlist_url')->nullable();
            $table->integer('year')->nullable();
            $table->integer('x_position')->default(0);
            $table->integer('y_position')->default(0);
            $table->integer('order_index')->default(0);
            $table->timestamps();

            $table->index('parent_id');
            $table->index('order_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('genres');
    }
};
