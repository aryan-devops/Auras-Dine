import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, Utensils, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRestaurant } from '../../context/RestaurantContext';

interface CartDrawerProps {
  onTrackOrder?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onTrackOrder }) => {
  const {
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    cart,
    cartCount,
    cartSubtotal,
    cartTax,
    cartServiceCharge,
    cartTotal,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    currentTenant,
    currentTable,
    createOrder,
  } = useRestaurant();

  const [customerName, setCustomerName] = useState('');
  const [tableNotes, setTableNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  if (!isCartDrawerOpen) return null;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const order = await createOrder(
        customerName.trim() || 'Guest Diner',
        tableNotes.trim() || undefined
      );

      // Trigger celebratory confetti
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#30673A', '#E3792F', '#E9E9C7'],
      });

      setOrderSuccess(order.orderNumber);
    } catch {
      // Order submission handled
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCartDrawerOpen(false);
    setOrderSuccess(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-[#FAF8F2] h-full flex flex-col shadow-2xl overflow-hidden border-l border-[#30673A]/15 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-5 bg-white border-b border-neutral-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#30673A]/10 text-[#30673A] flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h2 id="cart-drawer-title" className="text-base font-bold text-[#1E231F] glinster-font">
                Your Table Order
              </h2>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span className="font-semibold text-[#30673A]">
                  {currentTable?.tableNumber || 'Table Session'}
                </span>
                <span aria-hidden="true">·</span>
                <span>{currentTenant.name}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {orderSuccess ? (
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center bg-white">
            <div className="w-16 h-16 rounded-full bg-[#30673A]/10 text-[#30673A] flex items-center justify-center mb-4 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-[#1E231F] glinster-font mb-2">
              Order Sent to Kitchen!
            </h3>
            <p className="text-sm text-neutral-600 mb-2">
              Your ticket <span className="font-mono font-bold text-[#30673A]">{orderSuccess}</span> has been broadcast directly to the kitchen display.
            </p>
            <p className="text-xs text-neutral-400 mb-6">
              The chefs are preparing your dishes fresh. You can track preparation status live.
            </p>
            <button
              onClick={() => {
                handleClose();
                onTrackOrder?.();
              }}
              className="w-full py-3 px-6 rounded-full bg-[#30673A] hover:bg-[#204828] text-white font-semibold text-sm transition-colors shadow-sm"
            >
              Track Order Live
            </button>
          </div>
        ) : cart.length === 0 ? (
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-[#E9E9C7]/50 text-[#30673A] flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#1E231F] glinster-font mb-1">
              Your cart is waiting
            </h3>
            <p className="text-xs text-neutral-500 max-w-xs mb-6">
              Browse our chef-crafted menu and add dishes to start your dining journey.
            </p>
            <button
              onClick={handleClose}
              className="py-2.5 px-5 rounded-full bg-[#30673A] text-white text-xs font-semibold hover:bg-[#204828] transition-colors"
            >
              Explore Menu
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Cart item rows */}
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.cartItemId}
                  className="p-3.5 bg-white rounded-xl border border-neutral-200/80 shadow-2xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-bold ${
                            item.menuItem.foodType === 'veg' || item.menuItem.foodType === 'vegan'
                              ? 'text-[#30673A]'
                              : 'text-[#E3792F]'
                          }`}
                        >
                          {item.menuItem.foodType === 'veg' ? '●' : item.menuItem.foodType === 'vegan' ? '🌱' : '▲'}
                        </span>
                        <h4 className="text-sm font-bold text-[#1E231F] leading-tight">
                          {item.menuItem.name}
                        </h4>
                      </div>

                      {/* Variant name */}
                      {item.selectedVariant && (
                        <div className="text-xs text-[#30673A] font-medium">
                          Portion: {item.selectedVariant.name}
                        </div>
                      )}

                      {/* Addons */}
                      {item.selectedAddons.length > 0 && (
                        <div className="text-[11px] text-neutral-500">
                          + {item.selectedAddons.map((a) => a.name).join(', ')}
                        </div>
                      )}

                      {/* Special instructions */}
                      {item.specialInstructions && (
                        <div className="text-[11px] text-neutral-400 italic">
                          Note: &quot;{item.specialInstructions}&quot;
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="text-neutral-400 hover:text-[#B42318] p-1 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quantity and Price */}
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                    <span className="text-xs font-mono tabular-nums font-bold text-[#1E231F]">
                      {currentTenant.currencySymbol}{item.itemTotal.toFixed(2)}
                    </span>

                    <div className="flex items-center gap-2 bg-[#FAF8F2] border border-neutral-200 rounded-full px-1.5 py-0.5">
                      <button
                        onClick={() => updateCartQuantity(item.cartItemId, -1)}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-neutral-600 hover:bg-white"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold tabular-nums w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.cartItemId, 1)}
                        className="w-5 h-5 rounded-full flex items-center justify-center text-neutral-600 hover:bg-white"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Clear Cart link */}
            <div className="text-right">
              <button
                type="button"
                onClick={clearCart}
                className="text-[11px] text-neutral-400 hover:text-neutral-700 underline"
              >
                Clear all items
              </button>
            </div>

            {/* Guest Info & Table Notes */}
            <div className="p-3.5 bg-white rounded-xl border border-neutral-200/80 space-y-2.5">
              <div>
                <label className="block text-xs font-bold text-[#1E231F] mb-1">
                  Guest Name (Optional)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-200 bg-[#FAF8F2] focus:outline-none focus:ring-1 focus:ring-[#30673A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E231F] mb-1">
                  Table Dining Notes
                </label>
                <input
                  type="text"
                  value={tableNotes}
                  onChange={(e) => setTableNotes(e.target.value)}
                  placeholder="e.g. Bring drinks first, anniversary dinner"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-neutral-200 bg-[#FAF8F2] focus:outline-none focus:ring-1 focus:ring-[#30673A]"
                />
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 bg-white rounded-xl border border-neutral-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal ({cartCount} items)</span>
                <span className="font-mono tabular-nums">
                  {currentTenant.currencySymbol}{cartSubtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Taxes ({currentTenant.taxRatePercent}%)</span>
                <span className="font-mono tabular-nums">
                  {currentTenant.currencySymbol}{cartTax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Service Fee ({currentTenant.serviceChargePercent}%)</span>
                <span className="font-mono tabular-nums">
                  {currentTenant.currencySymbol}{cartServiceCharge.toFixed(2)}
                </span>
              </div>
              <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-sm text-[#1E231F]">
                <span>Grand Total</span>
                <span className="font-mono tabular-nums text-base text-[#30673A]">
                  {currentTenant.currencySymbol}{cartTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer sticky action */}
        {!orderSuccess && cart.length > 0 && (
          <div className="p-4 bg-white border-t border-neutral-200/80">
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-full bg-[#30673A] hover:bg-[#204828] text-white font-bold text-sm flex items-center justify-between shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <span>{isSubmitting ? 'Transmitting to Kitchen...' : 'Send Order to Kitchen'}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono tabular-nums">
                  {currentTenant.currencySymbol}{cartTotal.toFixed(2)}
                </span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
            <p className="text-[10px] text-center text-neutral-400 mt-2">
              Payment is settled tableside with your server upon completion.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
