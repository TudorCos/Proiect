import type { ProductCategory } from '@/types';

export const CATEGORY_ICONS: Record<string, string> = {
  CPU: '🔲',
  GPU: '🎮',
  RAM: '💾',
  Motherboard: '🖥️',
  PSU: '⚡',
  Storage: '💿',
  Case: '📦',
  Cooling: '❄️',
  Monitor: '🖥️',
  Peripherals: '⌨️',
};

export const CATEGORY_LABELS: Record<string, string> = {
  CPU: 'Procesoare',
  GPU: 'Plăci video',
  RAM: 'Memorii RAM',
  Motherboard: 'Plăci de bază',
  PSU: 'Surse',
  Storage: 'Stocare',
  Case: 'Carcase',
  Cooling: 'Coolere',
  Monitor: 'Monitoare',
  Peripherals: 'Periferice',
};

/** Get icon for any category, with fallback for custom ones */
export function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] || '📌';
}

/** Get label for any category, with fallback to the category name itself */
export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || category;
}
