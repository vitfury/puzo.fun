import type { Activity, ActivityType } from '../../types/activity';
import { ActivityCheckbox } from './ActivityCheckbox';

interface ActivityGroupProps {
  title: string;
  activities: Activity[];
  type: ActivityType;
  icon: string;
  onToggle: (activityId: number, isCompleted: boolean) => Promise<void>;
}

const typeColors: Record<ActivityType, string> = {
  daily_task: 'text-blue-400 border-blue-500',
  ongoing_rule: 'text-purple-400 border-purple-500',
  training: 'text-green-400 border-green-500',
  music_walk: 'text-red-400 border-red-500',
};

export function ActivityGroup({ title, activities, type, icon, onToggle }: ActivityGroupProps) {
  if (activities.length === 0) return null;

  const completedCount = activities.filter((a) => a.is_completed).length;
  const totalPoints = activities.reduce((sum, a) => sum + a.points, 0);
  const earnedPoints = activities
    .filter((a) => a.is_completed)
    .reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <h2 className={`text-xl font-bold ${typeColors[type]}`}>{title}</h2>
          <span className="text-sm text-gray-400">
            ({completedCount}/{activities.length})
          </span>
        </div>
        <div className="text-sm">
          <span className="text-gray-400">Points: </span>
          <span className="font-semibold text-yellow-400">
            {earnedPoints}/{totalPoints}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {activities.map((activity) => (
          <ActivityCheckbox key={activity.id} activity={activity} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
}
