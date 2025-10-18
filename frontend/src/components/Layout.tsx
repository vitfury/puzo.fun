import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import { PointsCounter } from './PointsCounter';

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
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              {user && (
                <>
                  <PointsCounter points={user.total_points} />
                  <span className="text-gray-300 text-sm hidden lg:inline">
                    {user.name}
                  </span>
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
