import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { ratingApi, type RatingPlayer, type SortField } from '../api/rating';
import { getAvatarImagePath, getWeaponImagePath } from '../utils/avatar';

// Grade colors
const gradeColors: Record<string, string> = {
  'no-grade': 'text-gray-400',
  'D': 'text-blue-400',
  'C': 'text-green-400',
  'B': 'text-red-400',
  'A': 'text-purple-400',
  'S': 'text-yellow-400',
};

const gradeBorderColors: Record<string, string> = {
  'no-grade': 'border-gray-600',
  'D': 'border-blue-500',
  'C': 'border-green-500',
  'B': 'border-red-500',
  'A': 'border-purple-500',
  'S': 'border-yellow-500',
};

const gradeGlowColors: Record<string, string> = {
  'no-grade': '',
  'D': 'shadow-blue-500/30',
  'C': 'shadow-green-500/30',
  'B': 'shadow-red-500/40',
  'A': 'shadow-purple-500/50',
  'S': 'shadow-yellow-400/60',
};

const rankBadgeStyles: Record<number, string> = {
  1: 'bg-gradient-to-br from-yellow-400 via-amber-300 to-yellow-500 text-black shadow-lg shadow-yellow-500/50',
  2: 'bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300 text-gray-800 shadow-lg shadow-gray-400/50',
  3: 'bg-gradient-to-br from-amber-600 via-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/50',
};

const rankEmoji: Record<number, string> = {
  1: '👑',
  2: '🥈',
  3: '🥉',
};

export const RatingPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [players, setPlayers] = useState<RatingPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortField>('total_points');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchRating = async () => {
      try {
        setLoading(true);
        const data = await ratingApi.list(sortBy, sortDirection);
        setPlayers(data);
        setError(null);
      } catch (err) {
        setError('Failed to load rating');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRating();
  }, [sortBy, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortBy !== field) return '↕️';
    return sortDirection === 'desc' ? '⬇️' : '⬆️';
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-2">
        {/* Header */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-5 mb-6 border border-purple-500/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🏆</div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400">
                  {t('rating.title')}
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  {t('rating.subtitle')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">{t('rating.totalPlayers')}</p>
              <p className="text-3xl font-bold text-white">{players.length}</p>
            </div>
          </div>
        </div>

        {/* Sort buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => handleSort('total_points')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              sortBy === 'total_points'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            ⚡ {t('rating.sortXP')} {getSortIcon('total_points')}
          </button>
          <button
            onClick={() => handleSort('level')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              sortBy === 'level'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            ⭐ {t('rating.sortLevel')} {getSortIcon('level')}
          </button>
          <button
            onClick={() => handleSort('coins')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              sortBy === 'coins'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span style={{ filter: 'sepia(1) saturate(3) brightness(1.1) hue-rotate(5deg)' }}>🪙</span> {t('rating.sortCoins')} {getSortIcon('coins')}
          </button>
          <button
            onClick={() => handleSort('current_music_walk_streak')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              sortBy === 'current_music_walk_streak'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🔥 {t('rating.sortStreak')} {getSortIcon('current_music_walk_streak')}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-400 mt-4">{t('rating.loading')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {players.map((player) => {
              const isCurrentUser = player.id === user.id;
              const armorGrade = player.equipped_armor?.grade || 'no-grade';
              
              return (
                <div
                  key={player.id}
                  className={`relative bg-gray-800/90 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] border-2 ${
                    isCurrentUser 
                      ? 'ring-2 ring-purple-400 border-purple-500 shadow-xl shadow-purple-500/30' 
                      : `${gradeBorderColors[armorGrade]} hover:shadow-xl ${gradeGlowColors[armorGrade]}`
                  }`}
                >
                  {/* Rank Badge */}
                  <div className={`absolute top-3 left-3 z-20 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                    rankBadgeStyles[player.rank] || 'bg-gray-700/90 text-gray-200 backdrop-blur-sm'
                  }`}>
                    {rankEmoji[player.rank] || `#${player.rank}`}
                  </div>

                  {/* Level Badge */}
                  <div className="absolute top-3 right-3 z-20">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-lg">
                      Lv.{player.level}
                    </div>
                  </div>

                  {/* Full Avatar with Armor and Weapon */}
                  <div className="w-full aspect-[2/3] bg-gray-900 relative overflow-hidden z-0">
                    {/* Armor layer */}
                    <div 
                      className={`absolute inset-0 bg-no-repeat bg-center rating-armor race-${player.race}`}
                      style={{
                        backgroundImage: `url(${getAvatarImagePath(player.race, player.equipped_armor)})`,
                        backgroundSize: '160%',
                        backgroundPosition: '52% 80%',
                      }}
                    />
                    {/* Weapon layer - on top of armor */}
                    {player.equipped_weapon && getWeaponImagePath(player.equipped_weapon) && (
                      <div
                        className={`absolute rating-weapon race-${player.race}`}
                        style={{
                          backgroundImage: `url(${getWeaponImagePath(player.equipped_weapon)})`,
                        }}
                      />
                    )}
                  </div>

                  {/* Player Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent pt-16 pb-4 px-4 z-30">
                    {/* Nickname */}
                    <h3 className={`font-bold text-lg text-center truncate mb-2 ${
                      isCurrentUser ? 'text-purple-300' : 'text-white'
                    }`}>
                      {player.nickname}
                      {isCurrentUser && (
                        <span className="ml-1 text-xs text-purple-400">({t('rating.you')})</span>
                      )}
                    </h3>

                    {/* Equipment */}
                    <div className="flex flex-col items-center gap-1 text-xs mb-3">
                      {player.equipped_armor && (
                        <span className={`flex items-center gap-1 ${gradeColors[player.equipped_armor.grade]}`}>
                          🛡️ {player.equipped_armor.name}
                        </span>
                      )}
                      {player.equipped_weapon && (
                        <span className={`flex items-center gap-1 ${gradeColors[player.equipped_weapon.grade]}`}>
                          ⚔️ {player.equipped_weapon.name}
                        </span>
                      )}
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-center gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-purple-400">⚡</span>
                        <span className="text-gray-300 font-medium">{player.total_points.toLocaleString()}</span>
                      </div>
                      <div className="w-px h-3 bg-gray-600"></div>
                      <div className="flex items-center gap-1">
                        <span style={{ filter: 'sepia(1) saturate(3) brightness(1.1) hue-rotate(5deg)' }}>🪙</span>
                        <span className="text-yellow-400 font-medium">{player.coins.toLocaleString()}</span>
                      </div>
                      <div className="w-px h-3 bg-gray-600"></div>
                      <div className="flex items-center gap-1">
                        <span>🔥</span>
                        <span className="text-orange-400 font-medium">{player.current_music_walk_streak}</span>
                      </div>
                    </div>
                  </div>

                  {/* Top 3 special effects */}
                  {player.rank === 1 && (
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-yellow-400/10 via-transparent to-transparent" />
                  )}
                  {player.rank === 2 && (
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-gray-300/10 via-transparent to-transparent" />
                  )}
                  {player.rank === 3 && (
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-amber-500/10 via-transparent to-transparent" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {players.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-6xl mb-4">🏜️</div>
            <p>{t('rating.noPlayers')}</p>
          </div>
        )}
      </div>
    </Layout>
  );
};
