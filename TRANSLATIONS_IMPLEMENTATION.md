# Database-Backed Translations Implementation

## Overview
Implemented a proper multi-language system with translations stored in the database. This is a scalable solution that allows dynamic content to be translated without code changes.

## Database Structure

### Tables Created
1. **activity_translations**
   - `id` - Primary key
   - `activity_id` - Foreign key to activities table
   - `locale` - Language code (en, uk)
   - `name` - Translated activity name
   - `description` - Translated activity description
   - Unique constraint on (activity_id, locale)

## Backend Implementation

### Models
- **ActivityTranslation** (`app/Models/ActivityTranslation.php`)
  - Fillable: activity_id, locale, name, description
  - Relationship: belongsTo Activity

- **Activity** (`app/Models/Activity.php`)
  - New relationship: `translations()` hasMany ActivityTranslation
  - New method: `getTranslation(string $locale)`

### Migrations
- `2025_10_14_220004_create_activity_translations_table.php`
  - Creates activity_translations table
  - Foreign key constraint with cascade delete
  - Unique index on (activity_id, locale)

### Seeders
- **ActivitySeeder** (`database/seeders/ActivitySeeder.php`)
  - Updated to seed translations for all 8 activities
  - Each activity has translations for 'en' and 'uk' locales
  - Translations include both name and description

### API
- **ActivityResource** (`app/Http/Resources/ActivityResource.php`)
  - Reads `Accept-Language` header from request
  - Automatically returns translated name and description
  - Falls back to original values if translation not found

- **ActivityController** (`app/Http/Controllers/Api/ActivityController.php`)
  - Added eager loading of translations: `Activity::with('translations')`
  - Prevents N+1 query problem

## Frontend Implementation

### API Client
- **api/client.ts**
  - Automatically adds `Accept-Language` header to all requests
  - Reads current language from localStorage (i18nextLng)
  - Translations are transparent to components

### Components
- **ActivityCheckbox**
  - Simplified - no longer needs translation logic
  - Directly displays name/description from API

- **DailyActivityChecklist**
  - Added `i18n.language` dependency to useEffect
  - Automatically reloads activities when language changes
  - Real-time translation updates

## Translation Data

All 8 activities have full translations:

| Activity (EN) | Activity (UK) |
|---------------|---------------|
| Morning Stretch | Ранкова розминка |
| Log Breakfast | Запис сніданку |
| Log Lunch | Запис обіду |
| Log Dinner | Запис вечері |
| Evening Reflection | Вечірня рефлексія |
| Stay Under Calorie Limit | Дотримуйтесь ліміту калорій |
| Hit 10,000 Steps | Пройдіть 10,000 кроків |
| Music Walk | Музична прогулянка |

## How It Works

### Request Flow:
1. User changes language in frontend (clicks 🇬🇧 or 🇺🇦)
2. i18next updates localStorage with new language
3. DailyActivityChecklist detects language change via useEffect
4. API request is made with `Accept-Language: uk` header
5. Backend ActivityResource reads the header
6. Database query fetches appropriate translation
7. API returns translated data
8. Frontend displays translated names/descriptions

### API Examples:

**English:**
```bash
curl -H "Authorization: Bearer TOKEN" \
     -H "Accept-Language: en" \
     http://localhost/api/v1/activities/today
```
Response: `{"name": "Morning Stretch", ...}`

**Ukrainian:**
```bash
curl -H "Authorization: Bearer TOKEN" \
     -H "Accept-Language: uk" \
     http://localhost/api/v1/activities/today
```
Response: `{"name": "Ранкова розминка", ...}`

## Benefits of This Approach

✅ **Scalable**: Easy to add new languages without code changes
✅ **Dynamic**: Translations stored in database, can be edited via admin panel
✅ **Consistent**: Single source of truth for all translations
✅ **Performance**: Eager loading prevents N+1 queries
✅ **Clean**: Separates translation data from business logic
✅ **Flexible**: Different content types can have different translations
✅ **Maintainable**: Translation updates don't require deployments

## Future Enhancements

1. **Admin Panel**: Add UI for managing translations
2. **More Languages**: Add Spanish, French, etc.
3. **Fallback Chain**: en-US → en → original value
4. **Translation Validation**: Ensure all content has translations
5. **Export/Import**: Tools for translators to work offline

## Testing

Run the application and switch between languages:
1. Visit http://localhost:5173
2. Login with test@melody.ninja / password
3. Go to Activities page
4. Click 🇬🇧 / 🇺🇦 flags
5. Watch all activity names translate instantly!

## Database Statistics
- Activities: 8
- Translations: 16 (8 activities × 2 languages)
- Locales supported: en, uk
