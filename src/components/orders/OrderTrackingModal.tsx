import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle,
  Clock,
  UtensilsCrossed,
  BellRing,
  Sparkles,
  Flame,
  ChefHat,
  Radio,
  PartyPopper,
} from 'lucide-react';
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

const STEPS: {
  status: OrderStatus;
  label: string;
  station: string;
  description: string;
  icon: typeof Flame;
}[] = [
  {
    status: 'pending',
    label: 'Order Transmitted',
    station: 'POS & Kitchen Terminal',
    description: 'Received by kitchen brigade & queued',
    icon: Radio,
  },
  {
    status: 'preparing',
    label: 'Chef Sauté & Fire Sear',
    station: 'Hearth & Sauté Station #2',
    description: 'Ingredients tossed & freshly cooked',
    icon: Flame,
  },
  {
    status: 'ready',
    label: 'Plated at the Pass',
    station: 'Chef Garnish Counter',
    description: 'Quality inspected & ready for service',
    icon: ChefHat,
  },
  {
    status: 'completed',
    label: 'Served & Enjoyed',
    station: 'Guest Dining Table',
    description: 'Dishes delivered to your table session',
    icon: PartyPopper,
  },
];

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  order: initialOrder,
  onClose,
  onRequestAssistance,
}) => {
  const { currentTenant, orders } = useRestaurant();
  const [order, setOrder] = useState<Order | null>(initialOrder);

  // Elapsed cooking timer ticker
  const [elapsedMinutes, setElapsedMinutes] = useState(2);

  // Sync with prop and context updates
  useEffect(() => {
    if (initialOrder) {
      const liveInContext = orders.find((o) => o.id === initialOrder.id);
      setOrder(liveInContext || initialOrder);
    }
  }, [initialOrder, orders]);

  // Elapsed time calculation
  useEffect(() => {
    if (!order?.createdAt) return;
    const calc = () => {
      const diffMs = Date.now() - new Date(order.createdAt).getTime();
      const mins = Math.max(1, Math.floor(diffMs / 60000));
      setElapsedMinutes(mins);
    };
    calc();
    const timer = setInterval(calc, 30000);
    return () => clearInterval(timer);
  }, [order?.createdAt]);

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

    // 2. Direct order doc fallback
    const directDocRef = doc(db, 'orders', initialOrder.id);
    const unsubscribeDirect = onSnapshot(
      directDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const cloudOrder = { id: docSnapshot.id, ...docSnapshot.data() } as Order;
          setOrder(cloudOrder);
          if (cloudOrder.status === 'ready' && navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
        }
      },
      () => {}
    );

    return () => {
      unsubscribeSync();
      unsubscribeDirect();
    };
  }, [isOpen, initialOrder]);

  if (!isOpen || !order) return null;

  const currentStepIndex = STEPS.findIndex((s) => s.status === order.status);
  const isCancelled = order.status === 'cancelled';

  // Render animated SVG culinary hero based on active status
  const renderCulinaryAnimationHero = () => {
    if (isCancelled) return null;

    if (order.status === 'preparing') {
      return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#041c14] via-[#08281d] to-[#041c14] p-5 text-white border border-[#07543a]/40 shadow-xl">
          {/* Ambient Kitchen Backlight Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#07543a]/25 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col items-center text-center space-y-3">
            {/* Animated Sauté Skillet / Cooking Stage */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Rising Steam Curls */}
              <div className="absolute -top-3 left-7 flex items-center gap-2 pointer-events-none">
                <span className="w-1.5 h-6 bg-white/70 rounded-full blur-[1px] animate-steam-1" />
                <span className="w-2 h-8 bg-white/60 rounded-full blur-[1px] animate-steam-2" />
                <span className="w-1.5 h-5 bg-white/70 rounded-full blur-[1px] animate-steam-3" />
              </div>

              {/* Sauté Pan SVG with Tossing Ingredients */}
              <svg
                viewBox="0 0 100 100"
                className="w-24 h-24 drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Pan Body */}
                <ellipse cx="50" cy="62" rx="36" ry="12" fill="#06241a" stroke="#0a4631" strokeWidth="2.5" />
                <path
                  d="M14 62C14 74 30 80 50 80C70 80 86 74 86 62"
                  fill="#03160f"
                  stroke="#083827"
                  strokeWidth="2.5"
                />

                {/* Sizzling Dish Interior */}
                <ellipse cx="50" cy="61" rx="30" ry="8" fill="#053d2a" />
                <ellipse cx="50" cy="60" rx="26" ry="6" fill="#07543a" />

                {/* Tossing Ingredients / Veggies / Garnish */}
                <circle cx="42" cy="59" r="2.5" fill="#E6F2ED" className="animate-bounce" />
                <circle cx="56" cy="58" r="2" fill="#0a7350" className="animate-pulse" />
                <circle cx="49" cy="55" r="2.2" fill="#FFFFFF" className="animate-bounce" />
                <circle cx="62" cy="60" r="1.8" fill="#E6F2ED" className="animate-pulse" />

                {/* Long Handle */}
                <path
                  d="M86 62L98 56"
                  stroke="#5E8373"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Dancing Flames Underneath */}
                <g className="animate-flame origin-bottom">
                  <path
                    d="M36 82C36 78 40 76 43 73C44 76 46 75 48 72C50 75 52 76 54 73C56 76 60 77 64 82Z"
                    fill="url(#fireGrad)"
                  />
                </g>

                <defs>
                  <linearGradient id="fireGrad" x1="50" y1="72" x2="50" y2="82" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFFFFF" />
                    <stop offset="0.5" stopColor="#0a7350" />
                    <stop offset="1" stopColor="#07543a" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Sparkle particles floating around */}
              <Sparkles className="w-4 h-4 text-white absolute top-1 right-2 animate-ping" />
            </div>

            {/* Live Prep Status Pill */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#07543a] animate-ping" />
                <span>Station: Hearth & Sauté #2</span>
                <span className="opacity-40">·</span>
                <span className="font-mono text-white">~{elapsedMinutes}m elapsed</span>
              </div>

              <h3 className="text-base font-extrabold text-white mt-1.5 tracking-tight font-heading glinster-font">
                Chef is Searing & Plating Fresh Dishes
              </h3>
              <p className="text-xs text-white/75 max-w-xs mx-auto mt-0.5">
                Cooked to order with farm-fresh herbs and fire-roasted spices.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (order.status === 'ready') {
      return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#041c14] via-[#08281d] to-[#041c14] p-5 text-white border border-white/40 shadow-xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#07543a]/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col items-center text-center space-y-3">
            {/* Animated Silver & Forest Cloche Dome */}
            <div className="relative w-28 h-24 flex items-center justify-center">
              <svg
                viewBox="0 0 100 80"
                className="w-24 h-20 drop-shadow-[0_12px_24px_rgba(7,84,58,0.5)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Cloche Base Tray */}
                <rect x="10" y="58" width="80" height="6" rx="3" fill="#FFFFFF" />
                <path d="M15 64H85" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />

                {/* Cloche Lifting Dome */}
                <g className="animate-bounce origin-top">
                  <path
                    d="M18 56C18 36 32 24 50 24C68 24 82 36 82 56Z"
                    fill="url(#clocheGrad)"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                  {/* Top Handle Knob */}
                  <circle cx="50" cy="20" r="4.5" fill="#FFFFFF" stroke="#E6F2ED" strokeWidth="1.5" />
                  {/* Sheen highlight */}
                  <path
                    d="M30 46C30 38 38 32 46 30"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="opacity-70"
                  />
                </g>

                <defs>
                  <linearGradient id="clocheGrad" x1="18" y1="24" x2="82" y2="56" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFFFFF" />
                    <stop offset="0.4" stopColor="#E6F2ED" />
                    <stop offset="1" stopColor="#07543a" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Sparkle halo */}
              <Sparkles className="w-5 h-5 text-white absolute -top-1 right-2 animate-spin" />
              <Sparkles className="w-4 h-4 text-[#07543a] absolute bottom-3 left-2 animate-ping" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#07543a]/50 border border-white/50 text-xs font-black text-white shadow-xs">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
                <span>Plated & Ready to Serve!</span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-1.5 tracking-tight font-heading glinster-font">
                Dishes at the Pass · Table Delivery
              </h3>
              <p className="text-xs text-white/75 max-w-xs mx-auto mt-0.5">
                Your waiter is bringing the fresh order directly to {order.tableNumber}.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (order.status === 'completed') {
      return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#041c14] to-[#08281d] p-5 text-white border border-[#07543a]/40 shadow-md text-center">
          <div className="w-12 h-12 rounded-full bg-[#07543a] text-white mx-auto flex items-center justify-center mb-2 shadow-inner border border-white/20">
            <PartyPopper className="w-6 h-6 animate-bounce" />
          </div>
          <h3 className="text-base font-bold text-white font-heading glinster-font">
            Dishes Served at Your Table
          </h3>
          <p className="text-xs text-white/75 mt-0.5">
            Bon appétit! If you need anything else, call your floor waiter with one tap.
          </p>
        </div>
      );
    }

    // Default: pending
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#041c14] via-[#08281d] to-[#041c14] p-5 text-white border border-white/10 shadow-md">
        <div className="relative flex flex-col items-center text-center space-y-2.5">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-[#07543a]/40 animate-radar-wave" />
            <div className="w-12 h-12 rounded-2xl bg-[#07543a] border border-white/40 flex items-center justify-center text-white shadow-md">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/10 text-xs font-semibold text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-[#07543a] animate-ping" />
              <span>Transmitted to Chef Queue</span>
            </div>
            <h3 className="text-base font-bold text-white mt-1 tracking-tight font-heading glinster-font">
              Order Received by Kitchen Brigade
            </h3>
            <p className="text-xs text-white/75 max-w-xs mx-auto mt-0.5">
              Chef is reviewing preparation tickets for {order.tableNumber}.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-tracking-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#F4F8F6] rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-[#07543a]/20 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-neutral-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#07543a] text-white flex items-center justify-center shadow-md shrink-0 border border-white/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-[#07543a] bg-[#E6F2ED] px-2.5 py-0.5 rounded-lg border border-[#C2DFD4]">
                  #{order.orderNumber}
                </span>
                <span className="text-xs text-neutral-300">·</span>
                <span className="text-xs font-bold text-neutral-700">
                  {order.tableNumber}
                </span>
              </div>
              <h2 id="order-tracking-title" className="text-base sm:text-lg font-black text-[#0D1914] glinster-font mt-0.5 leading-tight">
                Live Kitchen Radar
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Close tracking"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Progress & Breakdown */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-5 flex-1">
          {/* Animated Hero Showcase */}
          {renderCulinaryAnimationHero()}

          {/* Stepper Timeline */}
          {isCancelled ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center">
              <span className="text-sm font-bold text-red-700">Order Cancelled</span>
              <p className="text-xs text-red-600 mt-1">Please speak to your server.</p>
            </div>
          ) : (
            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Culinary Pipeline Milestones
              </h4>

              <div className="space-y-4">
                {STEPS.map((step, idx) => {
                  const isDone = currentStepIndex > idx;
                  const isCurrent = currentStepIndex === idx;
                  const StepIcon = step.icon;

                  return (
                    <div key={step.status} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-2xl flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-xs ${
                            isDone
                              ? 'bg-[#07543a] text-white'
                              : isCurrent
                              ? 'bg-[#0a7350] text-white shadow-md shadow-[#07543a]/40 scale-105 ring-2 ring-[#E6F2ED]'
                              : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : isCurrent ? (
                            <StepIcon className="w-4 h-4 animate-bounce" />
                          ) : (
                            <StepIcon className="w-3.5 h-3.5 opacity-60" />
                          )}
                        </div>

                        {idx < STEPS.length - 1 && (
                          <div
                            className={`w-0.5 h-7 mt-1 transition-colors ${
                              isDone ? 'bg-[#07543a]' : 'bg-neutral-200'
                            }`}
                          />
                        )}
                      </div>

                      <div className="pt-0.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4
                            className={`text-xs font-extrabold leading-tight ${
                              isCurrent
                                ? 'text-[#07543a]'
                                : isDone
                                ? 'text-[#0D1914]'
                                : 'text-neutral-400'
                            }`}
                          >
                            {step.label}
                          </h4>
                          {isCurrent && (
                            <span className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E6F2ED] text-[#07543a] border border-[#C2DFD4]">
                              Live Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          {step.description}
                        </p>
                        <span className="text-[10px] text-neutral-400 font-medium block mt-0.5">
                          {step.station}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dish items summary */}
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-neutral-200/80 space-y-3 shadow-2xs">
            <h3 className="text-xs font-bold text-[#0D1914] flex items-center justify-between uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <UtensilsCrossed className="w-3.5 h-3.5 text-[#07543a]" />
                Dishes in Order ({order.items.length})
              </span>
              <span className="text-[11px] font-mono text-[#07543a] font-bold bg-[#E6F2ED] px-2 py-0.5 rounded-md border border-[#C2DFD4]">
                Table {order.tableNumber}
              </span>
            </h3>

            <div className="space-y-2 divide-y divide-neutral-100">
              {order.items.map((it) => (
                <div key={it.id} className="pt-2 first:pt-0 flex justify-between items-start text-xs">
                  <div>
                    <div className="font-bold text-[#0D1914] flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-[#E6F2ED] text-[#07543a] font-mono font-bold flex items-center justify-center text-[10px] border border-[#C2DFD4]">
                        {it.quantity}×
                      </span>
                      <span>{it.itemName}</span>
                    </div>
                    {it.variantName && (
                      <div className="text-[11px] text-[#07543a] font-medium pl-6">
                        {it.variantName}
                      </div>
                    )}
                    {it.addons && it.addons.length > 0 && (
                      <div className="text-[10.5px] text-neutral-400 pl-6">
                        +{it.addons.map((a) => a.name).join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="font-mono tabular-nums font-bold text-neutral-800">
                    {currentTenant.currencySymbol}{it.totalPrice.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Summary */}
            <div className="pt-3 border-t border-neutral-200 space-y-1.5 text-xs">
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
              <div className="flex justify-between font-black text-sm text-[#0D1914] pt-1.5 border-t border-neutral-100">
                <span>Total Amount</span>
                <span className="font-mono tabular-nums text-[#07543a]">
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
            className="flex-1 py-2.5 px-4 rounded-2xl bg-[#E6F2ED] hover:bg-[#C2DFD4] text-[#07543a] border border-[#C2DFD4] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <BellRing className="w-3.5 h-3.5 text-[#07543a]" />
            Request Waiter / Bill
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 rounded-2xl bg-[#07543a] hover:bg-[#053d2a] text-white text-xs font-bold transition-all shadow-md shadow-[#07543a]/25 cursor-pointer active:scale-95"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};
