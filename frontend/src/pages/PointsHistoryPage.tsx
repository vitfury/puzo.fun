import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout';
import { pointsApi } from '../api/points';
import type { PointTransaction } from '../types/points';

export const PointsHistoryPage = () => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await pointsApi.getTransactions(days);
        setTransactions(data);
        setError(null);
      } catch (err) {
        setError(t('points.errorLoading'));
        console.error('Error loading transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [days, t]);

  const getTransactionIcon = (reason: string) => {
    if (reason.includes('activity') || reason.includes('Activity')) return '✓';
    if (reason.includes('step') || reason.includes('Step')) return '👣';
    if (reason.includes('bonus')) return '🎁';
    return '⭐';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return t('points.today');
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t('points.yesterday');
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const totalPoints = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{t('points.history')}</h1>
          <p className="text-gray-400">{t('points.historyDescription')}</p>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2 mb-6">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                days === d
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {t('points.lastDays', { count: d })}
            </button>
          ))}
        </div>

        {/* Summary card */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">{t('points.periodTotal')}</p>
              <p className="text-white text-3xl font-bold">
                {totalPoints > 0 ? '+' : ''}{totalPoints.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-purple-200 text-sm">{t('points.transactions')}</p>
              <p className="text-white text-2xl font-bold">{transactions.length}</p>
            </div>
          </div>
        </div>

        {/* Transactions list */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">{t('points.loading')}</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-400">{error}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 text-lg">{t('points.noTransactions')}</p>
              <p className="text-gray-500 text-sm mt-2">{t('points.completeActivities')}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-4 hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                        transaction.amount > 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        {getTransactionIcon(transaction.reason)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{transaction.reason}</p>
                        <div className="flex gap-3 text-sm text-gray-400 mt-1">
                          <span>{formatDate(transaction.created_at)}</span>
                          <span>{formatTime(transaction.created_at)}</span>
                        </div>
                        {transaction.metadata && (
                          <p className="text-xs text-gray-500 mt-1">
                            {JSON.stringify(transaction.metadata)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
