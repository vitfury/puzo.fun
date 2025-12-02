import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { shopApi } from '../api/shop';
import type { Equipment } from '../types/user';

// Grade colors
const gradeColors: Record<string, string> = {
  'no-grade': 'border-gray-500 bg-gray-800/50',
  'D': 'border-blue-500 bg-blue-900/30',
  'C': 'border-green-500 bg-green-900/30',
  'B': 'border-red-500 bg-red-900/30',
  'A': 'border-purple-500 bg-purple-900/30',
  'S': 'border-yellow-500 bg-yellow-900/30',
};

const gradeTextColors: Record<string, string> = {
  'no-grade': 'text-gray-400',
  'D': 'text-blue-400',
  'C': 'text-green-400',
  'B': 'text-red-400',
  'A': 'text-purple-400',
  'S': 'text-yellow-400',
};

const gradeLabels: Record<string, string> = {
  'no-grade': 'NG',
  'D': 'D',
  'C': 'C',
  'B': 'B',
  'A': 'A',
  'S': 'S',
};

// Map equipment names to icon filenames
const getIconName = (name: string): string => {
  const iconMap: Record<string, string> = {
    'Apprentice': 'apprentice',
    'Bone': 'bone',
    'Bronze': 'bronze',
    'Scale': 'scale',
    'Brigandine': 'brigandine',
    'Composite': 'composite',
    'Full Plate': 'armor_t62_ul_i00',
    'Avadon': 'avadon',
    'Blue Wolf': 'bluewolf',
    'Doom': 'doom',
    'Zubei': 'zubei',
    'Dark Crystal': 'dark_crystal',
    'Tallum': 'tallum',
    'Majestic': 'majestic',
    'Nightmare': 'nightmare',
    'Imperial Crusader': 'imperial',
    'Dynasty': 'dynasty',
    'Vesper': 'vesper',
  };
  return iconMap[name] || 'bronze';
};

// Map equipment names to avatar image filenames
const getAvatarImageName = (name: string): string => {
  const imageMap: Record<string, string> = {
    'Apprentice': 'front_robe_apprentice_high',
    'Bone': 'front_light_bone_high',
    'Bronze': 'front_heavy_bronze_high',
    'Scale': 'front_heavy_scale_high',
    'Brigandine': 'front_heavy_brigandine_high',
    'Composite': 'front_heavy_composite_high',
    'Full Plate': 'front_heavy_fullplate_high',
    'Avadon': 'front_heavy_avadon_high',
    'Blue Wolf': 'front_heavy_bluewolf_high',
    'Doom': 'front_heavy_doom_high',
    'Zubei': 'front_heavy_zubei_high',
    'Dark Crystal': 'front_heavy_darkcrystal_high',
    'Tallum': 'front_heavy_tallum_high',
    'Majestic': 'front_heavy_majestic_high',
    'Nightmare': 'front_heavy_nightmare_high',
    'Imperial Crusader': 'front_heavy_imperialcrusader_high',
    'Dynasty': 'front_heavy_dynasty_high',
    'Vesper': 'front_heavy_vesper_high',
  };
  return imageMap[name] || 'front_heavy_bronze_high';
};

// Map grade to folder name (no-grade -> N)
const getGradeFolder = (grade: string): string => {
  return grade === 'no-grade' ? 'N' : grade;
};

const GRADE_ORDER = ['no-grade', 'D', 'C', 'B', 'A', 'S'] as const;
const MAX_ITEMS_PER_GRADE = 6;

type SelectionSource = 'shop' | 'inventory';

