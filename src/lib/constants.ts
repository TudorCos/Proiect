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

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
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
