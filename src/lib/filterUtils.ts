import { MenuItem, DietaryFilterValue, CartItem, FoodType } from '../types';

/**
 * Filter menu items according to mandatory dietary rules:
 * - 'all': all items
 * - 'veg': includes 'veg' and 'vegan'
 * - 'non_veg': includes 'non_veg' and 'egg'
 */
export function filterMenuItems(
  items: MenuItem[],
  filter: DietaryFilterValue
): MenuItem[] {
  return items.filter((item) => {
    if (filter === 'all') return true;

    if (filter === 'veg') {
      return item.foodType === 'veg' || item.foodType === 'vegan';
    }

    if (filter === 'non_veg') {
      return item.foodType === 'non_veg' || item.foodType === 'egg';
    }

    return true;
  });
}

/**
 * Check if current cart contains items that conflict with the newly requested dietary filter.
 * Returns the list of conflicting items (if any).
 */
export function getConflictingCartItems(
  cartItems: CartItem[],
  targetFilter: DietaryFilterValue
): CartItem[] {
  if (targetFilter === 'all') return [];

  return cartItems.filter((cartItem) => {
    const foodType = cartItem.menuItem.foodType;
    if (targetFilter === 'veg') {
      // Conflicting if non_veg or egg
      return foodType === 'non_veg' || foodType === 'egg';
    }
    if (targetFilter === 'non_veg') {
      // Conflicting if veg or vegan
      return foodType === 'veg' || foodType === 'vegan';
    }
    return false;
  });
}

/**
 * Helper to display human-readable badge text and styling for FoodType
 */
export function getFoodTypeLabel(foodType: FoodType): {
  label: string;
  badgeClass: string;
  symbol: string;
} {
  switch (foodType) {
    case 'veg':
      return {
        label: 'Pure Veg',
        badgeClass: 'text-[#2C5EAD] border-[#2C5EAD]',
        symbol: '●',
      };
    case 'vegan':
      return {
        label: '100% Plant Vegan',
        badgeClass: 'text-[#2e7d32] border-[#2e7d32]',
        symbol: '🌱',
      };
    case 'non_veg':
      return {
        label: 'Non-Veg',
        badgeClass: 'text-[#b91c1c] border-[#b91c1c]',
        symbol: '▲',
      };
    case 'egg':
      return {
        label: 'Eggitarian',
        badgeClass: 'text-[#d97706] border-[#d97706]',
        symbol: '🥚',
      };
  }
}
