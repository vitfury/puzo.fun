import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { HealthDataModal } from '../components/profile/HealthDataModal';
import { shopApi } from '../api/shop';
import { getAvatarImagePath, getWeaponImagePath } from '../utils/avatar';
import type { LevelProgress } from '../types/user';

// Grade colors for equipment
const gradeColors: Record<string, string> = {
  'no-grade': 'text-gray-400',
  'D': 'text-blue-400',
  'C': 'text-green-400',
  'B': 'text-red-400',
  'A': 'text-purple-400',
  'S': 'text-yellow-400',
};

const gradeBgColors: Record<string, string> = {
  'no-grade': 'from-gray-600 to-gray-700',
  'D': 'from-blue-600 to-blue-700',
  'C': 'from-green-600 to-green-700',
  'B': 'from-red-600 to-red-700',
  'A': 'from-purple-600 to-purple-700',
  'S': 'from-yellow-500 to-amber-600',
};

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isFullHealthModalOpen, setIsFullHealthModalOpen] = useState(false);
  const [levelProgress, setLevelProgress] = useState<LevelProgress | null>(null);

  useEffect(() => {
    const fetchLevelProgress = async () => {
      try {
        const progress = await shopApi.levelProgress();
        setLevelProgress(progress);
      } catch (error) {
        console.error('Failed to fetch level progress:', error);
      }
    };

    if (user) {
      fetchLevelProgress();
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const getBMICategory = (bmi: number): { label: string; color: string } => {
    if (bmi < 18.5) return { label: t('profile.health.bmiUnderweight'), color: 'text-blue-400' };
    if (bmi < 25) return { label: t('profile.health.bmiNormal'), color: 'text-green-400' };
    if (bmi < 30) return { label: t('profile.health.bmiOverweight'), color: 'text-yellow-400' };
    return { label: t('profile.health.bmiObese'), color: 'text-red-400' };
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          {/* Header with gradient and progress bar */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 pt-6 pb-4">
            {levelProgress && !levelProgress.is_max_level && (
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-white/80 font-medium">
                    {t('profile.level', 'Рівень')} {levelProgress.current_level}
                  </span>
                  <span className="text-white/80 font-medium">
                    {t('profile.level', 'Рівень')} {levelProgress.next_level}
                  </span>
                </div>
                <div className="relative h-3 bg-black/30 rounded-full overflow-hidden backdrop-blur-sm">
                  <div 
                    className="absolute h-full bg-gradient-to-r from-yellow-400 to-yellow-200 transition-all duration-500 shadow-lg shadow-yellow-400/30"
                    style={{ width: `${levelProgress.progress_percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-yellow-200 font-semibold">
                    {levelProgress.progress_percent.toFixed(2)}%
                  </span>
                  <span className="text-white/90 font-semibold">
                    {levelProgress.points_in_level} / {levelProgress.points_needed} XP
                  </span>
                </div>
              </div>
            )}
            {levelProgress?.is_max_level && (
              <p className="text-center text-yellow-200 font-semibold">
                🏆 {t('profile.maxLevel', 'Максимальний рівень досягнуто!')}
              </p>
            )}
            {!levelProgress && <div className="h-12"></div>}
          </div>

          <div className="px-6 py-8">
            <div className="flex flex-col md:flex-row gap-6 items-stretch">
              {/* Left block - 75% width - Avatar display */}
              <div className="w-full md:w-3/4">
                <div className="flex flex-col items-center relative">
                  {/* User Info & Equipment Panel - top left */}
                  <div className="absolute top-0 left-0 bg-gray-700/90 backdrop-blur-sm rounded-lg p-3 z-10 w-auto">
                    <div className="space-y-2">
                      {/* Level */}
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⭐</span>
                        <span className="text-white font-bold">Lv. {user.level}</span>
                      </div>
                      
                      {/* Armor */}
                      <div className={`flex items-center gap-2 ${user.equipped_armor ? gradeColors[user.equipped_armor.grade] : 'text-gray-500'}`}>
                        <span className="text-lg">🛡️</span>
                        {user.equipped_armor ? (
                          <span className="font-medium">{user.equipped_armor.name}</span>
                        ) : (
                          <span className="italic text-sm">—</span>
                        )}
                      </div>
                      
                      {/* Weapon */}
                      <div className={`flex items-center gap-2 ${user.equipped_weapon ? gradeColors[user.equipped_weapon.grade] : 'text-gray-500'}`}>
                        <span className="text-lg">⚔️</span>
                        {user.equipped_weapon ? (
                          <span className="font-medium">{user.equipped_weapon.name}</span>
                        ) : (
                          <span className="italic text-sm">—</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Avatar with nickname - centered block */}
                  <div className="profile-avatar-wrapper">
                    {/* Nickname above avatar */}
                    <h1 className="text-3xl font-bold text-white mb-4 text-center">
                      {user.nickname}
                    </h1>
                    
                    {/* Avatar image container */}
                    <div className="profile-avatar-container">
                      {/* Glow effect behind avatar based on armor grade */}
                      <div className={`absolute inset-0 blur-2xl opacity-30 rounded-full bg-gradient-to-br ${
                        user.equipped_armor 
                          ? gradeBgColors[user.equipped_armor.grade] 
                          : 'from-gray-500 to-gray-600'
                      }`} />
                      
                      {/* Inner container with overflow hidden for armor only */}
                      <div className="profile-avatar-inner">
                        {/* Avatar (armor) layer */}
                        <div
                          className={`profile-armor race-${user.race}`}
                          style={{
                            backgroundImage: `url(${getAvatarImagePath(user.race, user.equipped_armor)})`,
                          }}
                        />
                      </div>
                      
                      {/* Weapon overlay - OUTSIDE inner container so it's not clipped */}
                      {user.equipped_weapon && getWeaponImagePath(user.equipped_weapon) && (
                        <div
                          className={`profile-weapon race-${user.race}`}
                          style={{
                            backgroundImage: `url(${getWeaponImagePath(user.equipped_weapon)})`,
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right block - 25% width */}
              <div className="w-full md:w-1/4 flex flex-col justify-between -mt-8 md:mt-0">
                {/* Top section - XP/Coins */}
                <div className="space-y-4">
                  {/* XP & Coins Panel */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-3">
                      {/* XP */}
                      <Link to="/points" className="block hover:opacity-80 transition-opacity">
                        <div className="bg-gray-600 rounded-lg p-3 text-center">
                          <div className="w-10 h-10 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-xl mb-1">
                            ⚡
                          </div>
                          <p className="text-gray-400 text-xs">{t('profile.xp', 'Досвід')}</p>
                          <p className="text-white font-bold">{user.total_points.toLocaleString()}</p>
                        </div>
                      </Link>
                      {/* Coins */}
                      <Link to="/shop" className="block hover:opacity-80 transition-opacity">
                        <div className="bg-gray-600 rounded-lg p-3 text-center">
                          <div className="w-10 h-10 mx-auto bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-xl mb-1">
                            <span style={{ filter: 'sepia(1) saturate(3) brightness(1.1) hue-rotate(5deg)' }}>🪙</span>
                          </div>
                          <p className="text-gray-400 text-xs">{t('profile.coins', 'Монетки')}</p>
                          <p className="text-white font-bold">{user.coins.toLocaleString()}</p>
                        </div>
                      </Link>
                    </div>
                    <Link 
                      to="/shop" 
                      className="block mt-3 text-center text-sm text-purple-400 hover:text-purple-300"
                    >
                      🛒 {t('profile.goToShop', 'Перейти в магазин')} →
                    </Link>
                  </div>
                </div>

                {/* Bottom section - Health & Streak */}
                <div className="space-y-4">
                  {/* Health Indicators Tile */}
                  <div
                    className="bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors relative"
                    onClick={() => setIsFullHealthModalOpen(true)}
                  >
                    <div>
                      <p className="text-gray-400 text-sm mb-3">{t('profile.health.title')}</p>
                      <div className="space-y-2 text-sm">
                        {user.age && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">{t('profile.health.age')}:</span>
                            <span className="text-white font-semibold">{user.age}</span>
                          </div>
                        )}
                        {user.height && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">{t('profile.health.height')}:</span>
                            <span className="text-white font-semibold">{user.height} см</span>
                          </div>
                        )}
                        {user.weight && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">{t('profile.health.weight')}:</span>
                            <span className="text-white font-semibold">{user.weight} кг</span>
                          </div>
                        )}
                        {user.waist_circumference && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">{t('profile.health.waist')}:</span>
                            <span className="text-white font-semibold">{user.waist_circumference} см</span>
                          </div>
                        )}
                        {user.bmi && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">{t('profile.health.bmi')}:</span>
                            <span className={`font-semibold ${getBMICategory(user.bmi).color}`}>
                              {user.bmi}
                            </span>
                          </div>
                        )}
                        {user.body_fat_percentage && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">{t('profile.health.bodyFat')}:</span>
                            <span className="text-white font-semibold">{user.body_fat_percentage}%</span>
                          </div>
                        )}
                        {!user.age && !user.height && !user.weight && !user.waist_circumference && !user.body_fat_percentage && (
                          <p className="text-gray-500 text-center py-2">
                            {t('profile.health.noData')}
                          </p>
                        )}
                      </div>
                      <p className="text-purple-400 text-xs mt-3 text-center">
                        {t('profile.health.clickToEdit')}
                      </p>
                    </div>
                  </div>

                  {/* Streak Section */}
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">{t('profile.currentStreak')}</p>
                        <p className="text-white text-xl font-semibold">
                          {user.current_music_walk_streak} {t('profile.days')}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          {t('profile.longestStreak')}: {user.longest_music_walk_streak} {t('profile.days')}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-2xl">
                        🔥
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gray-700 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">{t('profile.stats')}</h2>
                <button
                  onClick={() => setIsWeightModalOpen(true)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    user.needs_weight_update
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 animate-pulse'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  📊 {t('profile.health.updateMetrics')}
                </button>
              </div>
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
                <div className="flex justify-between items-center border-b border-gray-600 pb-3">
                  <span className="text-gray-400">{t('profile.availableGrade', 'Доступний грейд')}</span>
                  <span className={`font-medium ${gradeColors[user.available_grade]}`}>
                    {user.available_grade === 'no-grade' ? 'No Grade' : user.available_grade}
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

      <HealthDataModal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        mode="weight"
      />
      <HealthDataModal
        isOpen={isFullHealthModalOpen}
        onClose={() => setIsFullHealthModalOpen(false)}
        mode="all"
      />
    </Layout>
  );
};
