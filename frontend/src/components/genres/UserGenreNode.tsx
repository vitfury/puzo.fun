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
      return 'bg-gray-800/80 border-green-500/50 hover:border-green-500/70';
    }
    if (isAvailable) {
      return 'bg-gray-800/80 border-purple-500/50 hover:border-purple-500/70 cursor-pointer';
    }
    return 'bg-gray-800/40 border-gray-700/50 opacity-60';
  };

  const handleClick = () => {
    if (isAvailable || isCompleted) {
      onClick(genre);
    }
  };

  return (
    <div
      className={`border rounded-xl p-3 min-w-[200px] max-w-[280px] transition-all ${getNodeStyle()}`}
      onClick={handleClick}
    >
      <Handle
        type="target"
        position={Position.Top}
        className={`!w-2 !h-2 ${isCompleted ? '!bg-green-500/70' : isAvailable ? '!bg-purple-500/70' : '!bg-gray-600/50'}`}
      />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className={`font-semibold text-base truncate ${isAvailable || isCompleted ? 'text-gray-100' : 'text-gray-500'}`}>
              {genre.name}
            </h3>
            {isCompleted && <span className="text-green-400 text-sm flex-shrink-0">✓</span>}
            {!isAvailable && <span className="text-gray-600 text-sm flex-shrink-0">🔒</span>}
          </div>
          {genre.year && (
            <span className={`text-xs flex-shrink-0 ${isAvailable || isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
              {genre.year}
            </span>
          )}
        </div>

        {genre.description && (
          <p className={`text-xs line-clamp-2 break-words ${isAvailable || isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
            {genre.description}
          </p>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className={`!w-2 !h-2 ${isCompleted ? '!bg-green-500/70' : isAvailable ? '!bg-purple-500/70' : '!bg-gray-600/50'}`}
      />
    </div>
  );
}

export default memo(UserGenreNode);
