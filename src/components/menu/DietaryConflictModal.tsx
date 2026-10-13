import React from 'react';
import { AlertCircle, Trash2, ShoppingBag, X } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

export const DietaryConflictModal: React.FC = () => {
  const {
    pendingDietaryFilter,
    conflictingCartItems,
    handleResolveConflict,
    currentTenant,
  } = useRestaurant();

  if (!pendingDietaryFilter || conflictingCartItems.length === 0) {
    return null;
  }

  const isSwitchingToVeg = pendingDietaryFilter === 'veg';
  const conflictTypeLabel = isSwitchingToVeg ? 'non-vegetarian' : 'vegetarian';
  const targetLabel = isSwitchingToVeg ? 'Veg Only' : 'Non-Veg';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="conflict-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-[#FFFFFF] rounded-2xl p-6 shadow-2xl border border-[#C2DFD4] overflow-hidden">
        {/* Accent top stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#07543a]" />

        {/* Close button */}
        <button
          onClick={() => handleResolveConflict('cancel')}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#07543a]/10 text-[#07543a] rounded-xl shrink-0 mt-1">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3
              id="conflict-dialog-title"
              className="text-lg font-bold text-[#151815] glinster-font"
            >
              Cart Contains {conflictTypeLabel.charAt(0).toUpperCase() + conflictTypeLabel.slice(1)} Items
            </h3>
            <p className="text-sm text-[#151815]/70 mt-1 leading-relaxed">
              You are switching your menu view to <strong className="text-[#07543a]">{targetLabel}</strong>, but your cart currently has {conflictingCartItems.length} {conflictTypeLabel} item{conflictingCartItems.length > 1 ? 's' : ''}:
            </p>
          </div>
        </div>

        {/* List of conflicting items */}
        <div className="my-4 p-3 bg-[#F4F8F6] rounded-xl border border-[#C2DFD4] max-h-40 overflow-y-auto space-y-2">
          {conflictingCartItems.map((item) => (
            <div
              key={item.cartItemId}
              className="flex items-center justify-between text-xs text-[#151815]"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#0a7350] font-bold">▲</span>
                <span className="font-medium">{item.menuItem.name}</span>
                <span className="text-neutral-400">× {item.quantity}</span>
              </div>
              <span className="font-mono tabular-nums text-neutral-600">
                {currentTenant.currencySymbol}{item.itemTotal.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-neutral-500 mb-5 leading-normal">
          How would you like to handle these items before updating your menu filter?
        </p>

        {/* Action buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => handleResolveConflict('remove_and_continue')}
            className="w-full py-2.5 px-4 bg-[#B42318] hover:bg-[#991B1B] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            Remove items and continue with {targetLabel}
          </button>

          <button
            type="button"
            onClick={() => handleResolveConflict('keep_cart')}
            className="w-full py-2.5 px-4 bg-[#E6F2ED] hover:bg-[#C2DFD4] text-[#0D1914] rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border border-[#07543a]/20 transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-[#07543a]" />
            Keep my cart & filter view
          </button>

          <button
            type="button"
            onClick={() => handleResolveConflict('cancel')}
            className="w-full py-2 px-4 text-xs text-neutral-500 hover:text-neutral-800 font-medium transition-colors"
          >
            Cancel and stay on current filter
          </button>
        </div>
      </div>
    </div>
  );
};
