import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/Layout';
import { adminApi, Activity, CreateActivityData } from '../../api/admin';

interface ActivityFormProps {
  formData: CreateActivityData;
  setFormData: React.Dispatch<React.SetStateAction<CreateActivityData>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

const ActivityForm = ({ formData, setFormData, onSubmit, onCancel, isEdit = false }: ActivityFormProps) => {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmit} className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 mb-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('admin.activities.name')}
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('admin.activities.type')}
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="daily_task">{t('activities.dailyTasks')}</option>
            <option value="ongoing_rule">{t('activities.ongoingRules')}</option>
            <option value="training">{t('activities.trainings')}</option>
            <option value="music_walk">{t('activities.musicWalks')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            🪙 {t('admin.activities.coins')}
          </label>
          <input
            type="number"
            value={formData.coins ?? 0}
            onChange={(e) => setFormData({ ...formData, coins: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ⚡ {t('admin.activities.experience')}
          </label>
          <input
            type="number"
            value={formData.experience ?? 0}
            onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('admin.activities.orderIndex')}
          </label>
          <input
            type="number"
            value={formData.order_index ?? 0}
            onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('admin.activities.activeFrom')} 📅
          </label>
          <div className="relative">
            <input
              type="date"
              value={formData.active_from || ''}
              onChange={(e) => setFormData({ ...formData, active_from: e.target.value || null })}
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 [color-scheme:dark]"
            />
            {formData.active_from && (
              <button
                type="button"
                onClick={() => setFormData({ ...formData, active_from: null })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white px-2"
                title="Clear date"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('admin.activities.activeTo')} 📅
          </label>
          <div className="relative">
            <input
              type="date"
              value={formData.active_to || ''}
              onChange={(e) => setFormData({ ...formData, active_to: e.target.value || null })}
              min={formData.active_from || undefined}
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 [color-scheme:dark]"
            />
            {formData.active_to && (
              <button
                type="button"
                onClick={() => setFormData({ ...formData, active_to: null })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white px-2"
                title="Clear date"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('admin.activities.description')}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            rows={3}
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 rounded border-gray-700 bg-gray-900/50 focus:ring-purple-500"
            />
            <span>{t('admin.activities.isActive')}</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
        >
          {isEdit ? t('admin.activities.update') : t('admin.activities.create')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
        >
          {t('common.cancel')}
        </button>
      </div>
    </form>
  );
};

export const AdminActivitiesPage = () => {
  const { t } = useTranslation();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateActivityData>({
    name: '',
    type: 'daily_task',
    description: '',
    coins: 5,
    experience: 10,
    active_from: null,
    active_to: null,
    is_active: true,
    order_index: 0,
  });

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getActivities();
      setActivities(data);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createActivity(formData);
      await loadActivities();
      setShowCreateForm(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create activity:', error);
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      await adminApi.updateActivity(id, formData);
      await loadActivities();
      setEditingId(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('admin.activities.confirmDelete'))) return;
    try {
      await adminApi.deleteActivity(id);
      await loadActivities();
    } catch (error) {
      console.error('Failed to delete activity:', error);
    }
  };

  const startEdit = (activity: Activity) => {
    setEditingId(activity.id);
    setFormData({
      name: activity.name,
      type: activity.type,
      description: activity.description || '',
      coins: activity.coins,
      experience: activity.experience,
      active_from: activity.active_from,
      active_to: activity.active_to,
      is_active: activity.is_active,
      order_index: activity.order_index,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowCreateForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'daily_task',
      description: '',
      coins: 5,
      experience: 10,
      active_from: null,
      active_to: null,
      is_active: true,
      order_index: 0,
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('admin.activities.noDate');
    return new Date(dateString).toLocaleDateString();
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      daily_task: t('activities.dailyTasks'),
      ongoing_rule: t('activities.ongoingRules'),
      training: t('activities.trainings'),
      music_walk: t('activities.musicWalks'),
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-gray-400">{t('common.loading')}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {t('admin.activities.title')}
            </h1>
            <p className="text-gray-400">
              {t('admin.activities.subtitle')}
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            {showCreateForm ? t('common.cancel') : t('admin.activities.createNew')}
          </button>
        </div>

        {showCreateForm && (
          <ActivityForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleCreate}
            onCancel={cancelEdit}
          />
        )}

        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6">
              {editingId === activity.id ? (
                <ActivityForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={(e) => { e.preventDefault(); handleUpdate(activity.id); }}
                  onCancel={cancelEdit}
                  isEdit
                />
              ) : (
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{activity.name}</h3>
                        <span className="px-3 py-1 bg-purple-600/30 text-purple-300 text-sm rounded-full">
                          {getTypeLabel(activity.type)}
                        </span>
                        {!activity.is_active && (
                          <span className="px-3 py-1 bg-red-600/30 text-red-300 text-sm rounded-full">
                            {t('admin.activities.inactive')}
                          </span>
                        )}
                      </div>
                      {activity.description && (
                        <p className="text-gray-400 mb-3">{activity.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <div>
                          <span className="font-medium">🪙 {t('admin.activities.coins')}:</span> {activity.coins}
                        </div>
                        <div>
                          <span className="font-medium">⚡ {t('admin.activities.experience')}:</span> {activity.experience}
                        </div>
                        <div>
                          <span className="font-medium">{t('admin.activities.activeFrom')}:</span> {formatDate(activity.active_from)}
                        </div>
                        <div>
                          <span className="font-medium">{t('admin.activities.activeTo')}:</span> {formatDate(activity.active_to)}
                        </div>
                        <div>
                          <span className="font-medium">{t('admin.activities.order')}:</span> {activity.order_index}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => startEdit(activity)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(activity.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {activities.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            {t('admin.activities.noActivities')}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminActivitiesPage;
