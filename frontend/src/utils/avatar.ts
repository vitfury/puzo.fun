import type { Race, Equipment } from '../types/user';

// Mapping from equipment name to image filename
// Format: /images/armor/{race}/{grade}/{filename}.png
const armorImageMap: Record<string, string> = {
  // No-Grade (N folder)
  'Apprentice': 'front_robe_apprentice_high.png',
  'Bone': 'front_light_bone_high.png',
  'Bronze': 'front_heavy_bronze_high.png',
  
  // D Grade
  'Scale': 'front_heavy_scale_high.png',
  'Brigandine': 'front_heavy_brigandine_high.png',
  
  // C Grade
  'Composite': 'front_heavy_composite_high.png',
  'Full Plate': 'front_heavy_fullplate_high.png',
  
  // B Grade
  'Avadon': 'front_heavy_avadon_high.png',
  'Blue Wolf': 'front_heavy_bluewolf_high.png',
  'Doom': 'front_heavy_doom_high.png',
  'Zubei': 'front_heavy_zubei_high.png',
  
  // A Grade
  'Dark Crystal': 'front_heavy_darkcrystal_high.png',
  'Tallum': 'front_heavy_tallum_high.png',
  'Majestic': 'front_heavy_majestic_high.png',
  'Nightmare': 'front_heavy_nightmare_high.png',
  
  // S Grade
  'Imperial Crusader': 'front_heavy_imperialcrusader_high.png',
  'Dynasty': 'front_heavy_dynasty_high.png',
  'Vesper': 'front_heavy_vesper_high.png',
};

// Map equipment grade to folder name
const gradeToFolder: Record<string, string> = {
  'no-grade': 'N',
  'D': 'D',
  'C': 'C',
  'B': 'B',
  'A': 'A',
  'S': 'S',
};

/**
 * Get the avatar image path based on race and equipped armor
 * @param race - User's race (human, elf, dark_elf, orc, dwarf)
 * @param equippedArmor - Currently equipped armor, or null for default
 * @returns Path to the avatar image
 */
export function getAvatarImagePath(race: Race, equippedArmor: Equipment | null): string {
  // Default armor is Apprentice
  const armorName = equippedArmor?.name || 'Apprentice';
  const armorGrade = equippedArmor?.grade || 'no-grade';
  
  const gradeFolder = gradeToFolder[armorGrade] || 'N';
  const imageFilename = armorImageMap[armorName] || armorImageMap['Apprentice'];
  
  return `/images/armor/${race}/${gradeFolder}/${imageFilename}`;
}

/**
 * Get the default avatar (Apprentice armor) for a race
 * @param race - User's race
 * @returns Path to the default avatar image
 */
export function getDefaultAvatarPath(race: Race): string {
  return `/images/armor/${race}/N/front_robe_apprentice_high.png`;
}

