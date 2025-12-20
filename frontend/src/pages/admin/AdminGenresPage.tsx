import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { genreApi } from '../../api/genres';
import { Genre, GenreFormData } from '../../types/genre';
import GenreFlowMap from '../../components/admin/GenreFlowMap';
import GenreFormModal from '../../components/admin/GenreFormModal';

export default function AdminGenresPage() {
  const { t } = useTranslation();
  const [, setGenres] = useState<Genre[]>([]);
  const [allGenresFlat, setAllGenresFlat] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  const [parentGenreForChild, setParentGenreForChild] = useState<Genre | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Flatten genre tree for easy access
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

  const loadGenres = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await genreApi.admin.list();
      setGenres(response.data);
      setAllGenresFlat(flattenGenres(response.data));
    } catch (err) {
      console.error('Failed to load genres:', err);
      setError('Failed to load genres. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGenres();
  }, []);

  const handleCreate = () => {
    setEditingGenre(null);
    setParentGenreForChild(null);
    setIsModalOpen(true);
  };

  const handleEdit = (genre: Genre) => {
    setEditingGenre(genre);
    setParentGenreForChild(null);
    setIsModalOpen(true);
  };

  const handleAddChild = (parentGenre: Genre) => {
    setEditingGenre(null);
    setParentGenreForChild(parentGenre);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this genre? All child genres will also be deleted.')) {
      return;
    }

    try {
      await genreApi.admin.delete(id);
      await loadGenres();
    } catch (err) {
      console.error('Failed to delete genre:', err);
      alert('Failed to delete genre. It might have child genres.');
    }
  };

  const handleSubmit = async (data: GenreFormData) => {
    try {
      if (editingGenre) {
        await genreApi.admin.update(editingGenre.id, data);
      } else {
        await genreApi.admin.create(data);
      }
      await loadGenres();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save genre:', err);
      throw err;
    }
  };

  const handleNodePositionChange = async (id: number, x: number, y: number) => {
    try {
      await genreApi.admin.update(id, { x_position: x, y_position: y });
      // Update local state
      setAllGenresFlat((prev) =>
        prev.map((g) => (g.id === id ? { ...g, x_position: x, y_position: y } : g))
      );
    } catch (err) {
      console.error('Failed to update genre position:', err);
    }
  };

  const handleParentConnectionChange = async (genreId: number, parentIds: number[]) => {
    try {
      await genreApi.admin.update(genreId, { parent_ids: parentIds });
      // Reload genres to get updated data
      await loadGenres();
    } catch (err) {
      console.error('Failed to update parent connections:', err);
      alert('Failed to update parent connections');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">{t('common.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-6 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-4 transition-colors"
          >
            ← Back to Admin Panel
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {t('admin.genres.title')}
              </h1>
              <p className="text-gray-400">
                {t('admin.genres.subtitle')}
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
            >
              + {t('admin.genres.createGenre')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gray-900 border-b border-gray-800 p-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex gap-6 text-sm">
          <div className="text-gray-400">
            <span className="font-medium">Total Genres:</span>{' '}
            <span className="text-white">{allGenresFlat.length}</span>
          </div>
          <div className="text-gray-400">
            <span className="font-medium">Root Genres:</span>{' '}
            <span className="text-white">
              {allGenresFlat.filter((g) => g.parent_id === null).length}
            </span>
          </div>
        </div>
      </div>

      {/* Flow Map */}
      <div className="flex-1 overflow-hidden">
        {allGenresFlat.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400 text-lg mb-4">
                No genres yet. Create your first genre!
              </p>
              <button
                onClick={handleCreate}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                + Create Genre
              </button>
            </div>
          </div>
        ) : (
          <GenreFlowMap
            genres={allGenresFlat}
            onNodePositionChange={handleNodePositionChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddChild={handleAddChild}
            onParentConnectionChange={handleParentConnectionChange}
          />
        )}
      </div>

      {/* Modal */}
      <GenreFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setParentGenreForChild(null);
        }}
        onSubmit={handleSubmit}
        genre={editingGenre}
        parentGenre={parentGenreForChild}
        allGenres={allGenresFlat}
      />
    </div>
  );
}
