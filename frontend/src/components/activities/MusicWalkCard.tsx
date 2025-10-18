import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

export function MusicWalkCard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-lg border-2 border-purple-700 hover:border-purple-500 transition-all duration-300 cursor-pointer group h-full"
         onClick={() => navigate('/genres')}>
      <div className="p-6 h-full flex flex-col">
        {/* Header with icon */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🎵</span>
            <h3 className="text-xl font-bold text-white">{t('activities.musicWalkCard.title')}</h3>
          </div>
          <div className="text-3xl text-purple-400 group-hover:translate-x-1 transition-transform">
            →
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-300 mb-6 flex-grow">
          {t('activities.musicWalkCard.description')}
        </p>

        {/* Stats footer */}
        <div className="bg-black/30 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">{t('activities.musicWalkCard.currentGenre')}</span>
            <span className="text-purple-300 font-semibold">{t('activities.musicWalkCard.notStarted')}</span>
          </div>
          {user && user.current_streak > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">{t('activities.musicWalkCard.streak')}</span>
              <span className="text-orange-400 font-semibold">
                🔥 {user.current_streak} {t('profile.days')}
              </span>
            </div>
          )}
        </div>

        {/* Pulsing indicator */}
        <div className="mt-4 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500 rounded-full opacity-75 animate-ping"></div>
            <div className="relative bg-purple-600 text-white px-6 py-2 rounded-full font-semibold text-sm">
              {t('activities.musicWalkCard.explore')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
