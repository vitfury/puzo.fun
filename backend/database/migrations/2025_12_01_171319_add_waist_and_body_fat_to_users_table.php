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
            $table->integer('waist_circumference')->nullable()->comment('Waist circumference in cm')->after('weight_updated_at');
            $table->decimal('body_fat_percentage', 5, 2)->nullable()->comment('Body fat percentage')->after('waist_circumference');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['waist_circumference', 'body_fat_percentage']);
        });
    }
};
