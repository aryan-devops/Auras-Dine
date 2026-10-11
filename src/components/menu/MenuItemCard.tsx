import React, { useState } from 'react';
import { Plus, Minus, Clock, Flame, Sparkles } from 'lucide-react';
import { MenuItem } from '../../types';
import { useRestaurant } from '../../context/RestaurantContext';
import { FoodIllustration } from './FoodIllustration';
import { ItemCustomizeModal } from './ItemCustomizeModal';

interface MenuItemCardProps {
  item: MenuItem;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const { currentTenant, cart, updateCartQuantity, addToCart } = useRestaurant();
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  // Check how many of this item are currently in cart (across variants)
  const cartInstances = cart.filter((ci) => ci.menuItem.id === item.id);
  const totalInCart = cartInstances.reduce((sum, ci) => sum + ci.quantity, 0);

  const hasCustomizations =
    (item.variants && item.variants.length > 0) ||
    (item.addons && item.addons.length > 0);

  const handleAddClick = () => {
    if (hasCustomizations) {
      setIsCustomizeOpen(true);
    } else {
      addToCart(item);
    }
  };

  const handleIncrement = () => {
    if (hasCustomizations && cartInstances.length > 1) {
      // If multiple distinct variants are in cart, open customize to pick
      setIsCustomizeOpen(true);
    } else if (cartInstances.length === 1) {
      updateCartQuantity(cartInstances[0].cartItemId, 1);
    } else {
      handleAddClick();
    }
  };

  const handleDecrement = () => {
    if (cartInstances.length > 0) {
      // decrement the most recently modified or single item
      updateCartQuantity(cartInstances[cartInstances.length - 1].cartItemId, -1);
    }
  };

  return (
    <>
      <div className="group relative bg-white rounded-2xl p-4 border border-[#30673A]/10 hover:border-[#30673A]/25 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between">
        <div>
          {/* Top image & badges container */}
          <div className="relative mb-3">
            <FoodIllustration
              itemId={item.id}
              name={item.name}
              foodType={item.foodType}
              imagePath={item.imagePath}
              className="w-full h-44 sm:h-48 object-cover"
            />

            {/* Recommended & Must Try unboxed clean tags */}
            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
              {item.isMustTry && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight bg-[#E3792F] text-white shadow-xs">
                  <Sparkles className="w-2.5 h-2.5" />
                  Must Try
                </span>
              )}
              {item.isRecommended && !item.isMustTry && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight bg-[#30673A] text-white shadow-xs">
                  Chef Pick
                </span>
              )}
            </div>
          </div>

          {/* Dish details */}
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-bold text-[#1E231F] glinster-font group-hover:text-[#30673A] transition-colors leading-snug">
                {item.name}
              </h3>
            </div>

            <p className="text-xs text-[#1E231F]/70 line-clamp-2 leading-relaxed">
              {item.description}
            </p>

            {/* Metadata row with bullet separators */}
            <div className="flex items-center gap-2 pt-1 text-[11px] text-neutral-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-400" />
                {item.prepTimeMinutes} mins
              </span>
              {item.calories && (
                <>
                  <span aria-hidden="true" className="text-neutral-300">·</span>
                  <span className="flex items-center gap-0.5">
                    <Flame className="w-3 h-3 text-[#E3792F]" />
                    {item.calories} kcal
                  </span>
                </>
              )}
              {item.allergenInformation && (
                <>
                  <span aria-hidden="true" className="text-neutral-300">·</span>
                  <span className="truncate max-w-[120px] text-neutral-400">
                    {item.allergenInformation}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom price and add-to-cart row */}
        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs text-neutral-400 font-medium block -mb-0.5">
              Price
            </span>
            <span className="text-base font-bold text-[#1E231F] font-mono tabular-nums">
              {currentTenant.currencySymbol}{item.basePrice.toFixed(2)}
            </span>
          </div>

          <div>
            {totalInCart > 0 ? (
              <div className="flex items-center gap-2 bg-[#30673A] text-white rounded-full p-1 shadow-xs">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/20 active:scale-95 transition-transform"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold tabular-nums w-4 text-center">
                  {totalInCart}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/20 active:scale-95 transition-transform"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddClick}
                className="py-1.5 px-4 rounded-full bg-[#E9E9C7]/50 hover:bg-[#30673A] text-[#30673A] hover:text-white border border-[#30673A]/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <span>Add</span>
                <Plus className="w-3.5 h-3.5" />
                {hasCustomizations && (
                  <span className="text-[10px] opacity-75 font-normal ml-0.5">• Custom</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {isCustomizeOpen && (
        <ItemCustomizeModal
          item={item}
          onClose={() => setIsCustomizeOpen(false)}
        />
      )}
    </>
  );
};