export const ShopPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  const [selectionSource, setSelectionSource] = useState<SelectionSource>('shop');
  
  const [shopItems, setShopItems] = useState<Equipment[]>([]);
  const [inventory, setInventory] = useState<Equipment[]>([]);
  const [ownedIds, setOwnedIds] = useState<number[]>([]);
  const [equippedArmorId, setEquippedArmorId] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selling, setSelling] = useState(false);
  const [equipping, setEquipping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [shopData, inventoryData] = await Promise.all([
        shopApi.list('armor'),
        shopApi.inventory()
      ]);
      
      setShopItems(shopData.equipment);
      setOwnedIds(shopData.owned_ids);
      setInventory(inventoryData.inventory.filter(i => i.type === 'armor'));
      setEquippedArmorId(inventoryData.equipped_armor_id);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Group shop items by grade
  const groupedShopItems = useMemo(() => {
    const grouped: Record<string, Equipment[]> = {};
    GRADE_ORDER.forEach(grade => {
      grouped[grade] = shopItems.filter(item => item.grade === grade);
    });
    return grouped;
  }, [shopItems]);

  // Group inventory items by grade
  const groupedInventory = useMemo(() => {
    const grouped: Record<string, Equipment[]> = {};
    GRADE_ORDER.forEach(grade => {
      grouped[grade] = inventory.filter(item => item.grade === grade);
    });
    return grouped;
  }, [inventory]);

  const handlePurchase = async () => {
    if (!user || !selectedItem || purchasing) return;

    try {
      setPurchasing(true);
      setError(null);
      const result = await shopApi.purchase(selectedItem.id);
      
      updateUser({ ...user, coins: result.user_coins });
      setOwnedIds(prev => [...prev, selectedItem.id]);
      setInventory(prev => [...prev, selectedItem]);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  const handleSell = async () => {
    if (!user || !selectedItem || selling) return;

    try {
      setSelling(true);
      setError(null);
      const result = await shopApi.sell(selectedItem.id);
      
      updateUser({ ...user, coins: result.user_coins });
      setInventory(prev => prev.filter(i => i.id !== selectedItem.id));
      setOwnedIds(prev => prev.filter(id => id !== selectedItem.id));
      setSelectedItem(null);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Sell failed');
    } finally {
      setSelling(false);
    }
  };

  const handleEquip = async () => {
    if (!user || !selectedItem || equipping) return;

    try {
      setEquipping(true);
      setError(null);
      const result = await shopApi.equip(selectedItem.id);
      
      setEquippedArmorId(result.equipped_armor_id);
      
      updateUser({
        ...user,
        equipped_armor_id: result.equipped_armor_id,
        equipped_armor: result.equipped_armor,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Equip failed');
    } finally {
      setEquipping(false);
    }
  };

  const handleUnequip = async () => {
    if (!user) return;

    try {
      setError(null);
      await shopApi.unequip('armor');
      
      setEquippedArmorId(null);
      updateUser({ ...user, equipped_armor_id: null, equipped_armor: null });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unequip failed');
    }
  };

  const isOwned = (item: Equipment): boolean => ownedIds.includes(item.id);
  const isEquipped = (item: Equipment): boolean => equippedArmorId === item.id;
  const canAfford = (item: Equipment): boolean => user ? user.coins >= item.price : false;
  const meetsLevel = (item: Equipment): boolean => user ? user.level >= item.required_level : false;

  if (!user) return null;

  const race = user.race || 'human';

  // Render shop item cell
  const renderShopCell = (grade: string, index: number) => {
    const items = groupedShopItems[grade];
    const item = items[index];
    
    if (!item) {
      return (
        <div 
          key={`shop-${grade}-${index}`}
          className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-700 bg-gray-900/30"
        />
      );
    }

    const owned = isOwned(item);
    const levelOk = meetsLevel(item);
    const isSelected = selectedItem?.id === item.id && selectionSource === 'shop';
    const iconName = getIconName(item.name);
    const isClickable = levelOk || owned;

    return (
      <div
        key={`shop-${item.id}`}
        title={!levelOk && !owned ? `${item.name} — Lvl ${item.required_level}` : item.name}
        className="relative group"
      >
        <button
          onClick={() => { if (isClickable) { setSelectedItem(item); setSelectionSource('shop'); }}}
          disabled={!isClickable}
          className={`relative w-12 h-12 rounded-lg border-2 transition-all duration-200 overflow-hidden ${
            isSelected
              ? `ring-2 ring-yellow-400 ${gradeColors[item.grade]}`
              : owned
                ? `${gradeColors[item.grade]} opacity-50`
                : !levelOk
                  ? 'border-gray-700 bg-gray-900/50 opacity-30 cursor-not-allowed'
                  : `${gradeColors[item.grade]} hover:brightness-125`
          }`}
        >
          <img
            src={`/images/icons/${iconName}.png`}
            alt={item.name}
            className="w-full h-full object-contain p-0.5"
            onError={(e) => { (e.target as HTMLImageElement).src = '/images/icons/bronze.png'; }}
          />
          
          {owned && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="text-green-400 text-xs">✓</span>
            </div>
          )}
          
          {!levelOk && !owned && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-[10px]">🔒</span>
            </div>
          )}

        </button>
        
        {!levelOk && !owned && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-gray-200 text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-gray-600">
            Lvl {item.required_level}
          </div>
        )}
      </div>
    );
  };

  // Render inventory item cell
  const renderInventoryCell = (grade: string, index: number) => {
    const items = groupedInventory[grade];
    const item = items[index];
    
    if (!item) {
      return (
        <div 
          key={`inv-${grade}-${index}`}
          className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-700 bg-gray-900/30"
        />
      );
    }

    const equipped = isEquipped(item);
    const levelOk = meetsLevel(item);
    const isSelected = selectedItem?.id === item.id && selectionSource === 'inventory';
    const iconName = getIconName(item.name);

    return (
      <div key={`inv-${item.id}`} title={item.name} className="relative">
        <button
          onClick={() => { setSelectedItem(item); setSelectionSource('inventory'); }}
          className={`relative w-12 h-12 rounded-lg border-2 transition-all duration-200 overflow-hidden ${
            isSelected
              ? `ring-2 ring-yellow-400 ${gradeColors[item.grade]}`
              : equipped
                ? `ring-2 ring-green-400 ${gradeColors[item.grade]}`
                : `${gradeColors[item.grade]} hover:brightness-125`
          }`}
        >
          <img
            src={`/images/icons/${iconName}.png`}
            alt={item.name}
            className="w-full h-full object-contain p-0.5"
            onError={(e) => { (e.target as HTMLImageElement).src = '/images/icons/bronze.png'; }}
          />
          
          {equipped && (
            <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center text-[6px]">
              ⭐
            </div>
          )}
          
          {!levelOk && (
            <div className="absolute bottom-0 left-0 right-0 text-center text-[8px] bg-gray-900/80 text-gray-400">
              🔒
            </div>
          )}
        </button>
      </div>
    );
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-2">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-white">🛡️ {t('shop.armorShop', 'Магазин броні')}</h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded-lg">
                <span className="text-xl" style={{ filter: 'sepia(1) saturate(3) brightness(1.1) hue-rotate(5deg)' }}>🪙</span>
                <span className="text-yellow-400 font-bold">{user.coins.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded-lg">
                <span className="text-xl">⭐</span>
                <span className="text-purple-400 font-bold">Lvl {user.level}</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* LEFT - Shop */}
            <div className="bg-gray-800 rounded-lg p-3 flex flex-col">
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                🛍️ {t('shop.shopTab', 'Магазин')}
              </h2>
              <div className="space-y-1.5">
                {GRADE_ORDER.map(grade => (
                  <div key={`shop-${grade}`} className="flex items-center gap-1.5">
                    <div className={`w-6 text-center font-bold text-xs ${gradeTextColors[grade]}`}>
                      {gradeLabels[grade]}
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: MAX_ITEMS_PER_GRADE }).map((_, index) => 
                        renderShopCell(grade, index)
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Shop item info & actions */}
              {selectedItem && selectionSource === 'shop' && (
                <div className="mt-auto pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-bold ${gradeTextColors[selectedItem.grade]}`}>
                      {selectedItem.name}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${gradeColors[selectedItem.grade]}`}>
                      {gradeLabels[selectedItem.grade]}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-gray-400">Lvl {selectedItem.required_level}</span>
                    <span className="text-yellow-400 font-bold"><span style={{ filter: 'sepia(1) saturate(3) brightness(1.1) hue-rotate(5deg)' }}>🪙</span> {selectedItem.price.toLocaleString()}</span>
                  </div>

                  {isOwned(selectedItem) ? (
                    <div className="text-center py-2 rounded-lg bg-green-900/30 text-green-400 text-sm border border-green-600">
                      ✓ {t('shop.alreadyOwned', 'Вже в інвентарі')}
                    </div>
                  ) : !meetsLevel(selectedItem) ? (
                    <div className="text-center py-2 rounded-lg bg-gray-700 text-gray-400 text-sm">
                      🔒 Lvl {selectedItem.required_level}
                    </div>
                  ) : !canAfford(selectedItem) ? (
                    <div className="text-center py-2 rounded-lg bg-red-900/30 text-red-400 text-sm border border-red-600">
                      💸 {t('shop.notEnough', 'Недостатньо')}
                    </div>
                  ) : (
                    <button
                      onClick={handlePurchase}
                      disabled={purchasing}
                      className="w-full py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50"
                    >
                      {purchasing ? '...' : `🛒 ${t('shop.buy', 'Купити')}`}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* CENTER - Avatar Preview */}
            <div className="bg-gray-900 rounded-lg p-3 flex flex-col">
              <div className="bg-gray-900 rounded-lg overflow-hidden" style={{ height: '550px' }}>
                {selectedItem ? (
                  <div
                    className="w-full h-full bg-no-repeat bg-center"
                    style={{
                      backgroundImage: `url(/images/armor/${race}/${getGradeFolder(selectedItem.grade)}/${getAvatarImageName(selectedItem.name)}.png)`,
                      backgroundSize: '160%',
                      backgroundPosition: '52% 86%',
                    }}
                  />
                ) : user.equipped_armor ? (
                  <div
                    className="w-full h-full bg-no-repeat bg-center opacity-60"
                    style={{
                      backgroundImage: `url(/images/armor/${race}/${getGradeFolder(user.equipped_armor.grade)}/${getAvatarImageName(user.equipped_armor.name)}.png)`,
                      backgroundSize: '160%',
                      backgroundPosition: '52% 86%',
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-center">
                    <div>
                      <div className="text-4xl mb-2">👤</div>
                      <p className="text-sm">{t('shop.selectArmor', 'Оберіть броню')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT - Inventory */}
            <div className="bg-gray-800 rounded-lg p-3">
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                🎒 {t('shop.inventoryTab', 'Інвентар')} <span className="text-gray-400 font-normal">({inventory.length})</span>
              </h2>
              <div className="space-y-1.5">
                {GRADE_ORDER.map(grade => (
                  <div key={`inv-${grade}`} className="flex items-center gap-1.5">
                    <div className={`w-6 text-center font-bold text-xs ${gradeTextColors[grade]}`}>
                      {gradeLabels[grade]}
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: MAX_ITEMS_PER_GRADE }).map((_, index) => 
                        renderInventoryCell(grade, index)
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Inventory item info & actions */}
              {selectedItem && selectionSource === 'inventory' && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-bold ${gradeTextColors[selectedItem.grade]}`}>
                      {selectedItem.name}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${gradeColors[selectedItem.grade]}`}>
                      {gradeLabels[selectedItem.grade]}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-gray-400">Lvl {selectedItem.required_level}</span>
                    <span className="text-yellow-400 font-bold"><span style={{ filter: 'sepia(1) saturate(3) brightness(1.1) hue-rotate(5deg)' }}>🪙</span> {selectedItem.price.toLocaleString()}</span>
                  </div>

                  <div className="space-y-2">
                    {isEquipped(selectedItem) ? (
                      <button
                        onClick={handleUnequip}
                        className="w-full py-2 rounded-lg bg-yellow-900/50 text-yellow-400 font-bold hover:bg-yellow-900/70 border border-yellow-600"
                      >
                        ⭐ {t('shop.unequip', 'Зняти')}
                      </button>
                    ) : meetsLevel(selectedItem) ? (
                      <button
                        onClick={handleEquip}
                        disabled={equipping}
                        className="w-full py-2 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700 disabled:opacity-50"
                      >
                        {equipping ? '...' : t('shop.equip', 'Екіпірувати')}
                      </button>
                    ) : (
                      <div className="text-center py-2 rounded-lg bg-gray-700 text-gray-400 text-sm">
                        🔒 Lvl {selectedItem.required_level}
                      </div>
                    )}
                    
                    {!isEquipped(selectedItem) && selectedItem.name !== 'Apprentice' && (
                      <button
                        onClick={handleSell}
                        disabled={selling}
                        className="w-full py-2 rounded-lg bg-red-900/30 text-red-400 font-bold hover:bg-red-900/50 border border-red-600 text-sm"
                      >
                        {selling ? '...' : `💰 ${t('shop.sell', 'Продати')} за ${selectedItem.price.toLocaleString()}`}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
