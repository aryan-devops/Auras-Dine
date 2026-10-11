import React, { useState } from 'react';
import { Plus, Minus, Clock, Flame, Sparkles, Heart } from 'lucide-react';
import { MenuItem } from '../../types';
import { useRestaurant } from '../../context/RestaurantContext';
import { FoodIllustration } from './FoodIllustration';
import { ItemCustomizeModal } from './ItemCustomizeModal';
import { DietaryBadge } from './DietaryBadge';

interface MenuItemCardProps {
  item: MenuItem;
  variant?: 'standard' | 'highlight';
}

const getItemSpecialtyBadge = (item: MenuItem): { label: string; bg: string } => {
  if (item.isMustTry) {
    return { label: 'Must Try', bg: 'bg-[#E3792F] text-white shadow-sm' };
  }
  if (item.isRecommended) {
    return { label: "Chef's Pick", bg: 'bg-[#30673A] text-white shadow-sm' };
  }
  const name = item.name.toLowerCase();
  const cat = (item.categoryId || '').toLowerCase();
  if (cat.includes('pizza') || name.includes('pizza')) {
    return { label: 'Wood-Fired', bg: 'bg-[#30673A] text-white shadow-xs' };
  }
  if (cat.includes('dessert') || name.includes('chocolate') || name.includes('kulfi') || name.includes('skillet')) {
    return { label: 'House Sweet', bg: 'bg-[#E3792F] text-white shadow-xs' };
  }
  if (cat.includes('drink') || name.includes('tonic') || name.includes('soda')) {
    return { label: 'Craft Pour', bg: 'bg-[#30673A] text-white shadow-xs' };
  }
  if (cat.includes('burger') || name.includes('burger') || name.includes('smash')) {
    return { label: 'Smash Grilled', bg: 'bg-[#E3792F] text-white shadow-xs' };
  }
  if (cat.includes('grill') || name.includes('ribs') || name.includes('charcoal')) {
    return { label: 'Charcoal Pit', bg: 'bg-[#30673A] text-white shadow-xs' };
  }
  if (item.foodType === 'vegan') {
    return { label: '100% Plant', bg: 'bg-[#30673A] text-white shadow-xs' };
  }
  return { label: 'Signature', bg: 'bg-[#1E231F] text-white shadow-xs' };
};

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, variant = 'standard' }) => {
  const {
    currentTenant,
    cart,
    updateCartQuantity,
    addToCart,
    isFavorite,
    toggleFavorite,
  } = useRestaurant();
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  // Check how many of this item are currently in cart (across variants)
  const cartInstances = cart.filter((ci) => ci.menuItem.id === item.id);
  const totalInCart = cartInstances.reduce((sum, ci) => sum + ci.quantity, 0);

  const hasCustomizations =
    (item.variants && item.variants.length > 0) ||
    (item.addons && item.addons.length > 0);

  const isFavorited = isFavorite(item.id);
  const isAvailable = item.isAvailable !== false;

  const handleAddClick = () => {
    if (!isAvailable) return;
    if (hasCustomizations) {
      setIsCustomizeOpen(true);
    } else {
      addToCart(item);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAvailable) return;
    if (hasCustomizations && cartInstances.length > 1) {
      setIsCustomizeOpen(true);
    } else if (cartInstances.length === 1) {
      updateCartQuantity(cartInstances[0].cartItemId, 1);
    } else {
      handleAddClick();
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartInstances.length > 0) {
      updateCartQuantity(cartInstances[cartInstances.length - 1].cartItemId, -1);
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(item.id);
  };

  // If used inside the horizontal carousel highlight tray on mobile:
  if (variant === 'highlight') {
    return (
      <div className="w-[215px] xs:w-[235px] sm:w-[250px] max-w-[85vw] shrink-0 snap-start bg-white rounded-2xl p-2.5 sm:p-3 border border-[#30673A]/12 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
        <div>
          {/* Highlight image */}
          <div className="relative w-full aspect-[16/10] max-h-28 rounded-xl overflow-hidden bg-[#FAF8F2] mb-2">
            <FoodIllustration
              itemId={item.id}
              name={item.name}
              foodType={item.foodType}
              imagePath={item.imagePath}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 flex items-center gap-1">
              <DietaryBadge foodType={item.foodType} size="sm" />
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${getItemSpecialtyBadge(item).bg}`}>
                {getItemSpecialtyBadge(item).label}
              </span>
            </div>
            <button
              type="button"
              onClick={handleFavoriteToggle}
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-neutral-400 hover:text-[#E3792F] shadow-xs cursor-pointer"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isFavorited ? 'fill-[#E3792F] text-[#E3792F]' : ''
                }`}
              />
            </button>
          </div>

          <h4 className="text-sm font-bold text-[#1E231F] font-heading glinster-font line-clamp-1 leading-snug">
            {item.name}
          </h4>
          <p className="text-[11px] text-[#1E231F]/65 line-clamp-1 mt-0.5">
            {item.description}
          </p>

          {/* Metadata row */}
          <div className="flex items-center flex-wrap gap-1.5 text-[10px] text-neutral-500 mt-1.5">
            <span className="flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5 text-neutral-400" />
              {item.prepTimeMinutes} mins
            </span>
            {item.calories && (
              <>
                <span aria-hidden="true" className="text-neutral-300">·</span>
                <span className="flex items-center gap-0.5 text-neutral-600 font-medium">
                  <Flame className="w-2.5 h-2.5 text-[#E3792F]" />
                  {item.calories} kcal
                </span>
              </>
            )}
          </div>
          {item.allergenInformation && (
            <div className="mt-1">
              <span className="text-[#30673A] bg-[#30673A]/8 px-1.5 py-0.5 rounded font-semibold text-[9.5px] truncate inline-block max-w-full">
                {item.allergenInformation}
              </span>
            </div>
          )}
        </div>

        <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">
              Price
            </span>
            <span className="text-sm xs:text-base font-bold text-[#1E231F] tabular-nums font-heading glinster-font">
              {currentTenant.currencySymbol}{item.basePrice.toFixed(2)}
            </span>
          </div>

          {totalInCart > 0 ? (
            <div className="flex items-center gap-1.5 bg-[#30673A] text-white rounded-xl py-1 px-2 shadow-xs">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-4 h-4 rounded flex items-center justify-center hover:bg-black/20 active:scale-95 cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-xs font-bold tabular-nums min-w-[14px] text-center">
                {totalInCart}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                className="w-4 h-4 rounded flex items-center justify-center hover:bg-black/20 active:scale-95 cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAddClick}
              className="py-1 px-2.5 rounded-xl bg-white hover:bg-[#30673A] text-[#30673A] hover:text-white border border-[#30673A]/30 text-xs font-bold shadow-2xs flex items-center gap-1 active:scale-95 transition-colors cursor-pointer"
            >
              <span>Add</span>
              <Plus className="w-3 h-3" />
              {hasCustomizations && (
                <span className="text-[9px] font-normal opacity-85 ml-0.5">• Custom</span>
              )}
            </button>
          )}
        </div>

        {isCustomizeOpen && (
          <ItemCustomizeModal
            item={item}
            onClose={() => setIsCustomizeOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full">
      {/* =========================================================================
          DESKTOP & TABLET VIEW (md: 768px+): Large Image-Focused Card
          ========================================================================= */}
      <div className="hidden md:flex group relative bg-white rounded-3xl p-4 border border-[#30673A]/12 hover:border-[#30673A]/30 transition-all duration-300 shadow-xs hover:shadow-lg flex-col justify-between overflow-hidden h-full">
        <div>
          {/* Top image & badges container */}
          <div className="relative mb-3.5 rounded-2xl overflow-hidden bg-[#FAF8F2]">
            <FoodIllustration
              itemId={item.id}
              name={item.name}
              foodType={item.foodType}
              imagePath={item.imagePath}
              className="w-full h-48 lg:h-52 object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Sold Out Overlay if unavailable */}
            {!isAvailable && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-3 text-center">
                <span className="px-3 py-1 rounded-full bg-white/95 text-neutral-800 text-xs font-bold shadow-md">
                  Currently Sold Out
                </span>
              </div>
            )}

            {/* Top-left Badges: Must Try / Chef Pick / Signature */}
            <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight ${getItemSpecialtyBadge(item).bg}`}>
                {item.isMustTry && <Sparkles className="w-3 h-3 text-white" />}
                {getItemSpecialtyBadge(item).label}
              </span>
            </div>

            {/* Top-right Controls: Dietary Badge & Favorite Heart */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
              {/* Dietary Indicator */}
              <div className="bg-white/95 backdrop-blur-xs p-1.5 rounded-xl shadow-xs border border-neutral-200/80">
                <DietaryBadge foodType={item.foodType} size="sm" />
              </div>

              {/* Favorite Button */}
              <button
                type="button"
                onClick={handleFavoriteToggle}
                aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                className={`w-8 h-8 rounded-xl flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer shadow-xs ${
                  isFavorited
                    ? 'bg-white text-[#E3792F] border border-[#E3792F]/40'
                    : 'bg-white/90 text-neutral-400 hover:text-[#E3792F] hover:bg-white border border-neutral-200/80'
                }`}
              >
                <Heart
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isFavorited ? 'fill-[#E3792F] scale-110' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Dish Details */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base lg:text-lg font-bold text-[#1E231F] font-heading glinster-font group-hover:text-[#30673A] transition-colors leading-snug">
                {item.name}
              </h3>
            </div>

            <p className="text-xs text-[#1E231F]/70 line-clamp-2 leading-relaxed">
              {item.description}
            </p>

            {/* Metadata row with bullet separators */}
            <div className="flex items-center flex-wrap gap-2 pt-1 text-[11px] text-neutral-500">
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
                  <span className="truncate max-w-[140px] text-neutral-400" title={item.allergenInformation}>
                    {item.allergenInformation}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Price & Add-To-Cart Row */}
        <div className="mt-4 pt-3.5 border-t border-neutral-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold block">
              Price
            </span>
            <span className="text-base lg:text-lg font-bold text-[#1E231F] tabular-nums font-heading">
              {currentTenant.currencySymbol}{item.basePrice.toFixed(2)}
            </span>
          </div>

          <div>
            {!isAvailable ? (
              <span className="py-2 px-3.5 rounded-xl bg-neutral-100 text-neutral-400 text-xs font-semibold select-none cursor-not-allowed">
                Sold Out
              </span>
            ) : totalInCart > 0 ? (
              <div className="flex items-center gap-2 bg-[#30673A] text-white rounded-full p-1 shadow-sm">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/20 active:scale-95 transition-transform cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold tabular-nums min-w-[18px] text-center">
                  {totalInCart}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/20 active:scale-95 transition-transform cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddClick}
                className="py-2 px-4 rounded-xl bg-[#E9E9C7]/50 hover:bg-[#30673A] text-[#30673A] hover:text-white border border-[#30673A]/25 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
              >
                <span>Add</span>
                <Plus className="w-3.5 h-3.5" />
                {hasCustomizations && (
                  <span className="text-[10px] opacity-80 font-normal ml-0.5">• Custom</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          MOBILE VIEW (< 768px): Ultra-Professional, Large-Image Card (Matching Chef's Recommendations)
          ========================================================================= */}
      <div className="md:hidden bg-white rounded-2xl p-3 sm:p-3.5 border border-[#30673A]/12 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between w-full max-w-full min-w-0 overflow-hidden">
        <div>
          {/* Top Big Food Image (Same signature design as Chef's Recommendations) */}
          <div className="relative w-full aspect-[16/10] max-h-48 rounded-xl overflow-hidden bg-[#FAF8F2] mb-3">
            <FoodIllustration
              itemId={item.id}
              name={item.name}
              foodType={item.foodType}
              imagePath={item.imagePath}
              className="w-full h-full object-cover"
            />

            {/* Top-left Badges: Dietary & Specialty (Must Try / Chef's Pick / Signature) */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap z-10">
              <DietaryBadge foodType={item.foodType} size="sm" />
              <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${getItemSpecialtyBadge(item).bg}`}>
                {item.isMustTry && <Sparkles className="w-2.5 h-2.5" />}
                {getItemSpecialtyBadge(item).label}
              </span>
            </div>

            {/* Top-right Favorite Heart Button */}
            <button
              type="button"
              onClick={handleFavoriteToggle}
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-neutral-400 hover:text-[#E3792F] shadow-xs cursor-pointer z-10 active:scale-90 transition-transform"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isFavorited ? 'fill-[#E3792F] text-[#E3792F]' : ''
                }`}
              />
            </button>

            {/* Sold Out Overlay if unavailable */}
            {!isAvailable && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 text-center z-20">
                <span className="text-xs font-bold text-white uppercase tracking-wider bg-black/40 px-3 py-1 rounded-full border border-white/20">
                  Sold Out
                </span>
              </div>
            )}
          </div>

          {/* Dish Details */}
          <div className="space-y-1.5">
            <h3 className="text-[15px] sm:text-base font-bold text-[#1E231F] font-heading glinster-font leading-snug break-words">
              {item.name}
            </h3>

            <p className="text-xs text-[#1E231F]/70 line-clamp-2 leading-relaxed break-words">
              {item.description}
            </p>

            {/* Clean Metadata Row with prep time, calories, and allergen information */}
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-[11px] text-neutral-500 pt-1">
              <span className="flex items-center gap-1 font-medium text-neutral-600">
                <Clock className="w-3 h-3 text-neutral-400 shrink-0" />
                {item.prepTimeMinutes} mins
              </span>
              {item.calories && (
                <>
                  <span aria-hidden="true" className="text-neutral-300">·</span>
                  <span className="flex items-center gap-0.5 text-neutral-600 font-medium">
                    <Flame className="w-3 h-3 text-[#E3792F] shrink-0" />
                    {item.calories} kcal
                  </span>
                </>
              )}
              {item.allergenInformation && (
                <>
                  <span aria-hidden="true" className="text-neutral-300">·</span>
                  <span className="text-[#30673A] bg-[#30673A]/8 px-1.5 py-0.5 rounded font-semibold text-[10.5px] break-words">
                    {item.allergenInformation}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Price & Add-To-Cart Row (Ultra-clean, professional alignment) */}
        <div className="mt-3.5 pt-3 border-t border-neutral-100 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[9.5px] text-neutral-400 font-bold uppercase tracking-wider">
              Price
            </span>
            <span className="text-base sm:text-lg font-bold text-[#1E231F] tabular-nums font-heading glinster-font">
              {currentTenant.currencySymbol}{item.basePrice.toFixed(2)}
            </span>
          </div>

          <div>
            {!isAvailable ? (
              <span className="py-1.5 px-3 rounded-xl bg-neutral-200 text-neutral-500 text-xs font-bold shadow-2xs select-none">
                Unavailable
              </span>
            ) : totalInCart > 0 ? (
              <div className="flex items-center gap-2 bg-[#30673A] text-white rounded-xl py-1.5 px-2.5 shadow-sm">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="w-5 h-5 rounded-lg flex items-center justify-center hover:bg-black/20 active:scale-95 transition-transform cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-bold tabular-nums min-w-[16px] text-center">
                  {totalInCart}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="w-5 h-5 rounded-lg flex items-center justify-center hover:bg-black/20 active:scale-95 transition-transform cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddClick}
                className="py-1.5 px-3.5 rounded-xl bg-white hover:bg-[#30673A] text-[#30673A] hover:text-white border border-[#30673A]/30 text-xs font-bold shadow-2xs flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <span>Add</span>
                <Plus className="w-3 h-3" />
                {hasCustomizations && (
                  <span className="text-[10px] font-normal opacity-85 ml-0.5">• Custom</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Item Customization Modal */}
      {isCustomizeOpen && (
        <ItemCustomizeModal
          item={item}
          onClose={() => setIsCustomizeOpen(false)}
        />
      )}
    </div>
  );
};
