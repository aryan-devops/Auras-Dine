import React, { useState } from 'react';
import { X, Plus, Minus, Check } from 'lucide-react';
import { MenuItem, MenuItemVariant, MenuItemAddon } from '../../types';
import { useRestaurant } from '../../context/RestaurantContext';
import { FoodIllustration } from './FoodIllustration';

interface ItemCustomizeModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export const ItemCustomizeModal: React.FC<ItemCustomizeModalProps> = ({
  item,
  onClose,
}) => {
  const { currentTenant, addToCart, setIsCartDrawerOpen } = useRestaurant();

  if (!item) return null;

  // Selected variant
  const [selectedVariant, setSelectedVariant] = useState<MenuItemVariant | undefined>(
    item.variants && item.variants.length > 0 ? item.variants[0] : undefined
  );

  // Selected add-ons
  const [selectedAddons, setSelectedAddons] = useState<MenuItemAddon[]>([]);

  // Quantity
  const [quantity, setQuantity] = useState<number>(1);

  // Special instructions
  const [instructions, setInstructions] = useState<string>('');

  const toggleAddon = (addon: MenuItemAddon) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const variantPriceDelta = selectedVariant ? selectedVariant.priceDelta : 0;
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const unitPrice = item.basePrice + variantPriceDelta + addonsTotal;
  const calculatedTotal = unitPrice * quantity;

  const handleConfirm = () => {
    addToCart(item, selectedVariant, selectedAddons, quantity, instructions);
    onClose();
    setIsCartDrawerOpen(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="customize-dish-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-[#FAF8F2] rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-[#30673A]/15">
        
        {/* Header with image */}
        <div className="relative p-6 pb-4 bg-white border-b border-neutral-200/70">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex gap-4 items-center">
            <FoodIllustration
              itemId={item.id}
              name={item.name}
              foodType={item.foodType}
              className="w-20 h-20 shrink-0"
            />
            <div className="pr-8">
              <span className="text-[11px] font-bold tracking-wider uppercase text-[#30673A]">
                Customizable Creation
              </span>
              <h2
                id="customize-dish-title"
                className="text-lg font-bold text-[#1E231F] glinster-font line-clamp-1"
              >
                {item.name}
              </h2>
              <div className="text-sm font-semibold text-[#E3792F] tabular-nums mt-0.5">
                {currentTenant.currencySymbol}{unitPrice.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable configuration body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Variants selection */}
          {item.variants && item.variants.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-sm font-bold text-[#1E231F]">Select Portion / Size</h3>
                <span className="text-xs text-[#E3792F] font-medium">Required</span>
              </div>
              <div className="space-y-2">
                {item.variants.map((v) => {
                  const isChecked = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                        isChecked
                          ? 'border-[#30673A] bg-[#30673A]/5 shadow-xs'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isChecked
                              ? 'border-[#30673A] bg-[#30673A]'
                              : 'border-neutral-300'
                          }`}
                        >
                          {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="text-sm font-medium text-[#1E231F]">{v.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-neutral-600 tabular-nums">
                        {v.priceDelta > 0
                          ? `+${currentTenant.currencySymbol}${v.priceDelta.toFixed(2)}`
                          : 'Included'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-ons selection */}
          {item.addons && item.addons.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-sm font-bold text-[#1E231F]">Artisanal Add-ons</h3>
                <span className="text-xs text-neutral-400">Optional</span>
              </div>
              <div className="space-y-2">
                {item.addons.map((a) => {
                  const isChecked = selectedAddons.some((addon) => addon.id === a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleAddon(a)}
                      className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                        isChecked
                          ? 'border-[#30673A] bg-[#30673A]/5 shadow-xs'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            isChecked
                              ? 'border-[#30673A] bg-[#30673A] text-white'
                              : 'border-neutral-300'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-sm font-medium text-[#1E231F]">{a.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-[#E3792F] tabular-nums">
                        +{currentTenant.currencySymbol}{a.price.toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Cooking Instructions */}
          <div>
            <label
              htmlFor="special-instructions"
              className="block text-sm font-bold text-[#1E231F] mb-1.5"
            >
              Chef Instructions & Allergies
            </label>
            <textarea
              id="special-instructions"
              rows={2}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Mild spice, dressing on the side, no onions..."
              className="w-full p-3 text-sm rounded-xl bg-white border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#30673A]/50 focus:border-[#30673A] resize-none"
            />
          </div>
        </div>

        {/* Footer sticky CTA */}
        <div className="p-4 sm:p-5 bg-white border-t border-neutral-200/80 flex items-center justify-between gap-4">
          {/* Quantity selector */}
          <div className="flex items-center gap-2 p-1 bg-[#FAF8F2] border border-neutral-200 rounded-full">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-600 hover:bg-white disabled:opacity-30 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center text-sm font-bold tabular-nums text-[#1E231F]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-600 hover:bg-white transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 px-5 rounded-full bg-[#30673A] hover:bg-[#204828] text-white font-semibold text-sm flex items-center justify-between shadow-md transition-all active:scale-[0.98]"
          >
            <span>Add to Order</span>
            <span className="font-mono tabular-nums font-bold">
              {currentTenant.currencySymbol}{calculatedTotal.toFixed(2)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
