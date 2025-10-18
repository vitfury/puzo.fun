import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => changeLanguage('en')}
        className={`transition-all hover:scale-110 ${
          i18n.language === 'en' ? 'opacity-100' : 'opacity-50 hover:opacity-75'
        }`}
        title="English"
      >
        <span className="text-2xl">🇬🇧</span>
      </button>
      <button
        onClick={() => changeLanguage('uk')}
        className={`transition-all hover:scale-110 ${
          i18n.language === 'uk' ? 'opacity-100' : 'opacity-50 hover:opacity-75'
        }`}
        title="Українська"
      >
        <span className="text-2xl">🇺🇦</span>
      </button>
    </div>
  );
};

export default LanguageSwitcher;
