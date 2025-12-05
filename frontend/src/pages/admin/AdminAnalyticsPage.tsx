import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/Layout';
import { adminApi } from '../../api/admin';

interface DailyData {
  date: string;
  user_id: number;
  user_nickname: string;
  user_email: string;
  activities: Array<{
    id: number;
    name: string;
    type: string;
    coins: number;
    experience: number;
    completed_at: string;
  }>;
  coin_transactions: Array<{
    id: number;
    amount: number;
    reason: string;
    created_at: string;
    metadata: any;
  }>;
  point_transactions: Array<{
    id: number;
    amount: number;
    reason: string;
    created_at: string;
    metadata: any;
  }>;
  summary: {
    activities_count: number;
    coins_earned: number;
    coins_spent: number;
    coins_net: number;
    points_earned: number;
    points_spent: number;
    points_net: number;
  };
}

interface User {
  id: number;
  nickname: string;
  email: string;
  role: string;
}

export const AdminAnalyticsPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DailyData[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [days, setDays] = useState(30);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadUsers();
    loadData();
  }, []);

  const loadUsers = async () => {
    try {
      const usersData = await adminApi.getAnalyticsUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedUserId) params.user_id = selectedUserId;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (!startDate && !endDate) params.days = days;

      const [analyticsData, summaryData] = await Promise.all([
        adminApi.getDailyAnalytics(params),
        adminApi.getAnalyticsSummary(params),
      ]);

      setData(analyticsData.data);
      setSummary(summaryData.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDate = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('uk-UA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getReasonLabel = (reason: string) => {
    const reasonMap: Record<string, string> = {
      music_walk: t('admin.analytics.reason.musicWalk', 'Музична прогулянка'),
      streak_bonus: t('admin.analytics.reason.streakBonus', 'Бонус за стрік'),
      purchase: t('admin.analytics.reason.purchase', 'Покупка'),
      sell: t('admin.analytics.reason.sell', 'Продаж'),
      admin: t('admin.analytics.reason.admin', 'Адміністратор'),
      'Step bonus': t('admin.analytics.reason.stepBonus', 'Бонус за кроки'),
      'Step bonus adjustment': t('admin.analytics.reason.stepBonusAdjustment', 'Коригування бонусу за кроки'),
    };
    // Check if reason contains "Completed activity:" or "Streak bonus"
    if (reason.includes('Completed activity:')) {
      return t('admin.analytics.reason.completedActivity', 'Виконання активності');
    }
    if (reason.includes('Streak bonus')) {
      return t('admin.analytics.reason.streakBonusActivity', 'Бонус за стрік активності');
    }
    return reasonMap[reason] || reason;
  };

  // Group data by date
  const groupedByDate = data.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = [];
    }
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, DailyData[]>);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link
            to="/admin"
            className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-4"
          >
            ← {t('common.back', 'Назад')} до адмін панелі
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">
            {t('admin.analytics.title', 'Аналітика користувачів')}
          </h1>
          <p className="text-gray-400">
            {t('admin.analytics.subtitle', 'Перегляд активностей та балансів користувачів по днях')}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('admin.analytics.user', 'Користувач')}
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : '')}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="">{t('admin.analytics.allUsers', 'Всі користувачі')}</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.nickname} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('admin.analytics.days', 'Днів')}
              </label>
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                min="1"
                max="365"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                disabled={!!startDate || !!endDate}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('admin.analytics.startDate', 'Дата початку')}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('admin.analytics.endDate', 'Дата кінця')}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              />
            </div>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? t('common.loading', 'Завантаження...') : t('common.apply', 'Застосувати')}
          </button>
        </div>

        {/* Summary */}
        {summary && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              {t('admin.analytics.summary', 'Загальна статистика')}
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-gray-700/50 rounded p-4">
                <div className="text-gray-400 text-sm mb-1">
                  {t('admin.analytics.totalActivities', 'Всього активностей')}
                </div>
                <div className="text-2xl font-bold text-white">{summary.total_activities}</div>
              </div>
              <div className="bg-gray-700/50 rounded p-4">
                <div className="text-gray-400 text-sm mb-1">
                  {t('admin.analytics.coinsEarned', 'Монет отримано')}
                </div>
                <div className="text-2xl font-bold text-green-400">+{summary.total_coins_earned}</div>
              </div>
              <div className="bg-gray-700/50 rounded p-4">
                <div className="text-gray-400 text-sm mb-1">
                  {t('admin.analytics.coinsSpent', 'Монет витрачено')}
                </div>
                <div className="text-2xl font-bold text-red-400">-{summary.total_coins_spent}</div>
              </div>
              <div className="bg-gray-700/50 rounded p-4">
                <div className="text-gray-400 text-sm mb-1">
                  {t('admin.analytics.coinsNet', 'Монет (нетто)')}
                </div>
                <div className={`text-2xl font-bold ${summary.total_coins_net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {summary.total_coins_net >= 0 ? '+' : ''}{summary.total_coins_net}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Daily Data */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            {t('common.loading', 'Завантаження...')}
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {t('admin.analytics.noData', 'Немає даних за вибраний період')}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedByDate)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([date, items]) => (
                <div
                  key={date}
                  className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleDate(date)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{expandedDates.has(date) ? '▼' : '▶'}</span>
                      <div>
                        <div className="text-lg font-semibold text-white">
                          {formatDate(date)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {items.length} {t('admin.analytics.users', 'користувачів')}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <div>
                        <span className="text-gray-400">
                          {t('admin.analytics.activities', 'Активності')}:
                        </span>{' '}
                        <span className="text-white font-medium">
                          {items.reduce((sum, item) => sum + item.summary.activities_count, 0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">
                          {t('admin.analytics.coins', 'Монети')}:
                        </span>{' '}
                        <span className="text-green-400 font-medium">
                          +{items.reduce((sum, item) => sum + item.summary.coins_earned, 0)}
                        </span>
                        {' / '}
                        <span className="text-red-400 font-medium">
                          -{items.reduce((sum, item) => sum + item.summary.coins_spent, 0)}
                        </span>
                      </div>
                    </div>
                  </button>

                  {expandedDates.has(date) && (
                    <div className="border-t border-gray-700">
                      {items.map((item) => (
                        <div
                          key={`${date}-${item.user_id}`}
                          className="border-b border-gray-700 last:border-b-0"
                        >
                          <div className="px-6 py-4 bg-gray-900/50">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <div className="font-semibold text-white">
                                  {item.user_nickname}
                                </div>
                                <div className="text-sm text-gray-400">{item.user_email}</div>
                              </div>
                              <div className="flex gap-6 text-sm">
                                <div>
                                  <span className="text-gray-400">
                                    {t('admin.analytics.activities', 'Активності')}:
                                  </span>{' '}
                                  <span className="text-white font-medium">
                                    {item.summary.activities_count}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400">
                                    {t('admin.analytics.coins', 'Монети')}:
                                  </span>{' '}
                                  <span className="text-green-400 font-medium">
                                    +{item.summary.coins_earned}
                                  </span>
                                  {' / '}
                                  <span className="text-red-400 font-medium">
                                    -{item.summary.coins_spent}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-400">
                                    {t('admin.analytics.points', 'Очки')}:
                                  </span>{' '}
                                  <span className="text-blue-400 font-medium">
                                    +{item.summary.points_earned}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Activities */}
                            {item.activities.length > 0 && (
                              <div className="mb-3">
                                <div className="text-sm font-medium text-gray-300 mb-2">
                                  {t('admin.analytics.completedActivities', 'Виконані активності')}:
                                </div>
                                <div className="space-y-1">
                                  {item.activities.map((activity) => (
                                    <div
                                      key={activity.id}
                                      className="text-sm bg-gray-800/50 rounded px-3 py-2 flex items-center justify-between"
                                    >
                                      <div>
                                        <span className="text-white font-medium">{activity.name}</span>
                                        <span className="text-gray-400 ml-2">({activity.type})</span>
                                      </div>
                                      <div className="flex gap-4 text-xs">
                                        {activity.coins > 0 && (
                                          <span className="text-green-400">
                                            🪙 +{activity.coins}
                                          </span>
                                        )}
                                        {activity.experience > 0 && (
                                          <span className="text-blue-400">
                                            ⚡ +{activity.experience}
                                          </span>
                                        )}
                                        <span className="text-gray-400">
                                          {formatDateTime(activity.completed_at)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Coin Transactions */}
                            <div className="mb-3">
                              <div className="text-sm font-medium text-gray-300 mb-2">
                                {t('admin.analytics.coinTransactions', 'Транзакції монет')}:
                                {item.coin_transactions.length === 0 && (
                                  <span className="text-gray-500 ml-2 text-xs font-normal">
                                    (немає транзакцій)
                                  </span>
                                )}
                              </div>
                              {item.coin_transactions.length > 0 ? (
                                <div className="space-y-1">
                                  {item.coin_transactions.map((tx) => (
                                    <div
                                      key={tx.id}
                                      className="text-sm bg-gray-800/50 rounded px-3 py-2 flex items-center justify-between"
                                    >
                                      <div>
                                        <span className={tx.amount > 0 ? 'text-green-400' : 'text-red-400'}>
                                          {tx.amount > 0 ? '+' : ''}{tx.amount} 🪙
                                        </span>
                                        <span className="text-gray-400 ml-2">
                                          {getReasonLabel(tx.reason)}
                                        </span>
                                        {tx.metadata && Object.keys(tx.metadata).length > 0 && (
                                          <span className="text-gray-500 ml-2 text-xs">
                                            ({JSON.stringify(tx.metadata)})
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-gray-400 text-xs">
                                        {formatDateTime(tx.created_at)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-xs text-gray-500 italic">
                                  Немає транзакцій монет за цей день
                                </div>
                              )}
                            </div>

                            {/* Point Transactions */}
                            <div>
                              <div className="text-sm font-medium text-gray-300 mb-2">
                                {t('admin.analytics.pointTransactions', 'Транзакції очок')}:
                                {item.point_transactions.length === 0 && (
                                  <span className="text-gray-500 ml-2 text-xs font-normal">
                                    (немає транзакцій)
                                  </span>
                                )}
                              </div>
                              {item.point_transactions.length > 0 ? (
                                <div className="space-y-1">
                                  {item.point_transactions.map((tx) => (
                                    <div
                                      key={tx.id}
                                      className="text-sm bg-gray-800/50 rounded px-3 py-2 flex items-center justify-between"
                                    >
                                      <div>
                                        <span className={tx.amount > 0 ? 'text-blue-400' : 'text-red-400'}>
                                          {tx.amount > 0 ? '+' : ''}{tx.amount} ⚡
                                        </span>
                                        <span className="text-gray-400 ml-2">{tx.reason}</span>
                                        {tx.metadata && Object.keys(tx.metadata).length > 0 && (
                                          <span className="text-gray-500 ml-2 text-xs">
                                            ({JSON.stringify(tx.metadata)})
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-gray-400 text-xs">
                                        {formatDateTime(tx.created_at)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-xs text-gray-500 italic">
                                  Немає транзакцій очок за цей день
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminAnalyticsPage;

