<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\GenreUnlockService;
use Illuminate\Console\Command;

class InitializeUserGenres extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'genres:initialize {--user= : Initialize for specific user ID}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Initialize root genres for users who don\'t have any genres unlocked yet';

    /**
     * Execute the console command.
     */
    public function handle(GenreUnlockService $unlockService): int
    {
        $userId = $this->option('user');

        if ($userId) {
            $user = User::find($userId);
            if (!$user) {
                $this->error("User with ID {$userId} not found");
                return Command::FAILURE;
            }

            $unlockService->initializeUserGenres($user);
            $this->info("Initialized genres for user: {$user->name}");
            return Command::SUCCESS;
        }

        // Initialize for all users without genre progress
        $users = User::whereDoesntHave('genreProgress')->get();

        if ($users->isEmpty()) {
            $this->info('All users already have genres initialized');
            return Command::SUCCESS;
        }

        $bar = $this->output->createProgressBar($users->count());
        $bar->start();

        foreach ($users as $user) {
            $unlockService->initializeUserGenres($user);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Initialized genres for {$users->count()} users");

        return Command::SUCCESS;
    }
}
