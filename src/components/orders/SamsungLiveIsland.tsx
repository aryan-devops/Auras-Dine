import React, { useState, useEffect, useRef } from 'react';
import {
  Hourglass,
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

  // Align active card when request or order states change
  useEffect(() => {
    if (hasActiveRequest) {
      setActiveCard('floor_waiter');
    }
  }, [hasActiveRequest]);

  // Touch and pointer swipe physics state
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [dragY, setDragY] = useState<number>(0);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const lastWheelTimeRef = useRef<number>(0);

  // Trigger smooth card flip animation
  const triggerFlip = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([15, 30]);
      } catch {}
    }
    setTimeout(() => {
      setActiveCard((prev) => (prev === 'dining_order' ? 'floor_waiter' : 'dining_order'));
      setDragY(0);
      setIsFlipping(false);
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
    setTouchStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY === null || isFlipping) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY;
    // Track upward swipe (negative) or slight downward movement
    setDragY(Math.max(-45, Math.min(25, diff)));
  };

  const handleTouchEnd = () => {
    if (isFlipping || touchStartY === null) {
      setTouchStartY(null);
      setIsDragging(false);
      setDragY(0);
      return;
    }

    if (dragY < -14 || dragY > 16) {
      // Swiped up or down -> Flip the card!
      triggerFlip();
    } else {
      setDragY(0);
    }
    setTouchStartY(null);
    setIsDragging(false);
  };

  // Mouse drag handlers for desktop swipe testing
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isFlipping) return;
    setTouchStartY(e.clientY);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || touchStartY === null || isFlipping) return;
    const diff = e.clientY - touchStartY;
    setDragY(Math.max(-45, Math.min(25, diff)));
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    if (dragY < -14 || dragY > 16) {
      triggerFlip();
    } else {
      setDragY(0);
    }
    setTouchStartY(null);
    setIsDragging(false);
  };

  // Front card tap handler (opens modal/cart if not dragging)
  const handleFrontCardClick = () => {
    if (isFlipping) return;
    if (Math.abs(dragY) < 5) {
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
          {/* Left: Forest Emerald Squircle with Hourglass / Count Badge */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#07543a] to-[#0a7350] flex items-center justify-center text-white shrink-0 shadow-md shadow-[#07543a]/40 border border-white/20">
            {hasOrder ? (
              <Hourglass className="w-4 h-4 text-white animate-pulse" />
            ) : cartCount > 0 ? (
              <span className="font-mono font-black text-xs text-white">
                {cartCount}
              </span>
            ) : (
              <ReceiptText className="w-4 h-4 text-white" />
            )}
          </div>

          {/* Middle: Title & Subtitle */}
          <div className="flex flex-col min-w-0 flex-1 text-left">
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-white font-extrabold text-xs sm:text-sm tracking-tight truncate">
                View Dining Order
              </span>
              {hasOrder && (
                <span className="text-[10px] font-mono text-white bg-[#07543a]/80 px-1.5 py-0.2 rounded-full border border-white/20 shrink-0">
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
                  <span>{cartCount} {cartCount === 1 ? 'item' : 'items'} added</span>
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
        {/* Left: Forest Emerald Squircle with White Bell */}
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#07543a] to-[#041c14] flex items-center justify-center text-white shrink-0 shadow-md shadow-[#07543a]/40 border border-white/20">
          <Bell className={`w-4 h-4 text-white ${hasActiveRequest ? 'animate-bounce' : ''}`} />
        </div>

        {/* Middle: Title & Subtitle */}
        <div className="flex flex-col min-w-0 flex-1 text-left">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-white font-extrabold text-xs sm:text-sm tracking-tight truncate">
              Floor Waiter Paged
            </span>
          </div>
          <div className="text-[10.5px] sm:text-[11px] text-white/75 font-medium truncate flex items-center gap-1">
            {hasActiveRequest ? (
              <span>Staff alerted for Table {tableNumber}</span>
            ) : (
              <span>Tap to request table service</span>
            )}
          </div>
        </div>

        {/* Right: Status Pill */}
        <div className="flex items-center shrink-0 pl-1">
          {hasActiveRequest ? (
            <span className="text-[10px] font-bold text-white bg-[#07543a] px-2.5 py-1 rounded-full border border-white/30 animate-pulse shadow-sm shadow-[#07543a]/50">
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
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative w-full max-w-[340px] sm:max-w-[380px] mx-auto select-none py-2 pointer-events-auto transition-all duration-300"
    >
      {/* Micro Scroll / Swipe Hint Pill on top edge */}
      <div
        onClick={triggerFlip}
        className="absolute -top-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#07543a] border border-white/30 px-2 py-0.5 rounded-full text-[9px] font-bold text-white tracking-wider uppercase cursor-pointer shadow-sm shadow-[#07543a]/30 z-30 active:scale-95 transition-transform"
        title="Scroll or swipe up to switch cards"
      >
        <ChevronUp className="w-2.5 h-2.5 text-white animate-bounce" />
        <span>Scroll / Swipe</span>
      </div>

      {/* 3D Physical Stack Container */}
      <div className="relative w-full h-14 sm:h-[58px]">
        {/* Curved Under-Card Sliver (Samsung One UI signature accent) */}
        <div
          className={`absolute -bottom-1.5 inset-x-6 h-2 rounded-b-[20px] transition-all duration-300 -z-20 shadow-md ${
            activeCard === 'dining_order'
              ? 'bg-gradient-to-r from-[#07543a] via-[#0a7350] to-[#07543a] border-b border-white/20 opacity-90'
              : 'bg-gradient-to-r from-[#041c14] via-[#07543a] to-[#041c14] border-b border-white/20 opacity-90'
          }`}
        />

        {/* 3D Stack: Back Card (visibly peeking out directly above the front card) */}
        <div
          onClick={triggerFlip}
          className={`absolute inset-0 px-3.5 sm:px-4 rounded-[26px] bg-[#052218]/90 backdrop-blur-xl border border-white/15 shadow-lg flex items-center justify-between cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isFlipping
              ? 'z-30 scale-100 translate-y-0 opacity-100 shadow-[0_16px_40px_rgba(4,28,20,0.65)]'
              : 'z-10 -translate-y-3.5 sm:-translate-y-4 scale-[0.93] opacity-80 hover:opacity-95'
          }`}
          title="Scroll or tap to bring to front"
        >
          {renderCardContent(backCard)}
        </div>

        {/* 3D Stack: Front Card (Interactive with Swipe Up, Wheel Scroll, and Tap) */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onClick={handleFrontCardClick}
          style={{
            transform: isFlipping
              ? 'translateY(-48px) scale(0.90)'
              : `translateY(${dragY}px) scale(${1 - Math.abs(dragY) * 0.002})`,
            opacity: isFlipping ? 0.35 : 1,
          }}
          className={`relative w-full h-full px-3.5 sm:px-4 rounded-[26px] bg-[#041c14]/95 hover:bg-[#06241a] backdrop-blur-3xl border border-[#07543a]/80 shadow-[0_16px_40px_rgba(4,28,20,0.65)] flex items-center justify-between cursor-pointer select-none transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isFlipping ? 'z-10' : 'z-20'
          }`}
        >
          {renderCardContent(activeCard)}
        </div>
      </div>
    </div>
  );
};
