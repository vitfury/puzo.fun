import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Genre } from '../../types/genre';

export interface UserGenreNodeData extends Record<string, unknown> {
  genre: Genre;
  onClick: (genre: Genre) => void;
}

interface UserGenreNodeProps {
  data: UserGenreNodeData;
}

function UserGenreNode({ data }: UserGenreNodeProps) {
  const genre = data.genre;
  const onClick = data.onClick;

  const isAvailable = genre.user_progress?.is_available ?? false;
  const isCompleted = genre.user_progress?.is_completed ?? false;

  // Determine node style based on state
  const getNodeStyle = () => {
    if (isCompleted) {
      return 'bg-green-900/30 border-green-500 hover:shadow-green-500/50';
    }
    if (isAvailable) {
      return 'bg-purple-900/30 border-purple-500 hover:shadow-purple-500/50 cursor-pointer';
    }
    return 'bg-gray-900/50 border-gray-700 opacity-60';
  };

  const handleClick = () => {
    if (isAvailable || isCompleted) {
      onClick(genre);
    }
  };

  return (
    <div
      className={`border-2 rounded-lg p-4 min-w-[220px] max-w-[300px] shadow-lg transition-all ${getNodeStyle()}`}
      onClick={handleClick}
    >
      <Handle
        type="target"
        position={Position.Top}
        className={`${isCompleted ? '!bg-green-500' : isAvailable ? '!bg-purple-500' : '!bg-gray-600'}`}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className={`font-bold text-lg truncate ${isAvailable ? 'text-white' : 'text-gray-500'}`}>
              {genre.name}
            </h3>
            {isCompleted && <span className="text-green-400 text-xl flex-shrink-0">✓</span>}
            {!isAvailable && <span className="text-gray-600 text-lg flex-shrink-0">🔒</span>}
          </div>
          {genre.year && (
            <span className={`text-xs flex-shrink-0 ${isAvailable ? 'text-purple-400' : 'text-gray-600'}`}>
              {genre.year}
            </span>
          )}
        </div>

        {genre.description && (
          <p className={`text-sm line-clamp-2 break-words ${isAvailable ? 'text-gray-300' : 'text-gray-600'}`}>
            {genre.description}
          </p>
        )}

        {/* Status indicators */}
        <div className="flex items-center gap-2 text-xs pt-1">
          {isCompleted && (
            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
              Completed
            </span>
          )}
          {isAvailable && !isCompleted && (
            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
              Available
            </span>
          )}
          {!isAvailable && (
            <span className="px-2 py-1 bg-gray-500/20 text-gray-500 rounded-full">
              Locked
            </span>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className={`${isCompleted ? '!bg-green-500' : isAvailable ? '!bg-purple-500' : '!bg-gray-600'}`}
      />
    </div>
  );
}

export default memo(UserGenreNode);
