import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Activity } from '../../types/activity';
import type { Genre } from '../../types/genre';
import { genreApi } from '../../api/genres';

interface MusicWalkTrainingCardProps {
  activity?: Activity;
  onToggle?: (activityId: number, isCompleted: boolean) => Promise<void>;
  onGenreSelected?: (genre: Genre) => void;
}

export function MusicWalkTrainingCard({ activity, onToggle, onGenreSelected }: MusicWalkTrainingCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [currentGenre, setCurrentGenre] = useState<Genre | null>(null);
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleOpenGenreMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/genres');
  };

  const handleCompleteWalk = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activity || !onToggle || isLoading) return;
    
    setIsLoading(true);
    try {
      await onToggle(activity.id, !activity.is_completed);
    } finally {
      setIsLoading(false);
    }
  };

  // Count available genres
  const availableGenresCount = genres.filter(
    (g) => g.user_progress?.is_available && !g.user_progress?.is_completed
  ).length;
  const completedGenresCount = genres.filter((g) => g.user_progress?.is_completed).length;

  const isCompleted = activity?.is_completed || false;
  const coins = activity?.coins || 10;
  const experience = activity?.experience || 50;

  return (
    <>
      <div
        className={`w-full rounded-lg p-4 border transition-all ${
          isCompleted 
            ? 'bg-green-900/20 border-green-700/50' 
            : 'bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-purple-700/50 hover:from-purple-900/60 hover:to-indigo-900/60 hover:border-purple-500/70'
        }`}
      >
        <div className="flex items-center gap-4">
          {/* Checkbox / Completed indicator */}
          <button
            onClick={handleCompleteWalk}
            disabled={isLoading || !currentGenre}
            className={`relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              isCompleted
                ? 'bg-green-600/30 border border-green-500/50'
                : currentGenre
                ? 'bg-purple-600/30 border border-purple-500/50 hover:bg-purple-600/50 hover:scale-105 cursor-pointer'
                : 'bg-gray-700/30 border border-gray-600/50 cursor-not-allowed'
            } ${isLoading ? 'opacity-50' : ''}`}
            title={isCompleted ? t('activities.completed') : currentGenre ? t('genres.markComplete') : t('genres.selectGenreDescription')}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isCompleted ? (
              <span className="text-2xl text-green-400">✓</span>
            ) : (
              <>
                <span className="text-2xl">🎵</span>
                {/* Badge with available genres */}
                {availableGenresCount > 0 && !isCompleted && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-purple-500 text-white text-[10px] font-bold rounded-full px-1 animate-pulse">
                    {availableGenresCount}
                  </span>
                )}
              </>
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className={`text-lg font-semibold transition-colors ${isCompleted ? 'text-green-400' : 'text-white'}`}>
                {t('activities.musicWalkCard.title')}
              </h3>
              {isCompleted && (
                <span className="text-xs text-green-500 bg-green-900/30 px-2 py-0.5 rounded-full">
                  {t('activities.completed')}
                </span>
              )}
            </div>
            
            {/* Current genre or hint */}
            <div className="mt-1 flex items-center gap-2">
              {isLoadingGenres ? (
                <div className="h-4 bg-gray-700 rounded animate-pulse w-24"></div>
              ) : currentGenre ? (
                <>
                  <span className="text-sm text-gray-400">{t('activities.musicWalkCard.currentGenre')}:</span>
                  <span className={`text-sm font-medium ${isCompleted ? 'text-green-400' : 'text-purple-400'}`}>{currentGenre.name}</span>
                </>
              ) : (
                <span className="text-sm text-gray-500">{t('genres.selectGenreDescription')}</span>
              )}
            </div>

            {/* Rewards */}
            <div className="mt-2 flex items-center gap-4 text-sm">
              {coins > 0 && (
                <div className={`flex items-center gap-1 ${isCompleted ? 'text-green-400' : 'text-yellow-400'}`}>
                  <span style={{ filter: 'sepia(1) saturate(3) brightness(1.1) hue-rotate(5deg)' }}>🪙</span>
                  <span className="font-semibold">{isCompleted ? '+' : ''}{coins}</span>
                </div>
              )}
              {experience > 0 && (
                <div className={`flex items-center gap-1 ${isCompleted ? 'text-green-400' : 'text-purple-400'}`}>
                  <span>⚡</span>
                  <span className="font-semibold">{isCompleted ? '+' : ''}{experience}</span>
                </div>
              )}
              {/* Genre stats */}
              <div className="flex items-center gap-3 ml-auto text-xs">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-gray-500">{completedGenresCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <span className="text-gray-500">{availableGenresCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Open Genre Map Button */}
          <button
            onClick={handleOpenGenreMap}
            className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-700/50 hover:bg-purple-600/50 border border-gray-600/50 hover:border-purple-500/50 flex items-center justify-center transition-all hover:scale-105"
            title={t('genres.openMap')}
          >
            <svg 
              className="w-5 h-5 text-gray-400 hover:text-purple-300 transition-colors" 
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
          </button>
        </div>
      </div>
    </>
  );
}

