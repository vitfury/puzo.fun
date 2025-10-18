import { useTranslation } from 'react-i18next';
import { Genre } from '../../types/genre';

interface GenreDetailModalProps {
  genre: Genre | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (genreId: number) => void;
  isCompleting?: boolean;
}

export default function GenreDetailModal({
  genre,
  isOpen,
  onClose,
  onComplete,
  isCompleting = false,
}: GenreDetailModalProps) {
  const { t } = useTranslation();

  if (!isOpen || !genre) return null;

  const isAvailable = genre.user_progress?.is_available ?? false;
  const isCompleted = genre.user_progress?.is_completed ?? false;

  const handleComplete = () => {
    if (isAvailable && !isCompleted) {
      onComplete(genre.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">{genre.name}</h2>
            {isCompleted && <span className="text-green-400 text-2xl">✓</span>}
            {!isAvailable && <span className="text-gray-500 text-xl">🔒</span>}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            {isCompleted && (
              <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full font-medium">
                ✓ {t('genres.completed')}
              </span>
            )}
            {isAvailable && !isCompleted && (
              <span className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full font-medium">
                {t('genres.available')}
              </span>
            )}
            {!isAvailable && (
              <span className="px-4 py-2 bg-gray-500/20 text-gray-500 rounded-full font-medium">
                🔒 {t('genres.locked')}
              </span>
            )}
            {genre.year && (
              <span className="px-4 py-2 bg-gray-700 text-gray-300 rounded-full">
                {genre.year}
              </span>
            )}
          </div>

          {/* Description */}
          {genre.description && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {t('genres.description')}
              </h3>
              <p className="text-gray-300 leading-relaxed">{genre.description}</p>
            </div>
          )}

          {/* Playlist */}
          {genre.playlist_url && isAvailable && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                {t('genres.playlist')}
              </h3>
              <a
                href={genre.playlist_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
              >
                <span>🎵</span>
                <span>{t('genres.openPlaylist')}</span>
                <span>→</span>
              </a>
            </div>
          )}

          {/* Child Genres Info */}
          {genre.children && genre.children.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {t('genres.subgenres')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {genre.children.map((child) => (
                  <span
                    key={child.id}
                    className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                  >
                    {child.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Comments Count */}
          {genre.comments_count !== undefined && genre.comments_count > 0 && (
            <div className="text-gray-400 text-sm">
              💬 {genre.comments_count} {t('genres.comments')}
            </div>
          )}

          {/* Completion Info */}
          {isCompleted && genre.user_progress?.completed_at && (
            <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <p className="text-green-400 text-sm">
                {t('genres.completedOn')}:{' '}
                {new Date(genre.user_progress.completed_at).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Locked Info */}
          {!isAvailable && (
            <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
              <p className="text-gray-300 text-sm">
                {t('genres.lockedMessage')}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
          >
            {t('common.close')}
          </button>
          {isAvailable && !isCompleted && (
            <button
              onClick={handleComplete}
              disabled={isCompleting}
              className={`px-6 py-2 rounded-lg transition-colors font-medium ${
                isCompleting
                  ? 'bg-purple-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              } text-white`}
            >
              {isCompleting ? t('genres.completing') : t('genres.markComplete')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
