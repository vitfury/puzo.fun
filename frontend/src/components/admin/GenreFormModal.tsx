import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Genre, GenreFormData } from '../../types/genre';

interface GenreFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GenreFormData) => Promise<void>;
  genre?: Genre | null;
  parentGenre?: Genre | null; // Pre-selected parent for "Add Child" flow
  allGenres: Genre[];
}

export default function GenreFormModal({
  isOpen,
  onClose,
  onSubmit,
  genre,
  parentGenre,
  allGenres,
}: GenreFormModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<GenreFormData>({
    parent_id: null,
    name: '',
    description: '',
    playlist_url: '',
    year: null,
    x_position: 0,
    y_position: 0,
    order_index: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (genre) {
      // Editing existing genre
      setFormData({
        parent_id: genre.parent_id,
        name: genre.name,
        description: genre.description || '',
        playlist_url: genre.playlist_url || '',
        year: genre.year,
        x_position: genre.x_position,
        y_position: genre.y_position,
        order_index: genre.order_index,
      });
    } else if (parentGenre) {
      // Creating child genre - auto-position below parent
      setFormData({
        parent_id: parentGenre.id,
        name: '',
        description: '',
        playlist_url: '',
        year: null,
        x_position: parentGenre.x_position,
        y_position: parentGenre.y_position + 150,
        order_index: 0,
      });
    } else {
      // Creating root genre
      setFormData({
        parent_id: null,
        name: '',
        description: '',
        playlist_url: '',
        year: null,
        x_position: 0,
        y_position: 0,
        order_index: 0,
      });
    }
  }, [genre, parentGenre]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Failed to submit genre:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6">
          <h2 className="text-2xl font-bold text-white">
            {genre ? t('admin.genres.editGenre') : t('admin.genres.createGenre')}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Parent Genre - Show only if editing and allow changing parent */}
          {genre && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('admin.genres.parentGenre')}
              </label>
              <select
                value={formData.parent_id ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parent_id: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">None (Root Genre)</option>
                {allGenres
                  .filter((g) => g.id !== genre.id) // Don't allow self-parenting
                  .map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Show parent info when creating child */}
          {!genre && parentGenre && (
            <div className="bg-gray-800/50 border border-purple-500/30 rounded-lg p-4">
              <p className="text-sm text-gray-400">
                {t('admin.genres.creatingChildOf')}:{' '}
                <span className="text-white font-medium">{parentGenre.name}</span>
              </p>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('admin.genres.name')} *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Rock, Jazz, Hip-Hop..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('admin.genres.description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Describe the genre..."
            />
          </div>

          {/* Playlist URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('admin.genres.playlistUrl')}
            </label>
            <input
              type="url"
              value={formData.playlist_url}
              onChange={(e) => setFormData({ ...formData, playlist_url: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://youtube.com/playlist?list=..."
            />
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('admin.genres.year')}
            </label>
            <input
              type="number"
              min="1900"
              max="2100"
              value={formData.year ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  year: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="1950"
            />
          </div>

          {/* Position and Order */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">X Position</label>
              <input
                type="number"
                value={formData.x_position}
                onChange={(e) =>
                  setFormData({ ...formData, x_position: Number(e.target.value) })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Y Position</label>
              <input
                type="number"
                value={formData.y_position}
                onChange={(e) =>
                  setFormData({ ...formData, y_position: Number(e.target.value) })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Order</label>
              <input
                type="number"
                value={formData.order_index}
                onChange={(e) =>
                  setFormData({ ...formData, order_index: Number(e.target.value) })
                }
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
