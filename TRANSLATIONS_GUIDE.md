# Translation Management Guide

## Viewing Translations

### View all translations:
```bash
docker-compose exec php php artisan translations:view
```

### View only Ukrainian translations:
```bash
docker-compose exec php php artisan translations:view --locale=uk
```

### View only English translations:
```bash
docker-compose exec php php artisan translations:view --locale=en
```

## Editing Translations

### Interactive editor:
```bash
docker-compose exec php php artisan translations:edit
```

This will guide you through:
1. Selecting an activity
2. Choosing a language (🇬🇧 English or 🇺🇦 Ukrainian)
3. Editing the name and description
4. Confirming changes

### Example session:
```
$ docker-compose exec php php artisan translations:edit

 Which activity do you want to edit?:
  [1] Morning Stretch (daily_task)
  [2] Log Breakfast (daily_task)
  [3] Log Lunch (daily_task)
  ...
 > 1

 Which language?:
  [en] 🇬🇧 English
  [uk] 🇺🇦 Ukrainian
 > uk

══════════════════════════════════════════════════════════════════════
Editing: Morning Stretch (uk)
══════════════════════════════════════════════════════════════════════

Current name: Ранкова розминка
Current description: Почніть свій день з 5-хвилинної розминки

 New name (press Enter to keep current) [Ранкова розминка]:
 > Ранкова зарядка

 New description (press Enter to keep current) [Почніть свій день...]:
 >

──────────────────────────────────────────────────────────────────────
New name: Ранкова зарядка
New description: Почніть свій день з 5-хвилинної розминки
──────────────────────────────────────────────────────────────────────

 Save changes? (yes/no) [yes]:
 > yes

✅ Translation updated successfully!
```

## Direct Database Access

### Using Tinker:
```bash
docker-compose exec php php artisan tinker
```

```php
// Get a translation
$translation = ActivityTranslation::where('activity_id', 1)
    ->where('locale', 'uk')
    ->first();

// Update it
$translation->update([
    'name' => 'Нова назва',
    'description' => 'Новий опис'
]);

// Get all Ukrainian translations
ActivityTranslation::where('locale', 'uk')->get();
```

## Translation Files Location

### Database:
- Table: `activity_translations`
- 16 records total (8 activities × 2 languages)

### Seeder (for reference):
- File: `backend/database/seeders/ActivitySeeder.php`
- Contains original translations

### Models:
- `backend/app/Models/ActivityTranslation.php`
- `backend/app/Models/Activity.php` (with translations relationship)

## Adding a New Language

To add a new language (e.g., Spanish 'es'):

1. **Add translations to seeder:**
```php
'translations' => [
    'en' => [...],
    'uk' => [...],
    'es' => [
        'name' => 'Estiramiento Matutino',
        'description' => 'Comienza tu día con una rutina de 5 minutos',
    ],
],
```

2. **Run seeder:**
```bash
docker-compose exec php php artisan db:seed --class=ActivitySeeder
```

3. **Update frontend:**
   - Add Spanish flag to LanguageSwitcher component
   - Add translations to `/frontend/src/i18n/locales/es.json`

## Testing Translations

### From command line:
```bash
# English
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Accept-Language: en" \
     http://localhost/api/v1/activities/today

# Ukrainian
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Accept-Language: uk" \
     http://localhost/api/v1/activities/today
```

### From browser:
1. Login to http://localhost:5173
2. Go to Activities page
3. Click language flags (🇬🇧 / 🇺🇦)
4. Watch translations change in real-time!

## Troubleshooting

### Translations not appearing?
```bash
# Check if translations exist
docker-compose exec php php artisan translations:view

# Check count
docker-compose exec php php artisan tinker --execute="echo ActivityTranslation::count();"
# Should show: 16
```

### Changes not visible in UI?
1. Clear browser cache
2. Check browser console for errors
3. Verify `Accept-Language` header is sent in Network tab

### Need to reset translations?
```bash
docker-compose exec php php artisan migrate:fresh
docker-compose exec php php artisan db:seed --class=ActivitySeeder
```

## Future: Web-Based Admin Panel

Eventually, you can create a web UI for managing translations:
- `/admin/translations` - List all translations
- `/admin/translations/{id}/edit` - Edit translation form
- Real-time preview of changes
- Export/import functionality
- Translation memory/suggestions

For now, use the CLI commands above! 🚀
