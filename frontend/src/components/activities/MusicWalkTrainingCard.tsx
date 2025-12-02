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
  editMode?: boolean;
  onToggleFavorite?: (activityId: number) => Promise<void>;
}

export function MusicWalkTrainingCard({ activity, onToggle, editMode, onToggleFavorite }: MusicWalkTrainingCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [currentGenre, setCurrentGenre] = useState<Genre | null>(null);
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

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
    if (!activity || !onToggle || isLoading || editMode) return;

    setIsLoading(true);
    try {
      await onToggle(activity.id, !activity.is_completed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activity || !onToggleFavorite || isFavoriteLoading) return;
    setIsFavoriteLoading(true);
    try {
      await onToggleFavorite(activity.id);
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const handleOpenPlaylist = () => {
    if (currentGenre?.playlist_url) {
      window.open(currentGenre.playlist_url, '_blank');
    }
  };

  // Count genres
  const availableGenresCount = genres.filter(
    (g) => g.user_progress?.is_available && !g.user_progress?.is_completed
  ).length;
  const completedGenresCount = genres.filter((g) => g.user_progress?.is_completed).length;

  const isCompleted = activity?.is_completed || false;
  const coins = activity?.coins ?? 0;
  const experience = activity?.experience ?? 0;

  return (
      <div
      className={`w-full rounded-xl border transition-all overflow-hidden ${
          isCompleted 
          ? 'bg-green-900/20 border-green-600/50' 
          : 'bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-600/40'
      }`}
    >
      {/* Main clickable area */}
      <div
        className={`p-4 transition-all ${editMode ? 'cursor-default' : 'cursor-pointer'} ${!isCompleted && !editMode ? 'hover:bg-white/5' : ''}`}
            onClick={handleCompleteWalk}
      >
        <div className="flex items-start gap-4">
          {/* Checkbox or Star (in edit mode) */}
          <div className="flex-shrink-0 pt-0.5">
            {editMode ? (
              <button
                onClick={handleFavoriteClick}
                disabled={isFavoriteLoading}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  activity?.is_favorite
                    ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                    : 'bg-gray-700/50 text-gray-500 hover:bg-gray-700 hover:text-gray-400'
                } ${isFavoriteLoading ? 'opacity-50' : ''}`}
              >
                {isFavoriteLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill={activity?.is_favorite ? 'currentColor' : 'none'}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                )}
              </button>
            ) : (
              <div
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                isCompleted
                    ? 'bg-green-500 border-green-500'
                    : 'border-purple-400 hover:border-purple-300 hover:bg-purple-500/20'
              } ${isLoading ? 'opacity-50' : ''}`}
            >
              {isLoading ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isCompleted ? (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : null}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl">🎵</span>
              <h3 className={`text-lg font-semibold ${isCompleted ? 'text-green-400 line-through' : 'text-white'}`}>
                {t('activities.musicWalkCard.title')}
              </h3>
              {isCompleted && (
                <span className="text-xs font-medium text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full">
                  ✓ {t('activities.completed')}
                </span>
              )}
            </div>
            
            {/* Current genre info */}
            <div className="mt-2">
              {isLoadingGenres ? (
                <div className="h-4 bg-gray-700/50 rounded animate-pulse w-32"></div>
              ) : currentGenre ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">{t('activities.musicWalkCard.currentGenre')}:</span>
                  <span className={`text-sm font-semibold ${isCompleted ? 'text-green-400' : 'text-purple-300'}`}>
                    {currentGenre.name}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-gray-500 italic">
                  {t('activities.musicWalkCard.noGenreSelected')}
                </span>
              )}
            </div>

            {/* Rewards row */}
            <div className="mt-3 flex items-center gap-3">
              {coins > 0 && (
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
                  isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  <span style={{ filter: 'sepia(1) saturate(3) brightness(1.1) hue-rotate(5deg)' }}>🪙</span>
                  <span className="text-sm font-semibold">{isCompleted ? '+' : ''}{coins}</span>
                </div>
              )}
              {experience > 0 && (
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
                  isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'
                }`}>
                  <span>⚡</span>
                  <span className="text-sm font-semibold">{isCompleted ? '+' : ''}{experience}</span>
                </div>
              )}
                </div>
              </div>
            </div>
          </div>

      {/* Action buttons footer */}
      <div className="px-4 py-3 bg-black/20 border-t border-white/5 flex items-center gap-3">
        {/* Open playlist button */}
        {currentGenre?.playlist_url && (
          <button
            onClick={(e) => { e.stopPropagation(); handleOpenPlaylist(); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-600/20 hover:bg-green-600/30 border border-green-600/30 hover:border-green-500/50 text-green-400 text-sm font-medium transition-all"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
            {t('genres.openPlaylist')}
          </button>
        )}

        {/* Open genre map button */}
        <button
          onClick={(e) => { e.stopPropagation(); handleOpenGenreMap(); }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/30 hover:border-purple-500/50 text-purple-400 text-sm font-medium transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          {t('activities.musicWalkCard.exploreGenres')}
        </button>

        {/* Genre stats */}
        <div className="ml-auto flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5" title={t('genres.completedGenres')}>
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span>{completedGenresCount}</span>
          </div>
          <div className="flex items-center gap-1.5" title={t('genres.availableGenres')}>
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span>{availableGenresCount}</span>
          </div>
        </div>
      </div>

      {/* Help text for first time users */}
      {!isCompleted && !currentGenre && !isLoadingGenres && (
        <div className="px-4 py-2 bg-amber-900/20 border-t border-amber-600/20 text-amber-400/80 text-xs">
          💡 {t('activities.musicWalkCard.helpText')}
        </div>
      )}
    </div>
  );
}
