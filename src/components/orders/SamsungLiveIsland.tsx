import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  ReceiptText,
} from 'lucide-react';
import { Order } from '../../types';

export interface SamsungLiveIslandProps {
  latestOrder?: Order | null;
  hasActiveRequest?: boolean;
  cartCount?: number;
  cartTotal?: number;
  tableNumber?: string;
  currencySymbol?: string;
  onOpenTracking: () => void;
  onOpenServiceModal: () => void;
  onOpenCart?: () => void;
}

/**
 * Animated Culinary Badge for Active Cooking Orders
 * Sizzling pan with wafting steam wisps and ambient emerald glow
 */
const AnimatedCookingBadge: React.FC = () => (
  <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#07543a] to-[#041c14] flex items-center justify-center text-white shrink-0 border border-white/20 overflow-hidden">
    {/* Micro steam curls floating up */}
    <div className="absolute -top-1 left-2 flex items-center gap-0.5 pointer-events-none">
      <span className="w-[1.5px] h-2 bg-white/70 rounded-full animate-steam-1" />
      <span className="w-[2px] h-2.5 bg-white/90 rounded-full animate-steam-2" />
      <span className="w-[1.5px] h-1.5 bg-white/60 rounded-full animate-steam-3" />
    </div>

    {/* Pan icon with subtle sizzle */}
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4 text-white animate-pan-sizzle"
    >
      <path d="M3 11h14a2 2 0 0 1 2 2v1a5 5 0 0 1-5 5H6a5 5 0 0 1-5-5v-1a2 2 0 0 1 2-2z" fill="#07543a" stroke="#ffffff" />
      <path d="M19 12l3-1.5" stroke="#ffffff" strokeWidth="2.5" />
    </svg>
  </div>
);

/**
 * Animated Floor Bell Badge
 * Swinging pendulum chime with expanding acoustic radar pulse
 */
const AnimatedBellBadge: React.FC<{ isAlerted: boolean }> = ({ isAlerted }) => (
  <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#07543a] to-[#041c14] flex items-center justify-center text-white shrink-0 border border-white/20">
    {isAlerted && (
      <span className="absolute inset-0 rounded-xl bg-[#0a7350]/50 animate-radar-wave pointer-events-none" />
    )}
    <Bell
      className={`w-4 h-4 text-white ${
        isAlerted ? 'animate-bell-swing' : 'animate-micro-float'
      }`}
    />
  </div>
);

/**
 * Animated Cart / Item Badge
 */
const AnimatedCartBadge: React.FC<{ count: number }> = ({ count }) => (
  <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#07543a] to-[#0a7350] flex items-center justify-center text-white shrink-0 border border-white/20">
    <span className="font-mono font-black text-xs text-white">
      {count}
    </span>
    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white/90 animate-ping" />
  </div>
);

