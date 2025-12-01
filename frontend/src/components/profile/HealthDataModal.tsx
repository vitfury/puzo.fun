import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import type { UpdateHealthData } from '../../types/user';

interface HealthDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'weight' | 'all';
}

export const HealthDataModal: React.FC<HealthDataModalProps> = ({ isOpen, onClose, mode }) => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState<UpdateHealthData>({
    birth_date: user?.birth_date || null,
    height: user?.height || null,
    weight: user?.weight || null,
    waist_circumference: user?.waist_circumference || null,
    body_fat_percentage: user?.body_fat_percentage || null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        birth_date: user.birth_date || null,
        height: user.height || null,
        weight: user.weight || null,
        waist_circumference: user.waist_circumference || null,
        body_fat_percentage: user.body_fat_percentage || null,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const dataToSend: UpdateHealthData = mode === 'weight'
        ? {
            weight: formData.weight,
            waist_circumference: formData.waist_circumference,
            body_fat_percentage: formData.body_fat_percentage
          }
        : formData;

      const response = await authApi.updateHealth(dataToSend);
      updateUser(response.user);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || t('profile.health.updateError'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6 border border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            {mode === 'weight' ? t('profile.health.updateMetrics') : t('profile.health.updateData')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'all' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('profile.health.birthDate')}
                </label>
                <input
                  type="date"
                  value={formData.birth_date || ''}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value || null })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('profile.health.height')} (см)
                </label>
                <input
                  type="number"
                  min="50"
                  max="300"
                  value={formData.height || ''}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value ? Number(e.target.value) : null })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                  placeholder="170"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('profile.health.weight')} (кг)
            </label>
            <input
              type="number"
              step="0.1"
              min="20"
              max="500"
              value={formData.weight || ''}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value ? Number(e.target.value) : null })}
              className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              placeholder="65.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('profile.health.waistCircumference')} (см)
            </label>
            <input
              type="number"
              min="40"
              max="200"
              value={formData.waist_circumference || ''}
              onChange={(e) => setFormData({ ...formData, waist_circumference: e.target.value ? Number(e.target.value) : null })}
              className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              placeholder="75"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('profile.health.bodyFatPercentage')} (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="3"
              max="60"
              value={formData.body_fat_percentage || ''}
              onChange={(e) => setFormData({ ...formData, body_fat_percentage: e.target.value ? Number(e.target.value) : null })}
              className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              placeholder="15.5"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition disabled:opacity-50"
            >
              {isLoading ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
