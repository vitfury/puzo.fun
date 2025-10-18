import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout';
import { genreApi } from '../api/genres';
import { Genre } from '../types/genre';
import UserGenreFlowMap from '../components/genres/UserGenreFlowMap';
import GenreDetailModal from '../components/genres/GenreDetailModal';
import { useAuth } from '../contexts/AuthContext';

export function GenresPage() {
  const { t } = useTranslation();
  const { refreshUser } = useAuth();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Flatten genre tree for flow map
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

  const allGenresFlat = useMemo(() => flattenGenres(genres), [genres]);

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    try {
      setLoading(true);
      const response = await genreApi.getTree();
      setGenres(response.data);
    } catch (err) {
      console.error('Failed to load genres:', err);
      setError(t('genres.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleGenreClick = (genre: Genre) => {
    setSelectedGenre(genre);
    setIsModalOpen(true);
  };

  const handleCompleteGenre = async (genreId: number) => {
    try {
      setIsCompleting(true);
      setError(null);
      setSuccessMessage(null);

      const result = await genreApi.completeGenre(genreId);

      // Show success message
      let message = result.message;
      if (result.unlocked_count > 0) {
        message = t('genres.completedWithUnlock', { count: result.unlocked_count });
      } else if (!result.can_unlock && result.unlock_reason) {
        message = `${t('genres.completed')} (${result.unlock_reason})`;
      }

      setSuccessMessage(message);

      // Reload genres to update UI
      await loadGenres();

      // Refresh user data if needed
      if (refreshUser) {
        await refreshUser();
      }

      // Close modal
      setIsModalOpen(false);
      setSelectedGenre(null);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Failed to complete genre:', err);
      setError(err.response?.data?.message || t('genres.completeError'));
    } finally {
      setIsCompleting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center">
          <div className="text-white text-xl">{t('common.loading')}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-800 p-6 flex-shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{t('genres.title')}</h1>
                <p className="text-gray-400">{t('genres.subtitle')}</p>
              </div>
              <div className="flex items-center gap-6">
                <button
                  onClick={loadGenres}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium text-sm"
                  title="Refresh genres"
                >
                  {loading ? '↻ Loading...' : '↻ Refresh'}
                </button>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-gray-300">{t('genres.completed')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                    <span className="text-gray-300">{t('genres.available')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-gray-600 rounded-full"></span>
                    <span className="text-gray-300">{t('genres.locked')}</span>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400 mb-4">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="p-4 bg-green-900/20 border border-green-500 rounded-lg text-green-400 mb-4">
                {successMessage}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gray-900 border-b border-gray-800 p-4 flex-shrink-0">
          <div className="max-w-7xl mx-auto flex gap-6 text-sm">
            <div className="text-gray-400">
              <span className="font-medium">{t('genres.totalGenres')}:</span>{' '}
              <span className="text-white">{allGenresFlat.length}</span>
            </div>
            <div className="text-gray-400">
              <span className="font-medium">{t('genres.completedGenres')}:</span>{' '}
              <span className="text-white">
                {allGenresFlat.filter((g) => g.user_progress?.is_completed).length}
              </span>
            </div>
            <div className="text-gray-400">
              <span className="font-medium">{t('genres.availableGenres')}:</span>{' '}
              <span className="text-white">
                {allGenresFlat.filter((g) => g.user_progress?.is_available && !g.user_progress?.is_completed).length}
              </span>
            </div>
          </div>
        </div>

        {/* Flow Map */}
        <div className="flex-1 overflow-hidden">
          {allGenresFlat.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-400 text-lg">{t('genres.noGenres')}</p>
              </div>
            </div>
          ) : (
            <UserGenreFlowMap genres={allGenresFlat} onGenreClick={handleGenreClick} />
          )}
        </div>

        {/* Genre Detail Modal */}
        <GenreDetailModal
          genre={selectedGenre}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedGenre(null);
          }}
          onComplete={handleCompleteGenre}
          isCompleting={isCompleting}
        />
      </div>
    </Layout>
  );
}