export const SamsungLiveIsland: React.FC<SamsungLiveIslandProps> = ({
  latestOrder = null,
  hasActiveRequest = false,
  cartCount = 0,
  cartTotal = 0,
  tableNumber = '4',
  currencySymbol = '₹',
  onOpenTracking,
  onOpenServiceModal,
  onOpenCart,
}) => {
  const hasOrder = Boolean(
    latestOrder &&
    latestOrder.status !== 'completed' &&
    latestOrder.status !== 'cancelled'
  );

  // Active view: 'dining_order' or 'floor_waiter'
  const [activeCard, setActiveCard] = useState<'dining_order' | 'floor_waiter'>(
    hasActiveRequest ? 'floor_waiter' : 'dining_order'
  );

  // Sync active view when waiter request state changes
  useEffect(() => {
    if (hasActiveRequest) {
      setActiveCard('floor_waiter');
    }
  }, [hasActiveRequest]);

  // Gestures and isolated scrolling state
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartYRef = useRef<number | null>(null);
  const didSwipeRef = useRef<boolean>(false);
  const lastSwitchTimeRef = useRef<number>(0);
  const [slideDirection, setSlideDirection] = useState<'up' | 'down'>('up');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Switch between dining order and floor waiter views
  const switchView = (direction: 'up' | 'down' = 'up') => {
    const now = Date.now();
    if (now - lastSwitchTimeRef.current < 260) return;
    lastSwitchTimeRef.current = now;

    setSlideDirection(direction);
    setIsTransitioning(true);

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(18);
      } catch {}
    }

    setActiveCard((prev) => (prev === 'dining_order' ? 'floor_waiter' : 'dining_order'));

    setTimeout(() => {
      setIsTransitioning(false);
      didSwipeRef.current = false;
    }, 250);
  };

  // Attach native non-passive wheel and touchmove listeners to ISOLATE scroll to the bar ONLY
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Handle mouse wheel / trackpad scroll over the bar
    const handleNativeWheel = (e: WheelEvent) => {
      // PREVENT the entire webpage/window from scrolling!
      e.preventDefault();
      e.stopPropagation();

      if (Math.abs(e.deltaY) > 5) {
        switchView(e.deltaY > 0 ? 'up' : 'down');
      }
    };

    // Handle touch move over the bar on mobile
    const handleNativeTouchMove = (e: TouchEvent) => {
      if (touchStartYRef.current === null) return;
      // PREVENT mobile browser viewport from scrolling!
      if (e.cancelable) {
        e.preventDefault();
        e.stopPropagation();
      }

      const currentY = e.touches[0].clientY;
      const diff = currentY - touchStartYRef.current;
      if (Math.abs(diff) > 6) {
        didSwipeRef.current = true;
      }
    };

    el.addEventListener('wheel', handleNativeWheel, { passive: false });
    el.addEventListener('touchmove', handleNativeTouchMove, { passive: false });

    return () => {
      el.removeEventListener('wheel', handleNativeWheel);
      el.removeEventListener('touchmove', handleNativeTouchMove);
    };
  }, []);

  // Touch start and end for mobile swipe detection
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
    didSwipeRef.current = false;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartYRef.current !== null && e.changedTouches && e.changedTouches.length > 0) {
      const endY = e.changedTouches[0].clientY;
      const diff = endY - touchStartYRef.current;
      if (Math.abs(diff) > 10) {
        didSwipeRef.current = true;
        switchView(diff < 0 ? 'up' : 'down');
      }
    }
    touchStartYRef.current = null;
    // Release swipe flag after brief buffer to avoid synthetic clicks
    setTimeout(() => {
      didSwipeRef.current = false;
    }, 150);
  };

  // Tap handler (only fires on clean, stationary tap; never on scroll or swipe)
  const handleBarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (didSwipeRef.current || Date.now() - lastSwitchTimeRef.current < 280) {
      return;
    }

    if (activeCard === 'dining_order') {
      if (hasOrder && onOpenTracking) {
        onOpenTracking();
      } else if (onOpenCart) {
        onOpenCart();
      }
    } else {
      onOpenServiceModal();
    }
  };

  // Dynamic cooking timer
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  useEffect(() => {
    if (!latestOrder?.createdAt) {
      setTimerSeconds(60);
      return;
    }

    const calcTime = () => {
      const orderDate = new Date(latestOrder.createdAt).getTime();
      const diffSecs = Math.max(0, Math.floor((Date.now() - orderDate) / 1000));
      const targetPrepSecs = 15 * 60;
      const remaining = Math.max(0, targetPrepSecs - diffSecs);
      setTimerSeconds(remaining > 0 ? remaining : 60);
    };

    calcTime();
    const interval = setInterval(calcTime, 1000);
    return () => clearInterval(interval);
  }, [latestOrder?.createdAt, latestOrder?.status]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const timerText = latestOrder?.status === 'ready'
    ? 'Ready'
    : formatTimer(timerSeconds);

  const displayTotal = hasOrder
    ? latestOrder?.grandTotal || cartTotal
    : cartTotal;

  // Render content inside the single bar
  const renderCardContent = (cardType: 'dining_order' | 'floor_waiter') => {
    if (cardType === 'dining_order') {
      return (
        <div className="w-full flex items-center justify-between gap-3 text-white">
          {/* Left: Animated Badge */}
          {hasOrder ? (
            <AnimatedCookingBadge />
          ) : cartCount > 0 ? (
            <AnimatedCartBadge count={cartCount} />
          ) : (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#07543a] to-[#041c14] flex items-center justify-center text-white shrink-0 border border-white/20">
              <ReceiptText className="w-4 h-4 text-white" />
            </div>
          )}

          {/* Middle: Title & Subtitle */}
          <div className="flex flex-col min-w-0 flex-1 text-left">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-white font-extrabold text-xs sm:text-sm tracking-tight truncate">
                View Dining Order
              </span>
              {hasOrder && (
                <span className="text-[10px] font-mono text-white bg-[#07543a] px-1.5 py-0.2 rounded-full border border-white/20 shrink-0">
                  #{latestOrder?.orderNumber || 'TGT-904'}
                </span>
              )}
            </div>
            <div className="text-[10.5px] sm:text-[11px] text-white/75 font-medium truncate flex items-center gap-1">
              {hasOrder ? (
                <>
                  <span className="text-white font-bold">Dishes Cooking</span>
                  <span>·</span>
                  <span className="font-mono font-bold text-white">{timerText}</span>
                </>
              ) : (
                <>
                  <span>{tableNumber ? `Table ${tableNumber}` : 'Table Session'}</span>
                  <span>·</span>
                  <span>{cartCount} {cartCount === 1 ? 'item' : 'items'} in cart</span>
                </>
              )}
            </div>
          </div>

          {/* Right: Subtotal Amount & View indicator dots */}
          <div className="flex items-center gap-2 shrink-0 pl-1">
            <div className="flex flex-col items-end leading-none">
              <span className="text-[9px] uppercase tracking-wider text-white/60 font-semibold mb-0.5">
                Total
              </span>
              <span className="font-mono tabular-nums text-xs sm:text-sm font-black text-white">
                {currencySymbol}{displayTotal.toFixed(2)}
              </span>
            </div>

            {/* Micro 2-view indicator dots */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                switchView();
              }}
              className="flex flex-col gap-1 px-1 py-1 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
              title="Scroll or tap to switch between Order and Waiter"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
            </div>
          </div>
        </div>
      );
    }

    // Floor Waiter Card
    return (
      <div className="w-full flex items-center justify-between gap-3 text-white">
        {/* Left: Animated Bell Badge */}
        <AnimatedBellBadge isAlerted={hasActiveRequest} />

        {/* Middle: Title & Subtitle */}
        <div className="flex flex-col min-w-0 flex-1 text-left">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-white font-extrabold text-xs sm:text-sm tracking-tight truncate">
              Floor Waiter Paged
            </span>
          </div>
          <div className="text-[10.5px] sm:text-[11px] text-white/75 font-medium truncate flex items-center gap-1">
            {hasActiveRequest ? (
              <span className="text-emerald-300 font-semibold">Staff alerted for Table {tableNumber}</span>
            ) : (
              <span>Tap to request table service</span>
            )}
          </div>
        </div>

        {/* Right: Status Pill & View indicator dots */}
        <div className="flex items-center gap-2 shrink-0 pl-1">
          {hasActiveRequest ? (
            <span className="text-[10px] font-bold text-white bg-[#07543a] px-2.5 py-1 rounded-full border border-white/30 animate-pulse">
              Alerted
            </span>
          ) : (
            <span className="text-[10px] font-bold text-white bg-white/10 hover:bg-[#07543a] px-2.5 py-1 rounded-full border border-white/10 transition-colors">
              Call Server
            </span>
          )}

          {/* Micro 2-view indicator dots */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              switchView();
            }}
            className="flex flex-col gap-1 px-1 py-1 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
            title="Scroll or tap to switch between Order and Waiter"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleBarClick}
      style={{ touchAction: 'none' }}
      className="relative w-full max-w-[340px] sm:max-w-[370px] mx-auto select-none pointer-events-auto touch-none"
    >
      {/* THE SINGLE BAR ONLY - No background layers, no stacked cards behind, no weird shadow */}
      <div className="relative w-full h-14 sm:h-[54px] px-3.5 sm:px-4 rounded-2xl sm:rounded-[22px] bg-[#041c14] hover:bg-[#06241a] border border-[#07543a]/75 shadow-md shadow-black/25 flex items-center justify-between cursor-pointer transition-colors duration-200 overflow-hidden">
        {/* Animated view container */}
        <div
          key={activeCard}
          className={`w-full flex items-center justify-between ${
            isTransitioning
              ? slideDirection === 'up'
                ? 'animate-in slide-in-from-bottom-3 fade-in duration-200'
                : 'animate-in slide-in-from-top-3 fade-in duration-200'
              : 'animate-in fade-in duration-150'
          }`}
        >
          {renderCardContent(activeCard)}
        </div>
      </div>
    </div>
  );
};
