<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;

class LocalizationController extends Controller
{
    private string $localesPath;

    public function __construct()
    {
        // In Docker, frontend is mounted at /var/www/frontend
        // Locally, it's in the parent directory
        if (file_exists('/var/www/frontend/src/i18n/locales')) {
            $this->localesPath = '/var/www/frontend/src/i18n/locales';
        } else {
            $this->localesPath = base_path('../frontend/src/i18n/locales');
        }
    }

    /**
     * Get all translations for all languages
     */
    public function index()
    {
        $translations = [];

        $localeFiles = File::files($this->localesPath);

        foreach ($localeFiles as $file) {
            if ($file->getExtension() === 'json') {
                $locale = $file->getFilenameWithoutExtension();
                $content = File::get($file->getPathname());
                $translations[$locale] = json_decode($content, true);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $translations
        ]);
    }

    /**
     * Get translations for a specific language
     */
    public function show(string $locale)
    {
        $filePath = "{$this->localesPath}/{$locale}.json";

        if (!File::exists($filePath)) {
            return response()->json([
                'success' => false,
                'message' => "Locale '{$locale}' not found"
            ], 404);
        }

        $content = File::get($filePath);
        $translations = json_decode($content, true);

        return response()->json([
            'success' => true,
            'data' => $translations
        ]);
    }

    /**
     * Update a specific translation key
     */
    public function updateKey(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'locale' => 'required|string|in:en,uk',
            'key' => 'required|string',
            'value' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $locale = $request->input('locale');
        $key = $request->input('key');
        $value = $request->input('value');

        $filePath = "{$this->localesPath}/{$locale}.json";

        if (!File::exists($filePath)) {
            return response()->json([
                'success' => false,
                'message' => "Locale '{$locale}' not found"
            ], 404);
        }

        // Load current translations
        $content = File::get($filePath);
        $translations = json_decode($content, true);

        // Update nested key
        $keys = explode('.', $key);
        $current = &$translations;

        foreach ($keys as $i => $k) {
            if ($i === count($keys) - 1) {
                $current[$k] = $value;
            } else {
                if (!isset($current[$k])) {
                    $current[$k] = [];
                }
                $current = &$current[$k];
            }
        }

        // Save back to file with pretty formatting
        $jsonContent = json_encode($translations, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        File::put($filePath, $jsonContent);

        return response()->json([
            'success' => true,
            'message' => 'Translation updated successfully',
            'data' => [
                'locale' => $locale,
                'key' => $key,
                'value' => $value
            ]
        ]);
    }

    /**
     * Update entire translations file for a language
     */
    public function update(Request $request, string $locale)
    {
        $validator = Validator::make($request->all(), [
            'translations' => 'required|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!in_array($locale, ['en', 'uk'])) {
            return response()->json([
                'success' => false,
                'message' => "Invalid locale '{$locale}'"
            ], 400);
        }

        $filePath = "{$this->localesPath}/{$locale}.json";

        $translations = $request->input('translations');
        $jsonContent = json_encode($translations, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        File::put($filePath, $jsonContent);

        return response()->json([
            'success' => true,
            'message' => "Translations for '{$locale}' updated successfully"
        ]);
    }
}
