# Internationalization Setup

## Overview
The Melody Ninja application now supports bilingual interface in English (EN) and Ukrainian (UK).

## Implementation Details

### Libraries Used
- `i18next` - Core internationalization framework
- `react-i18next` - React bindings for i18next
- `i18next-browser-languagedetector` - Automatic language detection

### File Structure
```
frontend/src/
├── i18n/
│   ├── index.ts              # i18n configuration
│   └── locales/
│       ├── en.json           # English translations
│       └── uk.json           # Ukrainian translations
└── components/
    └── LanguageSwitcher.tsx  # Flag-based language switcher
```

### Components
1. **LanguageSwitcher** - Flag buttons (🇬🇧 / 🇺🇦) for switching languages
2. **Layout** - Navigation wrapper with language switcher in header
3. All pages and components updated to use translations

### Usage
In any React component:
```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('key.from.json')}</h1>;
}
```

### Translation Keys
All translation keys are organized by feature:
- `app.*` - Application-wide strings
- `auth.*` - Authentication pages
- `nav.*` - Navigation items
- `activities.*` - Activities page
- `activities.items.*` - Individual activity translations
- `profile.*` - Profile page
- `common.*` - Shared UI strings

### Language Detection
1. Checks localStorage for saved preference
2. Falls back to browser language
3. Defaults to English if no match

### Adding New Translations
1. Add key to both `/frontend/src/i18n/locales/en.json` and `/frontend/src/i18n/locales/uk.json`
2. Use the key with `t('your.key')` in components
3. Never hardcode user-facing strings

## Updated Pages
- ✅ LoginPage - Fully translated
- ✅ RegisterPage - Fully translated
- ✅ ProfilePage - Fully translated with Layout
- ✅ ActivitiesPage - Fully translated with Layout
- ✅ ActivityCheckbox - Dynamic activity translations

## Activity Translations
All 8 seeded activities have full translations:

**Daily Tasks:**
- Morning Stretch → Ранкова розминка
- Log Breakfast → Запис сніданку
- Log Lunch → Запис обіду
- Log Dinner → Запис вечері
- Evening Reflection → Вечірня рефлексія

**Ongoing Rules:**
- Stay Under Calorie Limit → Дотримуйтесь ліміту калорій
- Hit 10,000 Steps → Пройдіть 10,000 кроків

**Music Walk:**
- Music Walk → Музична прогулянка

The ActivityCheckbox component automatically:
1. Looks up translations using the activity name as key
2. Falls back to original name/description if no translation exists
3. Supports both name and description translations

## Testing
1. Visit http://localhost:5173
2. Click flag icons in navigation
3. Verify all text changes between English and Ukrainian
4. Refresh page - language preference should persist

## Documentation Updated
- ✅ CLAUDE.md - Added internationalization requirements
- ✅ Tech stack updated to include i18next
- ✅ Design guidelines include bilingual mandate
