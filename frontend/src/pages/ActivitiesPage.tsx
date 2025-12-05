import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout';
import { activitiesApi } from '../api/activities';
import { ActivityGroup } from '../components/activities/ActivityGroup';
import { MusicWalkTrainingCard } from '../components/activities/MusicWalkTrainingCard';
import { useAuth } from '../contexts/AuthContext';
import type { Activity, GroupedActivities } from '../types/activity';

export function ActivitiesPage() {
  const { t, i18n } = useTranslation();
  const { user, setUser } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Default to today in YYYY-MM-DD format
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Generate list of available dates (last 7 days including today)
  const getAvailableDates = () => {
    const dates: { value: string; label: string; isToday: boolean }[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const isToday = i === 0;
      
      let label: string;
      if (isToday) {
        label = t('activities.today');
      } else if (i === 1) {
        label = t('activities.yesterday');
      } else {
        const dayName = date.toLocaleDateString(i18n.language, { weekday: 'short' });
        const day = date.getDate();
        const month = date.toLocaleDateString(i18n.language, { month: 'short' });
        label = `${dayName}, ${day} ${month}`;
      }
      
      dates.push({ value: dateStr, label, isToday });
    }
    
    return dates;
  };

  const loadActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await activitiesApi.getTodayActivities(selectedDate);
      setActivities(data);
    } catch (err) {
      setError('Failed to load activities. Please try again.');
      console.error('Failed to load activities:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [i18n.language, selectedDate]);

  const handleToggle = async (activityId: number, isCompleted: boolean) => {
    try {
      if (isCompleted) {
        const response = await activitiesApi.completeActivity(activityId, selectedDate);
        if (user) {
          setUser({
            ...user,
            total_points: response.new_total_points,
            coins: response.new_coins,
            level: response.new_level,
          });
        }
      } else {
        const response = await activitiesApi.uncompleteActivity(activityId, selectedDate);
        if (user) {
          setUser({
            ...user,
            total_points: response.new_total_points,
            coins: response.new_coins,
            level: response.new_level,
          });
        }
      }

      setActivities((prev) =>
        prev.map((activity) =>
          activity.id === activityId
            ? { ...activity, is_completed: isCompleted, completed_at: isCompleted ? new Date().toISOString() : undefined }
            : activity
        )
      );
    } catch (err) {
      console.error('Failed to toggle activity:', err);
      alert('Failed to update activity. Please try again.');
    }
  };

  const handleToggleFavorite = async (activityId: number) => {
    try {
      const result = await activitiesApi.toggleFavorite(activityId);
      setActivities((prev) =>
        prev.map((activity) =>
          activity.id === activityId
            ? { ...activity, is_favorite: result.is_favorite }
            : activity
        )
      );
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  // Check if any activity is favorited
  const hasFavorites = activities.some(a => a.is_favorite);
  
  // Filter activities: show only favorites if any exist (unless in edit mode)
  const visibleActivities = editMode || !hasFavorites 
    ? activities 
    : activities.filter(a => a.is_favorite);

  const groupedActivities: GroupedActivities = {
    daily_task: visibleActivities.filter((a) => a.type === 'daily_task'),
    ongoing_rule: visibleActivities.filter((a) => a.type === 'ongoing_rule'),
    training: visibleActivities.filter((a) => a.type === 'training'),
    music_walk: visibleActivities.filter((a) => a.type === 'music_walk'),
  };

  // Stats from visible activities only
  const totalActivities = visibleActivities.length;
  const completedActivities = visibleActivities.filter((a) => a.is_completed).length;
  const totalCoins = visibleActivities.reduce((sum, a) => sum + a.coins, 0);
  const earnedCoins = visibleActivities
    .filter((a) => a.is_completed)
    .reduce((sum, a) => sum + a.coins, 0);
  const totalExperience = visibleActivities.reduce((sum, a) => sum + a.experience, 0);
  const earnedExperience = visibleActivities
    .filter((a) => a.is_completed)
    .reduce((sum, a) => sum + a.experience, 0);

  const progressPercent = totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;
  const favoritesCount = activities.filter(a => a.is_favorite).length;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-400">{t('activities.loading')}</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto max-w-3xl px-4">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400">
            {error}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-3xl px-4 pb-8">
        {/* Header Card with Progress */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-5 border border-gray-700/50 mb-6 backdrop-blur-sm">
          {/* Date Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('activities.selectDate')}
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              {getAvailableDates().map((date) => (
                <option key={date.value} value={date.value}>
                  {date.label}
                </option>
              ))}
            </select>
            {(() => {
              const today = new Date().toISOString().split('T')[0];
              return selectedDate !== today && (
                <div className="mt-2 text-sm text-yellow-400 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{t('activities.viewingPastDate')}</span>
                </div>
              );
            })()}
          </div>

          {/* Top row: Title + Streak + Edit Button */}
              <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{t('activities.title')}</h1>
              {user && user.current_music_walk_streak > 0 && !editMode && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-orange-900/40 to-amber-900/40 px-3 py-1.5 rounded-full border border-orange-600/40">
                  <span className="text-lg">🔥</span>
                  <span className="text-lg font-bold text-orange-400">{user.current_music_walk_streak}</span>
                  <span className="text-xs text-orange-400/70">{t('profile.days')}</span>
                </div>
              )}
            </div>

            {/* Edit/Done Button - moved to the right with prominent styling */}
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg ${
                editMode
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-green-500/30'
                  : 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white shadow-yellow-500/30'
              }`}
            >
              {editMode ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {t('common.save')}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  {t('activities.selectActivities')}
                </span>
              )}
            </button>
          </div>

          {/* Edit mode info banner */}
          {editMode && (
            <div className="mb-4 p-3 rounded-lg bg-yellow-900/20 border border-yellow-600/30 text-yellow-400 text-sm">
              <span className="font-medium">★ {t('activities.editModeHint')}</span>
              {favoritesCount > 0 && (
                <span className="ml-2 text-yellow-400/70">
                  ({favoritesCount} {t('activities.selected')})
                </span>
              )}
            </div>
          )}

          {/* Progress Bar - hide in edit mode */}
          {!editMode && (
            <>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-400">{t('activities.progress')}</span>
                  <span className="text-sm font-semibold text-white">{completedActivities}/{totalActivities}</span>
                  </div>
                <div className="h-2.5 bg-gray-700/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-xl" style={{ filter: 'sepia(1) saturate(3) brightness(1.1) hue-rotate(5deg)' }}>🪙</span>
                <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">{t('activities.coins')}</div>
                    <div className="text-lg font-bold text-yellow-400">{earnedCoins}<span className="text-gray-500 font-normal">/{totalCoins}</span></div>
                  </div>
                </div>
                <div className="w-px h-8 bg-gray-700" />
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚡</span>
                <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">{t('activities.experience')}</div>
                    <div className="text-lg font-bold text-purple-400">{earnedExperience}<span className="text-gray-500 font-normal">/{totalExperience}</span></div>
                  </div>
                </div>
              </div>
            </>
          )}
            </div>

        {/* Activities Sections */}
        <div className="space-y-6">
            {/* Daily Tasks */}
          {groupedActivities.daily_task.length > 0 && (
            <section>
            <ActivityGroup
              title={t('activities.dailyTasks')}
              activities={groupedActivities.daily_task}
              type="daily_task"
              icon="📝"
              onToggle={handleToggle}
                editMode={editMode}
                onToggleFavorite={handleToggleFavorite}
              />
            </section>
          )}

          {/* Training Section */}
          {(groupedActivities.training.length > 0 || groupedActivities.music_walk.length > 0 || !hasFavorites || editMode) && (
            <section>
              {groupedActivities.training.length > 0 && (
                <ActivityGroup
                  title={t('activities.trainings')}
                  activities={groupedActivities.training}
                  type="training"
                  icon="💪"
                  onToggle={handleToggle}
                  editMode={editMode}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}
              
              {/* Music Walk - show if: no favorites set, or music_walk is in favorites, or in edit mode */}
              {(!hasFavorites || groupedActivities.music_walk.length > 0 || editMode) && (
                <>
              {groupedActivities.training.length === 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">💪</span>
                  <h2 className="text-xl font-bold text-green-400">{t('activities.trainings')}</h2>
                </div>
              )}
              <MusicWalkTrainingCard
                    activity={activities.find(a => a.type === 'music_walk')}
                    onToggle={handleToggle}
                    editMode={editMode}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </>
              )}
            </section>
          )}

          {/* Ongoing Rules */}
          {groupedActivities.ongoing_rule.length > 0 && (
            <section>
              <ActivityGroup
                title={t('activities.ongoingRules')}
                activities={groupedActivities.ongoing_rule}
                type="ongoing_rule"
                icon="⚡"
                onToggle={handleToggle}
                editMode={editMode}
                onToggleFavorite={handleToggleFavorite}
              />
            </section>
          )}
        </div>

        {/* Empty state when all activities are hidden */}
        {!editMode && hasFavorites && visibleActivities.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">{t('activities.noFavoritesVisible')}</div>
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white text-sm font-semibold shadow-lg shadow-yellow-500/30"
            >
              {t('activities.selectActivities')}
            </button>
          </div>
        )}

        {/* Completion celebration */}
        {!editMode && totalActivities > 0 && completedActivities === totalActivities && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-900/40 to-green-900/40 px-6 py-4 rounded-2xl border border-emerald-600/40">
              <span className="text-3xl">🎉</span>
              <div className="text-left">
                <div className="text-lg font-bold text-emerald-400">{t('activities.allCompleted')}</div>
                <div className="text-sm text-emerald-400/70">{t('activities.greatJob')}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
