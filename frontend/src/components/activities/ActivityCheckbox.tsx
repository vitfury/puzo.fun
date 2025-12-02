import { useState } from 'react';
import type { Activity } from '../../types/activity';

interface ActivityCheckboxProps {
  activity: Activity;
  onToggle: (activityId: number, isCompleted: boolean) => Promise<void>;
}

export function ActivityCheckbox({ activity, onToggle }: ActivityCheckboxProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      await onToggle(activity.id, !activity.is_completed);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
        activity.is_completed
          ? 'bg-green-900/20 border-green-700'
          : 'bg-gray-800 border-gray-700 hover:border-gray-600'
      } ${isLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
      onClick={handleToggle}
    >
      <div className="flex-shrink-0">
        <input
          type="checkbox"
          checked={activity.is_completed || false}
          onChange={() => {}}
          disabled={isLoading}
          className="w-5 h-5 rounded border-gray-600 text-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-0 bg-gray-700 cursor-pointer disabled:cursor-wait"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3
          className={`font-semibold ${
            activity.is_completed ? 'line-through text-gray-400' : 'text-white'
          }`}
        >
          {activity.name}
        </h3>
        {activity.description && (
          <p className="text-sm text-gray-400 mt-1">{activity.description}</p>
        )}
      </div>

      <div className="flex-shrink-0 flex gap-2">
        {activity.coins > 0 && (
          <div
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              activity.is_completed
                ? 'bg-green-900/30 text-green-400'
                : 'bg-yellow-900/30 text-yellow-400'
            }`}
          >
            <span style={{ filter: 'sepia(1) saturate(3) brightness(1.1) hue-rotate(5deg)' }}>🪙</span> {activity.coins}
          </div>
        )}
        {activity.experience > 0 && (
          <div
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              activity.is_completed
                ? 'bg-green-900/30 text-green-400'
                : 'bg-purple-900/30 text-purple-400'
            }`}
          >
            ⚡ {activity.experience}
          </div>
        )}
      </div>
    </div>
  );
}
