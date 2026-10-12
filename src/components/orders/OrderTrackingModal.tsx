import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, UtensilsCrossed, BellRing } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order, OrderStatus } from '../../types';
import { useRestaurant } from '../../context/RestaurantContext';

interface OrderTrackingModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onRequestAssistance: () => void;
}

const STEPS: { status: OrderStatus; label: string; description: string }[] = [
  { status: 'pending', label: 'Order Received', description: 'Transmitted to kitchen' },
  { status: 'preparing', label: 'Chef Preparing', description: 'Freshly cooking on stove & grill' },
  { status: 'ready', label: 'Ready to Serve', description: 'Plated at the pass counter' },
  { status: 'completed', label: 'Served & Enjoyed', description: 'Dishes served at your table' },
];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  order: initialOrder,
  onClose,
  onRequestAssistance,
}) => {
  const { currentTenant, orders } = useRestaurant();
  const [order, setOrder] = useState<Order | null>(initialOrder);

  // Sync with prop and context updates
  useEffect(() => {
    if (initialOrder) {
      const liveInContext = orders.find((o) => o.id === initialOrder.id);
      setOrder(liveInContext || initialOrder);
    }
  }, [initialOrder, orders]);

  // Subscribe to real-time Firestore updates
  useEffect(() => {
    if (!isOpen || !initialOrder) return;

    // 1. Listen to authenticated cloud sync document
    const syncDocRef = doc(db, 'users', 'i0alTisWGMftEEgqEy4ij4Ozh1I2');
    const unsubscribeSync = onSnapshot(
      syncDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          if (data?.ordersJson) {
            try {
              const cloudOrders: Order[] = JSON.parse(data.ordersJson);
              const found = cloudOrders.find((o) => o.id === initialOrder.id);
              if (found) {
                setOrder(found);
                if (found.status === 'ready' && navigator.vibrate) {
                  navigator.vibrate([200, 100, 200]);
                }
              }
            } catch {}
          }
        }
      },
      () => {}
    );

    // 2. Listen to top-level 'restaurant_orders'
    const topOrderRef = doc(db, 'restaurant_orders', initialOrder.id);
    const unsubscribeTop = onSnapshot(
      topOrderRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as Order;
          setOrder(data);
          if (data.status === 'ready' && navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
        }
      },
      (error) => {
        console.warn('Firestore real-time tracking note:', error);
      }
    );

    return () => {
      unsubscribeSync();
      unsubscribeTop();
    };
  }, [isOpen, initialOrder, currentTenant.id]);

  // Listen for Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const currentStepIndex = STEPS.findIndex((s) => s.status === order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-tracking-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#F4F9FD] rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-[#2C5EAD]/15"
      >
        
        {/* Header */}
        <div className="p-5 bg-white border-b border-neutral-200/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#2C5EAD] bg-[#2C5EAD]/10 px-2 py-0.5 rounded-md">
                {order.orderNumber}
              </span>
              <span className="text-xs text-neutral-400">·</span>
              <span className="text-xs font-semibold text-neutral-700">
                {order.tableNumber}
              </span>
            </div>
            <h2 id="order-tracking-title" className="text-base font-bold text-[#1E231F] glinster-font mt-0.5">
              Live Kitchen Progress
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
            aria-label="Close tracking"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Progress & Breakdown */}
        <div className="overflow-y-auto p-5 space-y-6 flex-1">
          {/* Status Stepper */}
          {isCancelled ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
              <span className="text-sm font-bold text-red-700">Order Cancelled</span>
              <p className="text-xs text-red-600 mt-1">Please speak to your server.</p>
            </div>
          ) : (
            <div className="p-4 bg-white rounded-xl border border-neutral-200/80 shadow-2xs">
              <div className="space-y-4">
                {STEPS.map((step, idx) => {
                  const isDone = currentStepIndex > idx;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div key={step.status} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                            isDone
                              ? 'bg-[#2C5EAD] text-white'
                              : isCurrent
                              ? 'bg-[#1591DC] text-white animate-pulse'
                              : 'bg-neutral-200 text-neutral-500'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : isCurrent ? (
                            <Clock className="w-4 h-4" />
                          ) : (
                            idx + 1
                          )}
                        </div>
                        {idx < STEPS.length - 1 && (
                          <div
                            className={`w-0.5 h-6 mt-1 ${
                              isDone ? 'bg-[#2C5EAD]' : 'bg-neutral-200'
                            }`}
                          />
                        )}
                      </div>

                      <div className="pt-0.5">
                        <h4
                          className={`text-xs font-bold leading-tight ${
                            isCurrent
                              ? 'text-[#1591DC]'
                              : isDone
                              ? 'text-[#2C5EAD]'
                              : 'text-neutral-400'
                          }`}
                        >
                          {step.label}
                        </h4>
                        <p className="text-[11px] text-neutral-500">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dish items summary */}
          <div className="p-4 bg-white rounded-xl border border-neutral-200/80 space-y-3">
            <h3 className="text-xs font-bold text-[#1E231F] flex items-center gap-1.5 uppercase tracking-wider">
              <UtensilsCrossed className="w-3.5 h-3.5 text-[#2C5EAD]" />
              Items Ordered
            </h3>

            <div className="space-y-2 divide-y divide-neutral-100">
              {order.items.map((it) => (
                <div key={it.id} className="pt-2 first:pt-0 flex justify-between items-start text-xs">
                  <div>
                    <div className="font-semibold text-[#1E231F]">
                      {it.quantity}× {it.itemName}
                    </div>
                    {it.variantName && (
                      <div className="text-[11px] text-[#2C5EAD]">
                        {it.variantName}
                      </div>
                    )}
                    {it.addons.length > 0 && (
                      <div className="text-[11px] text-neutral-400">
                        +{it.addons.map((a) => a.name).join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="font-mono tabular-nums font-medium text-neutral-700">
                    {currentTenant.currencySymbol}{it.totalPrice.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Summary */}
            <div className="pt-3 border-t border-neutral-200 space-y-1 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums">
                  {currentTenant.currencySymbol}{order.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Tax & Service Charge</span>
                <span className="font-mono tabular-nums">
                  {currentTenant.currencySymbol}{(order.taxAmount + order.serviceChargeAmount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#1E231F] pt-1 border-t border-neutral-100">
                <span>Total Amount</span>
                <span className="font-mono tabular-nums text-[#2C5EAD]">
                  {currentTenant.currencySymbol}{order.grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-white border-t border-neutral-200/80 flex items-center gap-3">
          <button
            type="button"
            onClick={onRequestAssistance}
            className="flex-1 py-2.5 px-4 rounded-full bg-[#F4F9FD] hover:bg-[#C4E2F5]/50 text-[#1E231F] border border-neutral-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <BellRing className="w-3.5 h-3.5 text-[#1591DC]" />
            Request Waiter / Bill
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 rounded-full bg-[#2C5EAD] hover:bg-[#1D4482] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};
