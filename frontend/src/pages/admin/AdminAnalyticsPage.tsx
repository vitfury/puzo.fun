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

interface Transaction {
  id: number;
  type: 'coin' | 'point';
  user_id: number;
  user_nickname: string;
  user_email: string;
  amount: number;
  reason: string;
  metadata: any;
  created_at: string;
  date: string;
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
  const [activeTab, setActiveTab] = useState<'daily' | 'transactions'>('daily');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionTotals, setTransactionTotals] = useState<any>(null);
  const [transactionType, setTransactionType] = useState<'all' | 'coins' | 'points'>('all');
  const [transactionLoading, setTransactionLoading] = useState(false);

  useEffect(() => {
    loadUsers();
    if (activeTab === 'daily') {
      loadData();
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'transactions') {
      loadTransactions();
    }
  }, [activeTab, selectedUserId, startDate, endDate, days, transactionType]);

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

  const loadTransactions = async () => {
    setTransactionLoading(true);
    try {
      const params: any = {};
      if (selectedUserId) params.user_id = selectedUserId;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (!startDate && !endDate) params.days = days;
      params.type = transactionType;
      params.limit = 1000;

      const transactionData = await adminApi.getTransactionLog(params);
      setTransactions(transactionData.data);
      setTransactionTotals(transactionData.totals);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setTransactionLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'transactions') {
      loadTransactions();
    }
  }, [activeTab, selectedUserId, startDate, endDate, days, transactionType]);

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

        {/* Tabs */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-2 mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'daily'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {t('admin.analytics.tab.daily', 'По днях')}
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'transactions'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {t('admin.analytics.tab.transactions', 'Лог транзакцій')}
          </button>
        </div>

        {/* Summary */}
        {summary && activeTab === 'daily' && (
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

        {/* Transaction Log Tab */}
        {activeTab === 'transactions' && (
          <>
            {/* Transaction Filters */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 mb-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('admin.analytics.transactionType', 'Тип транзакцій')}
                  </label>
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value as 'all' | 'coins' | 'points')}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  >
                    <option value="all">{t('admin.analytics.allTypes', 'Всі типи')}</option>
                    <option value="coins">{t('admin.analytics.coins', 'Монети')}</option>
                    <option value="points">{t('admin.analytics.points', 'Очки')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Transaction Totals */}
            {transactionTotals && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {t('admin.analytics.transactionTotals', 'Підсумки транзакцій')}
                </h2>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-gray-700/50 rounded p-4">
                    <div className="text-gray-400 text-sm mb-1">
                      {t('admin.analytics.coinsEarned', 'Монет отримано')}
                    </div>
                    <div className="text-2xl font-bold text-green-400">+{transactionTotals.coins_earned}</div>
                  </div>
                  <div className="bg-gray-700/50 rounded p-4">
                    <div className="text-gray-400 text-sm mb-1">
                      {t('admin.analytics.coinsSpent', 'Монет витрачено')}
                    </div>
                    <div className="text-2xl font-bold text-red-400">-{transactionTotals.coins_spent}</div>
                  </div>
                  <div className="bg-gray-700/50 rounded p-4">
                    <div className="text-gray-400 text-sm mb-1">
                      {t('admin.analytics.pointsEarned', 'Очок отримано')}
                    </div>
                    <div className="text-2xl font-bold text-blue-400">+{transactionTotals.points_earned}</div>
                  </div>
                  <div className="bg-gray-700/50 rounded p-4">
                    <div className="text-gray-400 text-sm mb-1">
                      {t('admin.analytics.pointsSpent', 'Очок витрачено')}
                    </div>
                    <div className="text-2xl font-bold text-red-400">-{transactionTotals.points_spent}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction List */}
            {transactionLoading ? (
              <div className="text-center py-12 text-gray-400">
                {t('common.loading', 'Завантаження...')}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                {t('admin.analytics.noTransactions', 'Немає транзакцій за вибраний період')}
              </div>
            ) : (
              <>
                {/* Transaction Stats */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4 mb-4">
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-gray-400">
                        {t('admin.analytics.totalTransactions', 'Всього транзакцій')}:
                      </span>{' '}
                      <span className="text-white font-medium">{transactions.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">
                        {t('admin.analytics.coinTransactions', 'Транзакції монет')}:
                      </span>{' '}
                      <span className="text-yellow-400 font-medium">
                        {transactions.filter(tx => tx.type === 'coin').length}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">
                        {t('admin.analytics.pointTransactions', 'Транзакції очок')}:
                      </span>{' '}
                      <span className="text-blue-400 font-medium">
                        {transactions.filter(tx => tx.type === 'point').length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                    <thead className="bg-gray-900/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                          {t('admin.analytics.table.date', 'Дата/Час')}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                          {t('admin.analytics.table.user', 'Користувач')}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                          {t('admin.analytics.table.type', 'Тип')}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                          {t('admin.analytics.table.amount', 'Сума')}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                          {t('admin.analytics.table.reason', 'Причина')}
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                          {t('admin.analytics.table.details', 'Деталі')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {transactions.map((tx) => (
                        <tr key={`${tx.type}-${tx.id}`} className="hover:bg-gray-700/30">
                          <td className="px-4 py-3 text-sm text-gray-300">
                            <div>{formatDate(tx.date)}</div>
                            <div className="text-xs text-gray-500">
                              {formatDateTime(tx.created_at).split(', ')[1]}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="text-white font-medium">{tx.user_nickname}</div>
                            <div className="text-xs text-gray-400">{tx.user_email}</div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              tx.type === 'coin' 
                                ? 'bg-yellow-500/20 text-yellow-400' 
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {tx.type === 'coin' ? '🪙 Монети' : '⚡ Очки'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`font-bold ${
                              tx.amount > 0 
                                ? tx.type === 'coin' ? 'text-green-400' : 'text-blue-400'
                                : 'text-red-400'
                            }`}>
                              {tx.amount > 0 ? '+' : ''}{tx.amount}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-300">
                            {getReasonLabel(tx.reason)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">
                            {tx.metadata && Object.keys(tx.metadata).length > 0 ? (
                              <details className="cursor-pointer">
                                <summary className="text-purple-400 hover:text-purple-300">
                                  {t('admin.analytics.viewDetails', 'Деталі')}
                                </summary>
                                <pre className="mt-2 text-xs bg-gray-900/50 p-2 rounded overflow-auto max-w-xs">
                                  {JSON.stringify(tx.metadata, null, 2)}
                                </pre>
                              </details>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              </>
            )}
          </>
        )}

        {/* Daily Data */}
        {activeTab === 'daily' && loading ? (
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

