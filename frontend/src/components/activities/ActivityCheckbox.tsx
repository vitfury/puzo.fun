import { useState } from 'react';
import type { Activity } from '../../types/activity';

interface ActivityCheckboxProps {
  activity: Activity;
  onToggle: (activityId: number, isCompleted: boolean) => Promise<void>;
  editMode?: boolean;
  onToggleFavorite?: (activityId: number) => Promise<void>;
}

export function ActivityCheckbox({ activity, onToggle, editMode, onToggleFavorite }: ActivityCheckboxProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

  // Check if activity was added today (is new)
  const isNewActivity = () => {
    if (!activity.added_to_favorites_at) return false;
    const addedDate = new Date(activity.added_to_favorites_at);
    const today = new Date();
    return (
      addedDate.getFullYear() === today.getFullYear() &&
      addedDate.getMonth() === today.getMonth() &&
      addedDate.getDate() === today.getDate()
    );
  };

  const handleToggle = async () => {
    if (editMode) return; // Don't complete in edit mode
    setIsLoading(true);
    try {
      await onToggle(activity.id, !activity.is_completed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onToggleFavorite || isFavoriteLoading) return;
    setIsFavoriteLoading(true);
    try {
      await onToggleFavorite(activity.id);
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const newActivity = isNewActivity();

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
        activity.is_completed
          ? 'bg-green-900/20 border-green-700'
          : newActivity
          ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-500 shadow-lg shadow-blue-500/20 animate-pulse-slow'
          : 'bg-gray-800 border-gray-700 hover:border-gray-600'
      } ${isLoading ? 'opacity-50 cursor-wait' : editMode ? 'cursor-default' : 'cursor-pointer'}`}
      onClick={handleToggle}
    >
      {/* Edit mode: Star button */}
      {editMode ? (
        <button
          onClick={handleFavoriteClick}
          disabled={isFavoriteLoading}
          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            activity.is_favorite
              ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
              : 'bg-gray-700/50 text-gray-500 hover:bg-gray-700 hover:text-gray-400'
          } ${isFavoriteLoading ? 'opacity-50' : ''}`}
        >
          {isFavoriteLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              className="w-5 h-5"
              fill={activity.is_favorite ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          )}
        </button>
      ) : (
      <div className="flex-shrink-0">
        <input
          type="checkbox"
          checked={activity.is_completed || false}
          onChange={() => {}}
          disabled={isLoading}
          className="w-5 h-5 rounded border-gray-600 text-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-0 bg-gray-700 cursor-pointer disabled:cursor-wait"
        />
      </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
        <h3
          className={`font-semibold ${
            activity.is_completed ? 'line-through text-gray-400' : 'text-white'
          }`}
        >
          {activity.name}
        </h3>
          {/* NEW badge for activities added today */}
          {!editMode && newActivity && !activity.is_completed && (
            <span className="px-2 py-0.5 text-xs font-bold bg-blue-500 text-white rounded-full animate-pulse">
              NEW
            </span>
          )}
          {/* Show star indicator in normal mode if favorite */}
          {!editMode && activity.is_favorite && (
            <span className="text-yellow-400 text-sm">★</span>
          )}
        </div>
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
