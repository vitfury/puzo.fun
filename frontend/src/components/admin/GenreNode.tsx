import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Genre } from '../../types/genre';

export interface GenreNodeData extends Record<string, unknown> {
  genre: Genre;
  onEdit: (genre: Genre) => void;
  onDelete: (id: number) => void;
  onAddChild: (parentGenre: Genre) => void;
}

interface GenreNodeProps {
  data: GenreNodeData;
}

function GenreNode({ data }: GenreNodeProps) {
  const genre = data.genre;
  const onEdit = data.onEdit;
  const onDelete = data.onDelete;
  const onAddChild = data.onAddChild;

  return (
    <div className="bg-gray-800 border-2 border-purple-500 rounded-lg p-4 min-w-[200px] shadow-lg hover:shadow-purple-500/50 transition-shadow">
      <Handle type="target" position={Position.Top} className="!bg-purple-500" />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-lg">{genre.name}</h3>
          {genre.year && (
            <span className="text-purple-400 text-xs">{genre.year}</span>
          )}
        </div>

        {genre.description && (
          <p className="text-gray-400 text-sm line-clamp-2">{genre.description}</p>
        )}

        <div className="space-y-2 pt-2">
          {/* Add Child Button */}
          <button
            onClick={() => onAddChild(genre)}
            className="w-full px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors font-medium"
          >
            + Add Child
          </button>

          {/* Edit & Delete Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(genre)}
              className="flex-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(genre.id)}
              className="flex-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-purple-500" />
    </div>
  );
}

export default memo(GenreNode);
