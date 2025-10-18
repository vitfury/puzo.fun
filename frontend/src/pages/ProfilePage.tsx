import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 h-32"></div>

          <div className="px-6 py-8">
            <div className="flex items-center mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-purple-500 rounded-full flex items-center justify-center text-white text-4xl font-bold -mt-16 border-4 border-gray-800">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                  <p className="text-gray-400">{user.email}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              <div className="bg-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Role</p>
                    <p className="text-white text-xl font-semibold capitalize">{user.role}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    user.role === 'admin' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}>
                    {user.role === 'admin' ? '👑' : '🎵'}
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{t('profile.avatarLevel')}</p>
                    <p className="text-white text-xl font-semibold">{user.avatar_level}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-2xl">
                    🥷
                  </div>
                </div>
              </div>

              <Link to="/points" className="bg-gray-700 rounded-lg p-6 hover:bg-gray-600 transition-colors cursor-pointer block">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{t('profile.totalPoints')}</p>
                    <p className="text-white text-xl font-semibold">{user.total_points}</p>
                    <p className="text-purple-400 text-xs mt-1">{t('points.viewHistory')} →</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-2xl">
                    ⭐
                  </div>
                </div>
              </Link>

              <div className="bg-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{t('profile.currentStreak')}</p>
                    <p className="text-white text-xl font-semibold">
                      {user.current_streak} {t('profile.days')}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {t('profile.longestStreak')}: {user.longest_streak} {t('profile.days')}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-2xl">
                    🔥
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">{t('profile.stats')}</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-600 pb-3">
                  <span className="text-gray-400">{t('profile.memberSince')}</span>
                  <span className="text-white font-medium">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">User ID</span>
                  <span className="text-white font-medium">#{user.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
