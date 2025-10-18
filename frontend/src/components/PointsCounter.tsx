import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface PointsCounterProps {
  points: number;
  previousPoints?: number;
  showAnimation?: boolean;
}

export const PointsCounter = ({ points, previousPoints, showAnimation = true }: PointsCounterProps) => {
  const { t } = useTranslation();
  const [displayPoints, setDisplayPoints] = useState(points);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pointDiff, setPointDiff] = useState(0);

  useEffect(() => {
    if (previousPoints !== undefined && previousPoints !== points && showAnimation) {
      const diff = points - previousPoints;
      setPointDiff(diff);
      setIsAnimating(true);

      // Animate the counter
      const duration = 500;
      const steps = 20;
      const increment = diff / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setDisplayPoints(points);
          clearInterval(timer);
          setTimeout(() => setIsAnimating(false), 1000);
        } else {
          setDisplayPoints(Math.floor(previousPoints + increment * currentStep));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setDisplayPoints(points);
    }
  }, [points, previousPoints, showAnimation]);

  return (
    <Link
      to="/points"
      className="relative flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 hover:border-yellow-500/50 transition-all group"
    >
      <svg
        className="w-5 h-5 text-yellow-400 group-hover:text-yellow-300 transition-colors"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <span className="text-yellow-200 font-bold text-lg tabular-nums">
        {displayPoints.toLocaleString()}
      </span>
      <span className="text-yellow-400/70 text-sm hidden sm:inline">
        {t('points.title')}
      </span>

      {isAnimating && pointDiff !== 0 && (
        <span
          className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold animate-bounce ${
            pointDiff > 0
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {pointDiff > 0 ? '+' : ''}{pointDiff}
        </span>
      )}
    </Link>
  );
};
