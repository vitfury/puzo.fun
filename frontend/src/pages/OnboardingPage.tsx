import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../api/client';

type Race = 'human' | 'orc' | 'elf' | 'dark_elf' | 'dwarf';
type ActivityPreference = 'gym' | 'bodyweight' | 'walking_running';

interface OnboardingData {
  birth_date: string;
  weight: string;
  height: string;
  race: Race | '';
  activity_preference: ActivityPreference | '';
}

interface RaceOption {
  value: Race;
  labelKey: string;
  icon: string;
}

interface ActivityOption {
  value: ActivityPreference;
  labelKey: string;
  icon: string;
}

export default function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<OnboardingData>({
    birth_date: '',
    weight: '',
    height: '',
    race: '',
    activity_preference: '',
  });

  const raceOptions: RaceOption[] = [
    { value: 'human', labelKey: 'onboarding.race.human', icon: '⚔️' },
    { value: 'orc', labelKey: 'onboarding.race.orc', icon: '🪓' },
    { value: 'elf', labelKey: 'onboarding.race.elf', icon: '✨' },
    { value: 'dark_elf', labelKey: 'onboarding.race.darkElf', icon: '🌙' },
    { value: 'dwarf', labelKey: 'onboarding.race.dwarf', icon: '⛏️' },
  ];

  const activityOptions: ActivityOption[] = [
    { value: 'gym', labelKey: 'onboarding.activityPreference.gym', icon: '🏋️' },
    { value: 'bodyweight', labelKey: 'onboarding.activityPreference.bodyweight', icon: '🤸' },
    { value: 'walking_running', labelKey: 'onboarding.activityPreference.walkingRunning', icon: '🏃' },
  ];

  const totalSteps = 5;

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Birth date
        if (!formData.birth_date) {
          newErrors.birth_date = t('onboarding.errors.birthDateRequired');
        }
        break;
      case 1: // Weight
        const weight = parseFloat(formData.weight);
        if (!formData.weight) {
          newErrors.weight = t('onboarding.errors.weightRequired');
        } else if (weight < 20 || weight > 500) {
          newErrors.weight = t('onboarding.errors.weightInvalid');
        }
        break;
      case 2: // Height
        const height = parseInt(formData.height);
        if (!formData.height) {
          newErrors.height = t('onboarding.errors.heightRequired');
        } else if (height < 50 || height > 300) {
          newErrors.height = t('onboarding.errors.heightInvalid');
        }
        break;
      case 3: // Race
        if (!formData.race) {
          newErrors.race = t('onboarding.errors.raceRequired');
        }
        break;
      case 4: // Activity preference
        if (!formData.activity_preference) {
          newErrors.activity_preference = t('onboarding.errors.activityPreferenceRequired');
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await apiClient.post('/onboarding/complete', {
        birth_date: formData.birth_date,
        weight: parseFloat(formData.weight),
        height: parseInt(formData.height),
        race: formData.race,
        activity_preference: formData.activity_preference,
      });

      await refreshUser();
      navigate('/');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      setErrors({
        submit: error.response?.data?.message || t('onboarding.errors.submissionFailed')
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white text-center">{t('onboarding.age.title')}</h2>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('onboarding.age.label')}
              </label>
              <input
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.birth_date && (
                <p className="text-red-400 text-sm mt-1">{errors.birth_date}</p>
              )}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white text-center">{t('onboarding.weight.title')}</h2>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('onboarding.weight.label')}
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder={t('onboarding.weight.placeholder')}
                min="20"
                max="500"
                step="0.1"
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.weight && (
                <p className="text-red-400 text-sm mt-1">{errors.weight}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white text-center">{t('onboarding.height.title')}</h2>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('onboarding.height.label')}
              </label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                placeholder={t('onboarding.height.placeholder')}
                min="50"
                max="300"
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {errors.height && (
                <p className="text-red-400 text-sm mt-1">{errors.height}</p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white text-center">{t('onboarding.race.title')}</h2>
            <p className="text-gray-400 text-center">{t('onboarding.race.subtitle')}</p>
            <div className="grid grid-cols-1 gap-3">
              {raceOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData({ ...formData, race: option.value })}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.race === option.value
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-gray-600 bg-gray-700 hover:border-purple-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{option.icon}</span>
                    <div>
                      <div className="text-white font-semibold">{t(option.labelKey)}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {errors.race && (
              <p className="text-red-400 text-sm text-center">{errors.race}</p>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white text-center">{t('onboarding.activityPreference.title')}</h2>
            <p className="text-gray-400 text-center">{t('onboarding.activityPreference.subtitle')}</p>
            <div className="grid grid-cols-1 gap-3">
              {activityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData({ ...formData, activity_preference: option.value })}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    formData.activity_preference === option.value
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-gray-600 bg-gray-700 hover:border-purple-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{option.icon}</span>
                    <div>
                      <div className="text-white font-semibold">{t(option.labelKey)}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {errors.activity_preference && (
              <p className="text-red-400 text-sm text-center">{errors.activity_preference}</p>
            )}
            {errors.submit && (
              <p className="text-red-400 text-sm text-center">{errors.submit}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{t('onboarding.title')}</h1>
          <p className="text-gray-400">{t('onboarding.subtitle')}</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-400">
              {t('onboarding.step', { current: currentStep + 1, total: totalSteps })}
            </span>
            <span className="text-sm text-gray-400">
              {Math.round(((currentStep + 1) / totalSteps) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          {renderStep()}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={handlePrevious}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              {t('onboarding.previous')}
            </button>
          )}
          {currentStep < totalSteps - 1 ? (
            <button
              onClick={handleNext}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {t('onboarding.next')}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('onboarding.complete')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
