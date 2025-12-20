import { BaseEdge, EdgeProps, Position } from '@xyflow/react';

export default function SmoothBezierEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  // Обчислюємо контрольні точки для плавної кривої Безьє
  // Збільшуємо відстань контрольних точок для більш плавних кривих
  const distance = Math.sqrt(Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2));
  const offset = Math.max(distance * 0.6, 100); // Мінімум 100px для плавності
  
  let sourceControlX = sourceX;
  let sourceControlY = sourceY;
  let targetControlX = targetX;
  let targetControlY = targetY;

  // Налаштовуємо контрольні точки залежно від позиції handles
  if (sourcePosition === Position.Bottom) {
    sourceControlY = sourceY + offset;
  } else if (sourcePosition === Position.Top) {
    sourceControlY = sourceY - offset;
  } else if (sourcePosition === Position.Left) {
    sourceControlX = sourceX - offset;
  } else if (sourcePosition === Position.Right) {
    sourceControlX = sourceX + offset;
  }

  if (targetPosition === Position.Bottom) {
    targetControlY = targetY + offset;
  } else if (targetPosition === Position.Top) {
    targetControlY = targetY - offset;
  } else if (targetPosition === Position.Left) {
    targetControlX = targetX - offset;
  } else if (targetPosition === Position.Right) {
    targetControlX = targetX + offset;
  }

  // Створюємо шлях кривої Безьє
  const edgePath = `M ${sourceX},${sourceY} C ${sourceControlX},${sourceControlY} ${targetControlX},${targetControlY} ${targetX},${targetY}`;

  return (
    <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
  );
}

