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
            $table->date('birth_date')->nullable()->after('email');
            $table->integer('height')->nullable()->comment('Height in cm')->after('birth_date');
            $table->decimal('weight', 5, 2)->nullable()->comment('Weight in kg')->after('height');
            $table->timestamp('weight_updated_at')->nullable()->after('weight');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['birth_date', 'height', 'weight', 'weight_updated_at']);
        });
    }
};
