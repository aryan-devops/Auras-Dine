import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  ChevronUp,
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

  // Active stack card: 'dining_order' or 'floor_waiter'
  const [activeCard, setActiveCard] = useState<'dining_order' | 'floor_waiter'>(
    hasActiveRequest ? 'floor_waiter' : 'dining_order'
  );
  const backCard = activeCard === 'dining_order' ? 'floor_waiter' : 'dining_order';

  // Align active card when request state changes
  useEffect(() => {
    if (hasActiveRequest) {
      setActiveCard('floor_waiter');
    }
  }, [hasActiveRequest]);

  // Touch & Swipe gesture state
  const [dragY, setDragY] = useState<number>(0);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartYRef = useRef<number | null>(null);
  const didSwipeRef = useRef<boolean>(false);
  const lastActionTimeRef = useRef<number>(0);
  const lastWheelTimeRef = useRef<number>(0);

  // Attach native non-passive touchmove listener to completely prevent mobile page scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onNativeTouchMove = (e: TouchEvent) => {
      // Prevent browser viewport from scrolling when interacting with island
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    el.addEventListener('touchmove', onNativeTouchMove, { passive: false });
    return () => {
      el.removeEventListener('touchmove', onNativeTouchMove);
    };
  }, []);

  // Trigger smooth card flip animation
  const triggerFlip = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    lastActionTimeRef.current = Date.now();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([15, 30]);
      } catch {}
    }
    setTimeout(() => {
      setActiveCard((prev) => (prev === 'dining_order' ? 'floor_waiter' : 'dining_order'));
      setDragY(0);
      setIsFlipping(false);
      // Keep a small buffer before re-enabling click
      setTimeout(() => {
        didSwipeRef.current = false;
      }, 100);
    }, 280);
  };

  // Wheel / Scroll Gesture Handler (cycles stack when scrolled up or down)
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTimeRef.current < 350) return;
    if (Math.abs(e.deltaY) > 8) {
      lastWheelTimeRef.current = now;
      triggerFlip();
    }
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isFlipping) return;
    touchStartYRef.current = e.touches[0].clientY;
    didSwipeRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null || isFlipping) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartYRef.current;
    if (Math.abs(diff) > 5) {
      didSwipeRef.current = true;
    }
    // Track upward swipe (negative) or downward movement
    setDragY(Math.max(-45, Math.min(25, diff)));
  };

  const handleTouchEnd = () => {
    if (isFlipping || touchStartYRef.current === null) {
      touchStartYRef.current = null;
      setDragY(0);
      return;
    }

    if (dragY < -12 || dragY > 14) {
      // Swiped up or down -> Flip the card!
      didSwipeRef.current = true;
      triggerFlip();
    } else {
      setDragY(0);
      setTimeout(() => {
        didSwipeRef.current = false;
      }, 50);
    }
    touchStartYRef.current = null;
  };

  // Mouse drag handlers for desktop swipe testing
  const [isMouseDown, setIsMouseDown] = useState(false);
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isFlipping) return;
    touchStartYRef.current = e.clientY;
    setIsMouseDown(true);
    didSwipeRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || touchStartYRef.current === null || isFlipping) return;
    const diff = e.clientY - touchStartYRef.current;
    if (Math.abs(diff) > 5) {
      didSwipeRef.current = true;
    }
    setDragY(Math.max(-45, Math.min(25, diff)));
  };

  const handleMouseUp = () => {
    if (!isMouseDown) return;
    setIsMouseDown(false);
    if (dragY < -12 || dragY > 14) {
      didSwipeRef.current = true;
      triggerFlip();
    } else {
      setDragY(0);
      setTimeout(() => {
        didSwipeRef.current = false;
      }, 50);
    }
    touchStartYRef.current = null;
  };

  // Front card tap handler (opens modal/cart only on a clean tap, NOT on swipe or flip)
  const handleFrontCardClick = () => {
    if (isFlipping || didSwipeRef.current || Date.now() - lastActionTimeRef.current < 350) {
      return;
    }
    if (Math.abs(dragY) < 4) {
      if (activeCard === 'dining_order') {
        if (hasOrder && onOpenTracking) {
          onOpenTracking();
        } else if (onOpenCart) {
          onOpenCart();
        }
      } else {
        onOpenServiceModal();
      }
    }
  };

  // Dynamic cooking timer calculation
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

  // Render card internal layout
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

          {/* Right: Subtotal Amount */}
          <div className="flex flex-col items-end shrink-0 pl-1">
            <span className="text-[9px] uppercase tracking-wider text-white/60 font-semibold leading-none">
              Total
            </span>
            <span className="font-mono tabular-nums text-xs sm:text-sm font-black text-white leading-tight">
              {currencySymbol}{displayTotal.toFixed(2)}
            </span>
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

        {/* Right: Status Pill */}
        <div className="flex items-center shrink-0 pl-1">
          {hasActiveRequest ? (
            <span className="text-[10px] font-bold text-white bg-[#07543a] px-2.5 py-1 rounded-full border border-white/30 animate-pulse">
              Alerted
            </span>
          ) : (
            <span className="text-[10px] font-bold text-white bg-white/10 hover:bg-[#07543a] px-2.5 py-1 rounded-full border border-white/10 transition-colors">
              Call Server
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ touchAction: 'none' }}
      className="relative w-full max-w-[340px] sm:max-w-[380px] mx-auto select-none py-2 pointer-events-auto touch-none transition-all duration-300"
    >
      {/* Micro Swipe / Switch Hint Pill on top edge */}
      <div
        onClick={triggerFlip}
        className="absolute -top-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#07543a] border border-white/20 px-2 py-0.5 rounded-full text-[9px] font-bold text-white tracking-wider uppercase cursor-pointer z-30 active:scale-95 transition-transform"
        title="Swipe up or down to switch cards"
      >
        <ChevronUp className="w-2.5 h-2.5 text-white animate-bounce" />
        <span>Swipe to switch</span>
      </div>

      {/* 3D Physical Stack Container (Clean, no weird bottom shadow) */}
      <div className="relative w-full h-14 sm:h-[58px]">
        {/* 3D Stack: Back Card (visibly peeking out directly above the front card) */}
        <div
          onClick={triggerFlip}
          className={`absolute inset-0 px-3.5 sm:px-4 rounded-[22px] bg-[#052218] border border-white/10 flex items-center justify-between cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isFlipping
              ? 'z-30 scale-100 translate-y-0 opacity-100'
              : 'z-10 -translate-y-3.5 sm:-translate-y-4 scale-[0.93] opacity-80 hover:opacity-95'
          }`}
          title="Tap or swipe to bring to front"
        >
          {renderCardContent(backCard)}
        </div>

        {/* 3D Stack: Front Card (Interactive with Swipe Up/Down, Wheel Scroll, and Tap) */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onClick={handleFrontCardClick}
          style={{
            transform: isFlipping
              ? 'translateY(-45px) scale(0.91)'
              : `translateY(${dragY}px) scale(${1 - Math.abs(dragY) * 0.002})`,
            opacity: isFlipping ? 0.4 : 1,
            touchAction: 'none',
          }}
          className={`relative w-full h-full px-3.5 sm:px-4 rounded-[22px] bg-[#041c14] hover:bg-[#06241a] border border-[#07543a]/70 flex items-center justify-between cursor-pointer select-none transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isFlipping ? 'z-10' : 'z-20'
          }`}
        >
          {renderCardContent(activeCard)}
        </div>
      </div>
    </div>
  );
};
