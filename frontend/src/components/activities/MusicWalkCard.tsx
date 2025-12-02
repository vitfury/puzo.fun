import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Activity } from '../../types/activity';
import type { Genre } from '../../types/genre';
import { genreApi } from '../../api/genres';
import { useAuth } from '../../contexts/AuthContext';

interface MusicWalkCardProps {
  activities: Activity[];
  onToggle: (activityId: number, isCompleted: boolean) => Promise<void>;
}

export function MusicWalkCard({ activities, onToggle }: MusicWalkCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [currentGenre, setCurrentGenre] = useState<Genre | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);

  // Flatten genre tree
  const flattenGenres = (genreList: Genre[]): Genre[] => {
    const result: Genre[] = [];
    const flatten = (g: Genre) => {
      result.push(g);
      if (g.children) {
        g.children.forEach(flatten);
      }
    };
    genreList.forEach(flatten);
    return result;
  };

  // Load genres on mount
  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    try {
      setIsLoadingGenres(true);
      const response = await genreApi.getTree();
      const flatGenres = flattenGenres(response.data);
      setGenres(flatGenres);
      
      // Find current available genre (first available but not completed)
      const availableGenre = flatGenres.find(
        (g) => g.user_progress?.is_available && !g.user_progress?.is_completed
      );
      if (availableGenre) {
        setCurrentGenre(availableGenre);
      }
    } catch (err) {
      console.error('Failed to load genres:', err);
    } finally {
      setIsLoadingGenres(false);
    }
  };

  const handleOpenGenreMap = () => {
    navigate('/genres');
  };

  const handleCompleteWalk = async () => {
    if (activities.length === 0 || isLoading) return;
    
    const musicWalkActivity = activities[0];
    setIsLoading(true);
    try {
      await onToggle(musicWalkActivity.id, !musicWalkActivity.is_completed);
    } finally {
      setIsLoading(false);
    }
  };

  if (activities.length === 0) return null;

  const musicWalkActivity = activities[0];
  const isCompleted = musicWalkActivity?.is_completed || false;
  const completedCount = activities.filter((a) => a.is_completed).length;
  const streak = user?.current_music_walk_streak || 0;

  // Count available and completed genres
  const completedGenresCount = genres.filter(g => g.user_progress?.is_completed).length;
  const availableGenresCount = genres.filter(g => g.user_progress?.is_available && !g.user_progress?.is_completed).length;

  return (
    <>
      <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-xl border border-purple-700/50 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-purple-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎵</span>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {t('activities.musicWalkCard.title')}
                </h2>
                <p className="text-sm text-gray-400">
                  {completedCount}/{activities.length} {t('activities.completed').toLowerCase()}
                </p>
              </div>
            </div>
            
            {/* Streak Badge */}
            {streak > 0 && (
              <div className="flex items-center gap-2 bg-orange-900/40 px-3 py-1.5 rounded-full border border-orange-600/50">
                <span className="text-lg">🔥</span>
                <span className="text-orange-400 font-bold">{streak}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Genre Selection Section - Prominent Icons */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center justify-between gap-4">
              {/* Current Genre Display */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                  {t('activities.musicWalkCard.currentGenre')}
                </p>
                {isLoadingGenres ? (
                  <div className="h-6 bg-gray-700 rounded animate-pulse w-32"></div>
                ) : currentGenre ? (
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-white truncate">
                      {currentGenre.name}
                    </span>
                    {currentGenre.user_progress?.is_completed && (
                      <span className="text-green-400 flex-shrink-0">✓</span>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-500 italic">
                    {t('activities.musicWalkCard.notStarted')}
                  </span>
                )}
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Open Genre Map Button */}
                <button
                  onClick={handleOpenGenreMap}
                  className="relative flex items-center justify-center w-12 h-12 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 rounded-xl transition-all group hover:scale-105 active:scale-95"
                  title={t('genres.openMap')}
                >
                  {/* Map Icon */}
                  <svg 
                    className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" 
                    />
                  </svg>
                  {/* Badge with available genres count */}
                  {availableGenresCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-purple-500 text-white text-xs font-bold rounded-full px-1">
                      {availableGenresCount}
                    </span>
                  )}
                </button>

                {/* Select Style Button */}
                <button
                  onClick={handleOpenGenreMap}
                  className="relative flex items-center justify-center w-12 h-12 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/50 rounded-xl transition-all group hover:scale-105 active:scale-95"
                  title={t('genres.selectGenre')}
                >
                  {/* Music Note / Style Icon */}
                  <svg 
                    className="w-6 h-6 text-indigo-400 group-hover:text-indigo-300 transition-colors" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" 
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Genre Stats Mini Bar */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-700/50 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-gray-400">{t('genres.completedGenres')}:</span>
                <span className="text-green-400 font-medium">{completedGenresCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                <span className="text-gray-400">{t('genres.availableGenres')}:</span>
                <span className="text-purple-400 font-medium">{availableGenresCount}</span>
              </div>
            </div>
          </div>

          {/* Playlist Link */}
          {currentGenre?.playlist_url && (
            <a
              href={currentGenre.playlist_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-xl transition-all text-green-400 group hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="text-2xl">🎧</span>
              <div className="flex-1">
                <span className="font-medium">{t('genres.openPlaylist')}</span>
                <p className="text-xs text-green-500/70 mt-0.5">{currentGenre.name}</p>
              </div>
              <svg className="w-5 h-5 text-green-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          )}

          {/* Complete Walk Button */}
          <button
            onClick={handleCompleteWalk}
            disabled={isLoading || !currentGenre}
            className={`w-full py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
              isCompleted
                ? 'bg-green-600/30 border border-green-500/50 text-green-400'
                : currentGenre
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isCompleted ? (
              <>
                <span className="text-xl">✓</span>
                <span>{t('activities.completed')}</span>
              </>
            ) : (
              <>
                <span className="text-xl">🚶</span>
                <span>{t('genres.markComplete')}</span>
              </>
            )}
          </button>

          {/* Rewards Info */}
          <div className="flex items-center justify-center gap-6 pt-2 text-sm">
            {musicWalkActivity.coins > 0 && (
              <div className={`flex items-center gap-1.5 ${isCompleted ? 'text-green-400' : 'text-yellow-400'}`}>
                <span className="text-lg" style={{ filter: 'sepia(1) saturate(3) brightness(1.1) hue-rotate(5deg)' }}>🪙</span>
                <span className="font-semibold">+{musicWalkActivity.coins}</span>
              </div>
            )}
            {musicWalkActivity.experience > 0 && (
              <div className={`flex items-center gap-1.5 ${isCompleted ? 'text-green-400' : 'text-purple-400'}`}>
                <span className="text-lg">⚡</span>
                <span className="font-semibold">+{musicWalkActivity.experience} XP</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

