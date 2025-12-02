import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-purple-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-2xl font-bold text-purple-400 hover:text-purple-300 transition-colors">
                {t('app.title')}
              </Link>
              {user && (
                <div className="hidden md:flex gap-4">
                  <Link
                    to="/activities"
                    className="text-gray-300 hover:text-purple-400 transition-colors px-3 py-2 rounded-md"
                  >
                    {t('nav.activities')}
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-300 hover:text-purple-400 transition-colors px-3 py-2 rounded-md"
                  >
                    {t('nav.profile')}
                  </Link>
                  <Link
                    to="/shop"
                    className="text-gray-300 hover:text-purple-400 transition-colors px-3 py-2 rounded-md"
                  >
                    🛒 {t('nav.shop', 'Магазин')}
                  </Link>
                  <Link
                    to="/rating"
                    className="text-gray-300 hover:text-purple-400 transition-colors px-3 py-2 rounded-md"
                  >
                    🏆 {t('nav.rating')}
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="text-yellow-400 hover:text-yellow-300 transition-colors px-3 py-2 rounded-md font-semibold"
                    >
                      {t('nav.admin')}
                    </Link>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              {user && (
                <>
                  {/* Compact Stats Panel */}
                  <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-2 py-1.5 border border-gray-600/50">
                    {/* XP */}
                    <Link 
                      to="/points" 
                      className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-600/50 transition-colors group"
                      title={t('profile.xp', 'Досвід')}
                    >
                      <span className="w-5 h-5 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-xs">
                        ⚡
                      </span>
                      <span className="text-purple-300 font-semibold text-sm tabular-nums group-hover:text-purple-200">
                        {user.total_points.toLocaleString()}
                      </span>
                    </Link>
                    
                    <div className="w-px h-5 bg-gray-600"></div>
                    
                    {/* Coins */}
                    <Link 
                      to="/shop" 
                      className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-600/50 transition-colors group"
                      title={t('profile.coins', 'Монетки')}
                    >
                      <span className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-xs">
                        <span style={{ filter: 'sepia(1) saturate(3) brightness(1.1) hue-rotate(5deg)' }}>🪙</span>
                      </span>
                      <span className="text-yellow-300 font-semibold text-sm tabular-nums group-hover:text-yellow-200">
                        {user.coins.toLocaleString()}
                      </span>
                    </Link>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    {t('auth.logout')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
