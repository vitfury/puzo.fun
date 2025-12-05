# RPG System - Puzo Fun

## Огляд

Система RPG для Puzo Fun включає:
- **Рівні (1-80)** - ростуть за рахунок балів (XP) за виконання завдань
- **Монетки (Coins)** - заробляються за музичні прогулянки та streak бонуси
- **Екіпірування** - броня та зброя різних грейдів

## Структура рівнів

| Діапазон | Складність | Множник |
|----------|-----------|---------|
| 1-19     | Легко     | 1.0x    |
| 20-39    | Важче     | 1.5x    |
| 40-51    | Ще важче  | 2.0x    |
| 52-60    | Дуже важко| 3.0x    |
| 61-75    | Екстрим   | 5.0x    |
| 76-80    | Легендарно| 10.0x   |

## Грейди екіпірування

| Грейд     | Рівень    | Броня                                          | Зброя                                      |
|-----------|-----------|------------------------------------------------|-------------------------------------------|
| No-Grade  | 1-19      | Apprentice, Bronze                             | Short Sword, Gladius, Falchion            |
| D         | 20-39     | Scale, Brigandine                              | Crimson Sword, Sword of Revolution, Elven Long Sword |
| C         | 40-51     | Composite, Full Plate                          | Stormbringer, Sword of Delusion, Samurai Longsword |
| B         | 52-60     | Avadon, Blue Wolf, Doom, Zubei                | Keshanberk, Sword of Damascus             |
| A         | 61-76     | Dark Crystal, Tallum, Majestic, Nightmare     | Tallum Blade, Dark Legion Edge            |
| S         | 76-80     | Imperial Crusader, Dynasty, Vesper            | Forgotten Blade, Dynasty Sword, Vesper Sword |

## Нарахування монеток (налаштовується в адмінці)

Всі налаштування винагород керуються через адмінку: **Admin → Game Settings**

- **Музична прогулянка**: за замовчуванням 10 монет
- **Streak бонуси**:
  - 7 днів: 50 монет
  - 14 днів: 100 монет
  - 30 днів: 250 монет
  - 60 днів: 500 монет
  - 100 днів: 1000 монет

## Конфігурація

### Через адмін панель (рекомендовано)
Перейдіть в **Admin → Game Settings** для налаштування:
- Монети за музичну прогулянку
- Streak бонуси
- Множник XP
- Базові очки за рівень

### Через config файл
Статичні налаштування (difficulty brackets) в `config/rpg.php`

## API Endpoints

### Shop

```
GET    /api/v1/shop                    - Список товарів магазину
GET    /api/v1/shop/inventory          - Інвентар користувача
POST   /api/v1/shop/purchase/{id}      - Купити екіпірування
POST   /api/v1/shop/equip/{id}         - Екіпірувати предмет
POST   /api/v1/shop/unequip            - Зняти екіпірування
GET    /api/v1/shop/level-progress     - Прогрес рівня
GET    /api/v1/shop/coins/history      - Історія монеток
```

### Admin Equipment

```
GET    /api/v1/admin/equipment         - Список екіпірування (адмін)
POST   /api/v1/admin/equipment         - Створити екіпірування
PUT    /api/v1/admin/equipment/{id}    - Оновити екіпірування (ціна тощо)
DELETE /api/v1/admin/equipment/{id}    - Видалити екіпірування
POST   /api/v1/admin/equipment/bulk-prices - Масове оновлення цін
```

## Встановлення

```bash
# Запустити міграції
cd backend
php artisan migrate

# Заповнити екіпірування
php artisan db:seed --class=EquipmentSeeder
```

## Файли

### Backend
- `app/Models/Equipment.php` - Модель екіпірування
- `app/Models/UserEquipment.php` - Зв'язок користувач-екіпірування
- `app/Models/CoinTransaction.php` - Транзакції монеток
- `app/Services/LevelService.php` - Розрахунок рівнів
- `app/Services/CoinService.php` - Робота з монетками
- `app/Http/Controllers/Api/ShopController.php` - API магазину
- `config/rpg.php` - Конфігурація RPG

### Frontend
- `src/pages/ShopPage.tsx` - Сторінка магазину
- `src/pages/ProfilePage.tsx` - Оновлений профіль з рівнем та монетками
- `src/api/shop.ts` - API клієнт для магазину
- `src/types/user.ts` - Оновлені типи з екіпіруванням

### Database Migrations
- `2025_12_01_210000_create_equipment_table.php`
- `2025_12_01_210001_add_rpg_fields_to_users_table.php`
- `2025_12_01_210002_create_user_equipment_table.php`
- `2025_12_01_210003_create_coin_transactions_table.php`

