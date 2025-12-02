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

  const loadActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await activitiesApi.getTodayActivities();
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
  }, [i18n.language]);

  const handleToggle = async (activityId: number, isCompleted: boolean) => {
    try {
      if (isCompleted) {
        const response = await activitiesApi.completeActivity(activityId);
        if (user) {
          setUser({
            ...user,
            total_points: response.new_total_points,
            coins: response.new_coins,
            level: response.new_level,
          });
        }
      } else {
        await activitiesApi.uncompleteActivity(activityId);
        const activity = activities.find(a => a.id === activityId);
        if (user && activity) {
          setUser({
            ...user,
            total_points: Math.max(0, user.total_points - activity.experience),
            coins: Math.max(0, user.coins - activity.coins),
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

  const groupedActivities: GroupedActivities = {
    daily_task: activities.filter((a) => a.type === 'daily_task'),
    ongoing_rule: activities.filter((a) => a.type === 'ongoing_rule'),
    training: activities.filter((a) => a.type === 'training'),
    music_walk: activities.filter((a) => a.type === 'music_walk'),
  };

  const totalActivities = activities.length;
  const completedActivities = activities.filter((a) => a.is_completed).length;
  const totalCoins = activities.reduce((sum, a) => sum + a.coins, 0);
  const earnedCoins = activities
    .filter((a) => a.is_completed)
    .reduce((sum, a) => sum + a.coins, 0);
  const totalExperience = activities.reduce((sum, a) => sum + a.experience, 0);
  const earnedExperience = activities
    .filter((a) => a.is_completed)
    .reduce((sum, a) => sum + a.experience, 0);

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
        <div className="container mx-auto max-w-7xl px-4">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400">
            {error}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left side: Header Stats + Ongoing Rules */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header Stats */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-white">{t('activities.title')}</h1>
                {user && user.current_streak > 0 && (
                  <div className="flex items-center gap-2 bg-orange-900/30 px-3 py-1.5 rounded-full border border-orange-700">
                    <span className="text-xl">🔥</span>
                    <div>
                      <div className="text-xs text-gray-400">{t('profile.currentStreak')}</div>
                      <div className="text-lg font-bold text-orange-400">
                        {user.current_streak} {t('profile.days')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-400">{t('activities.completed')}</div>
                  <div className="text-2xl font-bold text-white">
                    {completedActivities}/{totalActivities}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">
                    <span style={{ filter: 'sepia(1) saturate(3) brightness(1.1) hue-rotate(5deg)' }}>🪙</span> {t('activities.coins')}
                  </div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {earnedCoins}/{totalCoins}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">⚡ {t('activities.experience')}</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {earnedExperience}/{totalExperience}
                  </div>
                </div>
              </div>
            </div>

            {/* Ongoing Rules */}
            <ActivityGroup
              title={t('activities.ongoingRules')}
              activities={groupedActivities.ongoing_rule}
              type="ongoing_rule"
              icon="⚡"
              onToggle={handleToggle}
            />
          </div>

          {/* Right side: Daily Tasks + Training */}
          <div className="lg:col-span-7 space-y-6">
            {/* Daily Tasks */}
            <ActivityGroup
              title={t('activities.dailyTasks')}
              activities={groupedActivities.daily_task}
              type="daily_task"
              icon="📝"
              onToggle={handleToggle}
            />

            {/* Training Section with Music Walk */}
            <div className="space-y-2">
              {/* Regular trainings */}
              {groupedActivities.training.length > 0 && (
                <ActivityGroup
                  title={t('activities.trainings')}
                  activities={groupedActivities.training}
                  type="training"
                  icon="💪"
                  onToggle={handleToggle}
                />
              )}
              {/* Music Walk Training Card - Opens Genre Map */}
              {groupedActivities.training.length === 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">💪</span>
                  <h2 className="text-xl font-bold text-green-400">{t('activities.trainings')}</h2>
                </div>
              )}
              <MusicWalkTrainingCard 
                activity={groupedActivities.music_walk[0]}
                onToggle={handleToggle}
              />
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
