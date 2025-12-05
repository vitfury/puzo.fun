import { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { adminApi } from '../../api/admin';
import enTranslations from '../../i18n/locales/en.json';
import ukTranslations from '../../i18n/locales/uk.json';

type TranslationObject = Record<string, any>;

export const LocalizationEditorPage = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [translations, setTranslations] = useState<TranslationObject>({
    en: enTranslations,
    uk: ukTranslations,
  });
  const [originalTranslations, setOriginalTranslations] = useState<TranslationObject>({
    en: enTranslations,
    uk: ukTranslations,
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  // Track changed keys: Map<`${key}|${locale}`, { key, locale, value }>
  const [changedKeys, setChangedKeys] = useState<Map<string, { key: string; locale: 'en' | 'uk'; value: string }>>(new Map());

  // Flatten nested object to key-value pairs
  const flattenObject = useCallback((obj: any, prefix = ''): Array<[string, string]> => {
    const result: Array<[string, string]> = [];

    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        result.push(...flattenObject(obj[key], fullKey));
      } else if (typeof obj[key] === 'string') {
        result.push([fullKey, obj[key]]);
      }
    }

    return result;
  }, []);

  // Get all unique keys from both languages
  const allKeys = useMemo(() => {
    const enFlat = flattenObject(translations.en);
    const ukFlat = flattenObject(translations.uk);
    const enKeys = new Set(enFlat.map(([key]) => key));
    const ukKeys = new Set(ukFlat.map(([key]) => key));
    const allKeysSet = new Set([...enKeys, ...ukKeys]);
    return Array.from(allKeysSet).sort();
  }, [translations, flattenObject]);

  // Get value for a specific key and language
  const getValue = useCallback((key: string, lang: 'en' | 'uk'): string => {
    const keys = key.split('.');
    let current: any = translations[lang];

    for (const k of keys) {
      if (current && typeof current === 'object') {
        current = current[k];
      } else {
        return '';
      }
    }

    return typeof current === 'string' ? current : '';
  }, [translations]);

  // Get original value for a specific key and language (for search filtering)
  const getOriginalValue = useCallback((key: string, lang: 'en' | 'uk'): string => {
    const keys = key.split('.');
    let current: any = originalTranslations[lang];

    for (const k of keys) {
      if (current && typeof current === 'object') {
        current = current[k];
      } else {
        return '';
      }
    }

    return typeof current === 'string' ? current : '';
  }, [originalTranslations]);

  // Filter keys by search query (use original values to prevent disappearing during editing)
  const filteredKeys = useMemo(() => {
    if (!searchQuery.trim()) return allKeys;

    const query = searchQuery.toLowerCase();
    return allKeys.filter((key) => {
      // Use original values for search to prevent items from disappearing when editing
      const enOriginalValue = getOriginalValue(key, 'en').toLowerCase();
      const ukOriginalValue = getOriginalValue(key, 'uk').toLowerCase();
      // Also check current values in case user is searching for something they just typed
      const enCurrentValue = getValue(key, 'en').toLowerCase();
      const ukCurrentValue = getValue(key, 'uk').toLowerCase();
      return (
        key.toLowerCase().includes(query) ||
        enOriginalValue.includes(query) ||
        ukOriginalValue.includes(query) ||
        enCurrentValue.includes(query) ||
        ukCurrentValue.includes(query)
      );
    });
  }, [allKeys, searchQuery, getValue, getOriginalValue]);

  // Load translations from server on mount
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const data = await adminApi.getLocalizations();
        setTranslations(data);
        setOriginalTranslations(JSON.parse(JSON.stringify(data)));
        setChangedKeys(new Map()); // Reset changed keys on load
      } catch (error) {
        console.error('Failed to load translations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, []);

  // Handle value change
  const handleValueChange = useCallback((key: string, lang: 'en' | 'uk', newValue: string) => {
    const keys = key.split('.');

    setTranslations((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      let current: any = updated[lang];

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = newValue;
      return updated;
    });

    // Track changed key
    const changeKey = `${key}|${lang}`;
    const originalValue = getOriginalValue(key, lang);
    
    setChangedKeys((prev) => {
      const updated = new Map(prev);
      if (newValue === originalValue) {
        // Value matches original, remove from changed keys
        updated.delete(changeKey);
      } else {
        // Value is different, add/update in changed keys
        updated.set(changeKey, { key, locale: lang, value: newValue });
      }
      // Update hasChanges based on whether there are any changed keys
      setHasChanges(updated.size > 0);
      return updated;
    });
  }, [getOriginalValue]);

  // Save only changed keys
  const handleSave = async () => {
    if (changedKeys.size === 0) {
      setHasChanges(false);
      return;
    }

    setSaveStatus('saving');
    const changedCount = changedKeys.size;

    try {
      // Save only changed keys
      const savePromises = Array.from(changedKeys.values()).map(({ key, locale, value }) =>
        adminApi.updateLocalizationKey(locale, key, value)
      );

      await Promise.all(savePromises);

      // Update original translations to match current state
      setOriginalTranslations(JSON.parse(JSON.stringify(translations)));
      // Clear changed keys
      setChangedKeys(new Map());
      setHasChanges(false);
      setSaveStatus('saved');

      console.log(`✅ ${changedCount} translation key(s) saved successfully!`);

      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('❌ Failed to save translations:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  // Discard changes
  const handleDiscard = () => {
    setTranslations(JSON.parse(JSON.stringify(originalTranslations)));
    setChangedKeys(new Map());
    setHasChanges(false);
  };

  const handleExportBoth = () => {
    const data = {
      en: translations.en,
      uk: translations.uk,
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'translations.json');
    linkElement.click();
  };

  const handleExportSingle = (lang: 'en' | 'uk') => {
    const dataStr = JSON.stringify(translations[lang], null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `${lang}.json`);
    linkElement.click();
  };

  return (
    <Layout>
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-6">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-4 transition-colors"
          >
            ← Back to Admin Panel
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {t('admin.localization.title')}
              </h1>
              <p className="text-gray-400">
                {t('admin.localization.subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Save/Discard Bar */}
        {hasChanges && (
          <div className="bg-yellow-600/20 border border-yellow-500/50 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 text-lg">⚠️</span>
              <span className="text-yellow-200 font-medium">
                You have {changedKeys.size} unsaved change{changedKeys.size !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDiscard}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
                disabled={saveStatus === 'saving'}
              >
                Discard Changes
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors font-medium"
                disabled={saveStatus === 'saving'}
              >
                {saveStatus === 'saving' ? `💾 Saving ${changedKeys.size} change${changedKeys.size !== 1 ? 's' : ''}...` : `💾 Save ${changedKeys.size} Change${changedKeys.size !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        )}

        {/* Status Message */}
        {saveStatus === 'saved' && (
          <div className="bg-green-600/20 border border-green-500/50 rounded-lg p-4 mb-6 flex items-center gap-3">
            <span className="text-green-400 text-lg">✓</span>
            <span className="text-green-200 font-medium">
              Translation changes saved successfully! All users will see the updates after refreshing the page.
            </span>
          </div>
        )}

        {saveStatus === 'error' && (
          <div className="bg-red-600/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-center gap-3">
            <span className="text-red-400 text-lg">❌</span>
            <span className="text-red-200 font-medium">
              Failed to save translations. Please try again.
            </span>
          </div>
        )}

        {/* Controls */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Search by key or value..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleExportSingle('en')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm"
              >
                📥 Export EN
              </button>
              <button
                onClick={() => handleExportSingle('uk')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm"
              >
                📥 Export UK
              </button>
              <button
                onClick={handleExportBoth}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm"
              >
                📥 Export Both
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-12 text-center">
            <div className="text-gray-400 text-lg">Loading translations...</div>
          </div>
        )}

        {/* Translation Table */}
        {!isLoading && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50 sticky top-0">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300 w-1/4 border-r border-gray-700">
                    Translation Key
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300 w-[37.5%] border-r border-gray-700">
                    🇬🇧 English
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-gray-300 w-[37.5%]">
                    🇺🇦 Українська
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredKeys.map((key) => {
                  const enValue = getValue(key, 'en');
                  const ukValue = getValue(key, 'uk');
                  const maxLength = Math.max(enValue.length, ukValue.length);
                  const rows = Math.max(2, Math.ceil(maxLength / 50));

                  return (
                    <tr key={key} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono align-top border-r border-gray-700/50">
                        <div className="break-all">{key}</div>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-700/50">
                        <textarea
                          value={enValue}
                          onChange={(e) => handleValueChange(key, 'en', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y font-sans"
                          rows={rows}
                          placeholder="English translation..."
                        />
                      </td>
                      <td className="px-4 py-3">
                        <textarea
                          value={ukValue}
                          onChange={(e) => handleValueChange(key, 'uk', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-y font-sans"
                          rows={rows}
                          placeholder="Український переклад..."
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredKeys.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No translations found matching "{searchQuery}"
            </div>
          )}
        </div>
        )}

        {/* Stats */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
          <div>
            Showing <span className="text-white font-semibold">{filteredKeys.length}</span> of{' '}
            <span className="text-white font-semibold">{allKeys.length}</span> translation keys
          </div>
          <div className="text-xs text-gray-500">
            💡 Make your changes, then click "Save All Changes" button. All users will see updates after page refresh.
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LocalizationEditorPage;
