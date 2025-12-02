import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Layout } from '../../components/Layout';
import { adminApi, GameSetting } from '../../api/admin';

// Setting labels for display
const settingLabels: Record<string, { label: string; emoji: string }> = {
  music_walk_coins: { label: 'Монети за прогулянку', emoji: '🎵' },
  streak_bonus_7: { label: 'Бонус за 7 днів', emoji: '🔥' },
  streak_bonus_14: { label: 'Бонус за 14 днів', emoji: '🔥' },
  streak_bonus_30: { label: 'Бонус за 30 днів', emoji: '🔥' },
  streak_bonus_60: { label: 'Бонус за 60 днів', emoji: '🔥' },
  streak_bonus_100: { label: 'Бонус за 100 днів', emoji: '🔥' },
  xp_rate: { label: 'Множник XP', emoji: '⚡' },
  base_points_per_level: { label: 'Базові очки за рівень', emoji: '📈' },
};

const groupLabels: Record<string, { label: string; description: string }> = {
  coins: { 
    label: '🪙 Винагороди монетками', 
    description: 'Налаштуй кількість монеток за різні активності' 
  },
  levels: { 
    label: '⭐ Система рівнів', 
    description: 'Налаштуй складність прокачки рівнів' 
  },
};

export const AdminSettingsPage = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [settings, setSettings] = useState<GameSetting[]>([]);
  const [grouped, setGrouped] = useState<Record<string, GameSetting[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, number | string>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dev tools state
  const [devCoins, setDevCoins] = useState<number>(0);
  const [devPoints, setDevPoints] = useState<number>(0);
  const [devRace, setDevRace] = useState<string>('human');
  const [savingDevStats, setSavingDevStats] = useState(false);
  const [savingRace, setSavingRace] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (user) {
      setDevCoins(user.coins);
      setDevPoints(user.total_points);
      setDevRace(user.race);
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getSettings();
      setSettings(data.settings);
      setGrouped(data.grouped);
      
      // Initialize edited values with current values
      const initial: Record<string, number | string> = {};
      data.settings.forEach(s => {
        initial[s.key] = s.value as number | string;
      });
      setEditedValues(initial);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setMessage({ type: 'error', text: 'Не вдалося завантажити налаштування' });
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (key: string, value: string) => {
    const setting = settings.find(s => s.key === key);
    if (!setting) return;

    let parsedValue: number | string = value;
    if (setting.type === 'integer') {
      parsedValue = parseInt(value) || 0;
    } else if (setting.type === 'float') {
      parsedValue = parseFloat(value) || 0;
    }

    setEditedValues(prev => ({
      ...prev,
      [key]: parsedValue,
    }));
  };

  const hasChanges = () => {
    return settings.some(s => editedValues[s.key] !== s.value);
  };

  const getChangedSettings = () => {
    return settings
      .filter(s => editedValues[s.key] !== s.value)
      .map(s => ({ key: s.key, value: editedValues[s.key] }));
  };

  const handleSave = async () => {
    const changes = getChangedSettings();
    if (changes.length === 0) return;

    try {
      setSaving(true);
      await adminApi.bulkUpdateSettings(changes);
      await loadSettings();
      setMessage({ type: 'success', text: `Збережено ${changes.length} налаштувань` });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'Не вдалося зберегти налаштування' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const initial: Record<string, number | string> = {};
    settings.forEach(s => {
      initial[s.key] = s.value as number | string;
    });
    setEditedValues(initial);
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-gray-400">{t('common.loading')}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              ⚙️ {t('admin.settings.title', 'Налаштування гри')}
            </h1>
            <p className="text-gray-400">
              {t('admin.settings.subtitle', 'Керуй винагородами та параметрами гри')}
            </p>
          </div>
          <div className="flex gap-3">
            {hasChanges() && (
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                {t('common.cancel', 'Скасувати')}
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!hasChanges() || saving}
              className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                hasChanges()
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {saving ? t('common.saving', 'Збереження...') : t('common.save', 'Зберегти')}
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-900/50 border border-green-500 text-green-200' 
              : 'bg-red-900/50 border border-red-500 text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Settings by group */}
        <div className="space-y-8">
          {Object.entries(grouped).map(([group, groupSettings]) => (
            <div key={group} className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg overflow-hidden">
              <div className="bg-gray-900/50 px-6 py-4 border-b border-purple-500/30">
                <h2 className="text-xl font-bold text-white">
                  {groupLabels[group]?.label || group}
                </h2>
                <p className="text-gray-400 text-sm">
                  {groupLabels[group]?.description || ''}
                </p>
              </div>
              
              <div className="p-6">
                <div className="grid gap-4">
                  {groupSettings.map((setting) => {
                    const label = settingLabels[setting.key];
                    const isChanged = editedValues[setting.key] !== setting.value;
                    
                    return (
                      <div 
                        key={setting.key}
                        className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                          isChanged ? 'bg-purple-900/30 border border-purple-500' : 'bg-gray-700/50'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{label?.emoji || '⚙️'}</span>
                            <span className="font-medium text-white">
                              {label?.label || setting.key}
                            </span>
                            {isChanged && (
                              <span className="text-xs text-purple-400 px-2 py-0.5 bg-purple-900/50 rounded">
                                змінено
                              </span>
                            )}
                          </div>
                          {setting.description && (
                            <p className="text-gray-500 text-sm mt-1 ml-8">
                              {setting.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {isChanged && (
                            <span className="text-gray-500 text-sm line-through">
                              {setting.value}
                            </span>
                          )}
                          <input
                            type={setting.type === 'float' ? 'number' : 'number'}
                            step={setting.type === 'float' ? '0.1' : '1'}
                            value={editedValues[setting.key] ?? ''}
                            onChange={(e) => handleValueChange(setting.key, e.target.value)}
                            className="w-32 px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-right focus:outline-none focus:border-purple-500"
                          />
                          {group === 'coins' && (
                            <span className="text-yellow-400 text-lg" style={{ filter: 'sepia(1) saturate(3) brightness(1.1) hue-rotate(5deg)' }}>🪙</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info block */}
        <div className="mt-8 bg-blue-900/30 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-200 mb-2">💡 Підказка</h3>
          <ul className="text-blue-200/80 text-sm space-y-1">
            <li>• <strong>Монети за прогулянку</strong> — скільки монет отримує користувач за кожну музичну прогулянку</li>
            <li>• <strong>Streak бонуси</strong> — одноразовий бонус коли користувач досягає відповідного streak</li>
            <li>• <strong>Множник XP</strong> — більше значення = легша прокачка (1.0 = нормально, 2.0 = вдвічі легше)</li>
            <li>• <strong>Базові очки за рівень</strong> — початкова кількість XP для переходу з 1 на 2 рівень</li>
          </ul>
        </div>

        {/* Dev Tools */}
        {user && (
          <div className="mt-8 bg-orange-900/30 border border-orange-500/30 rounded-lg overflow-hidden">
            <div className="bg-orange-900/50 px-6 py-4 border-b border-orange-500/30">
              <h2 className="text-xl font-bold text-orange-200">
                🛠️ Dev Tools
              </h2>
              <p className="text-orange-200/70 text-sm">
                Редагуй свої монетки та бали для тестування
              </p>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                <span>Поточний користувач:</span>
                <span className="text-white font-medium">{user.nickname}</span>
                <span className="text-gray-500">|</span>
                <span>Рівень: <span className="text-purple-400 font-medium">{user.level}</span></span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Coins */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl" style={{ filter: 'sepia(1) saturate(3) brightness(1.1) hue-rotate(5deg)' }}>🪙</span>
                    <div>
                      <h3 className="text-white font-medium">Монетки</h3>
                      <p className="text-gray-500 text-sm">Поточно: {user.coins.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={devCoins}
                      onChange={(e) => setDevCoins(parseInt(e.target.value) || 0)}
                      className="flex-1 px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                      min="0"
                    />
                    <button
                      onClick={async () => {
                        try {
                          setSavingDevStats(true);
                          const result = await adminApi.updateUserStats(user.id, { coins: devCoins });
                          updateUser({ ...user, coins: result.coins, level: result.level, total_points: result.total_points });
                          setMessage({ type: 'success', text: `Монетки оновлено: ${result.coins}` });
                          setTimeout(() => setMessage(null), 3000);
                        } catch (error) {
                          setMessage({ type: 'error', text: 'Помилка оновлення' });
                        } finally {
                          setSavingDevStats(false);
                        }
                      }}
                      disabled={savingDevStats || devCoins === user.coins}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        devCoins !== user.coins
                          ? 'bg-orange-600 hover:bg-orange-700 text-white'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {savingDevStats ? '...' : 'Зберегти'}
                    </button>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {[100, 1000, 10000, 100000].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setDevCoins(user.coins + amount)}
                        className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded transition-colors"
                      >
                        +{amount >= 1000 ? `${amount / 1000}k` : amount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Points */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">⚡</span>
                    <div>
                      <h3 className="text-white font-medium">Бали досвіду (XP)</h3>
                      <p className="text-gray-500 text-sm">Поточно: {user.total_points.toLocaleString()} (Рівень {user.level})</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={devPoints}
                      onChange={(e) => setDevPoints(parseInt(e.target.value) || 0)}
                      className="flex-1 px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                      min="0"
                    />
                    <button
                      onClick={async () => {
                        try {
                          setSavingDevStats(true);
                          const result = await adminApi.updateUserStats(user.id, { total_points: devPoints });
                          updateUser({ ...user, coins: result.coins, level: result.level, total_points: result.total_points });
                          setMessage({ type: 'success', text: `XP оновлено: ${result.total_points} (Рівень ${result.level})` });
                          setTimeout(() => setMessage(null), 3000);
                        } catch (error) {
                          setMessage({ type: 'error', text: 'Помилка оновлення' });
                        } finally {
                          setSavingDevStats(false);
                        }
                      }}
                      disabled={savingDevStats || devPoints === user.total_points}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        devPoints !== user.total_points
                          ? 'bg-orange-600 hover:bg-orange-700 text-white'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {savingDevStats ? '...' : 'Зберегти'}
                    </button>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {[100, 500, 1000, 5000, 10000].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setDevPoints(user.total_points + amount)}
                        className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded transition-colors"
                      >
                        +{amount >= 1000 ? `${amount / 1000}k` : amount}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick level presets */}
              <div className="mt-6 pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-sm mb-3">Швидке встановлення рівня:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { level: 1, points: 0 },
                    { level: 10, points: 5000 },
                    { level: 20, points: 20000 },
                    { level: 40, points: 80000 },
                    { level: 52, points: 150000 },
                    { level: 61, points: 300000 },
                    { level: 76, points: 800000 },
                    { level: 80, points: 1500000 },
                  ].map(({ level, points }) => (
                    <button
                      key={level}
                      onClick={() => setDevPoints(points)}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        level <= 19 ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' :
                        level <= 39 ? 'bg-green-900/50 hover:bg-green-900 text-green-300 border border-green-700' :
                        level <= 51 ? 'bg-blue-900/50 hover:bg-blue-900 text-blue-300 border border-blue-700' :
                        level <= 60 ? 'bg-purple-900/50 hover:bg-purple-900 text-purple-300 border border-purple-700' :
                        level <= 75 ? 'bg-orange-900/50 hover:bg-orange-900 text-orange-300 border border-orange-700' :
                        'bg-red-900/50 hover:bg-red-900 text-red-300 border border-red-700'
                      }`}
                    >
                      Lvl {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Race selector */}
              <div className="mt-6 pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-sm mb-3">🧝 Переключити расу:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { race: 'human', label: '👨 Human', color: 'bg-blue-900/50 hover:bg-blue-900 text-blue-300 border-blue-700' },
                    { race: 'elf', label: '🧝 Elf', color: 'bg-green-900/50 hover:bg-green-900 text-green-300 border-green-700' },
                    { race: 'dark_elf', label: '🧝‍♀️ Dark Elf', color: 'bg-purple-900/50 hover:bg-purple-900 text-purple-300 border-purple-700' },
                    { race: 'orc', label: '👹 Orc', color: 'bg-red-900/50 hover:bg-red-900 text-red-300 border-red-700' },
                    { race: 'dwarf', label: '🧔 Dwarf', color: 'bg-orange-900/50 hover:bg-orange-900 text-orange-300 border-orange-700' },
                  ].map(({ race, label, color }) => (
                    <button
                      key={race}
                      onClick={async () => {
                        if (race === user.race || savingRace) return;
                        try {
                          setSavingRace(true);
                          setDevRace(race);
                          const result = await adminApi.updateUserRace(user.id, race);
                          updateUser({ ...user, race: result.race as any });
                          setMessage({ type: 'success', text: `Раса змінена на ${label}` });
                          setTimeout(() => setMessage(null), 3000);
                        } catch (error) {
                          setDevRace(user.race);
                          setMessage({ type: 'error', text: 'Помилка зміни раси' });
                        } finally {
                          setSavingRace(false);
                        }
                      }}
                      disabled={savingRace}
                      className={`px-4 py-2 rounded text-sm font-medium transition-all border ${
                        user.race === race
                          ? `${color} ring-2 ring-white ring-offset-2 ring-offset-gray-900`
                          : `${color} opacity-60 hover:opacity-100`
                      }`}
                    >
                      {savingRace && devRace === race ? '...' : label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminSettingsPage;

