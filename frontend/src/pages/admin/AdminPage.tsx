import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/Layout';

export const AdminPage = () => {
  const { t } = useTranslation();

  const adminSections = [
    {
      title: t('admin.activitiesManagement'),
      description: t('admin.activitiesManagementDesc'),
      path: '/admin/activities',
      icon: '✅',
    },
    {
      title: t('admin.genreManagement'),
      description: t('admin.genreManagementDesc'),
      path: '/admin/genres',
      icon: '🎵',
    },
    {
      title: t('admin.settings.title', 'Налаштування гри'),
      description: t('admin.settings.subtitle', 'Керуй винагородами та параметрами гри'),
      path: '/admin/settings',
      icon: '⚙️',
    },
    {
      title: t('admin.localizationEditor'),
      description: t('admin.localizationEditorDesc'),
      path: '/admin/localization',
      icon: '🌐',
    },
    {
      title: t('admin.analytics.title', 'Аналітика користувачів'),
      description: t('admin.analytics.subtitle', 'Перегляд активностей та балансів користувачів по днях'),
      path: '/admin/analytics',
      icon: '📊',
    },
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {t('admin.title')}
          </h1>
          <p className="text-gray-400">
            {t('admin.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {adminSections.map((section) => (
            <Link
              key={section.path}
              to={section.path}
              className="block bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 hover:border-purple-500/60 hover:bg-gray-800/70 transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex items-start gap-4">
                <div className="text-5xl">{section.icon}</div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-white mb-2">
                    {section.title}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {section.description}
                  </p>
                </div>
                <div className="text-purple-400 text-2xl">→</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AdminPage;
