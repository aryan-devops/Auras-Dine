import React, { useState } from 'react';
import { ShoppingBag, Sparkles, Shield, ChefHat, Bell, QrCode, Store, Settings } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

interface HeaderProps {
  onOpenCart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart }) => {
  const { currentTenant, cartCount, currentRole, setCurrentRole } = useRestaurant();
  const [showStaffMenu, setShowStaffMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F2]/90 backdrop-blur-md border-b border-[#30673A]/15 w-full max-w-full overflow-hidden shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-8 w-full min-w-0">
        
        {/* Zone 1: Hotel Name + Powered by Aurasdine */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="text-base sm:text-xl font-bold tracking-tight text-[#1E231F] glinster-font truncate">
            {currentTenant.name}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium text-[#30673A] bg-[#30673A]/10 px-2.5 py-0.5 rounded-full border border-[#30673A]/20 whitespace-nowrap shadow-2xs">
            <Sparkles className="w-3 h-3 text-[#30673A]" />
            Powered by Aurasdine
          </span>
        </div>

        {/* Zone 2: Right Actions (Cart / Staff Menu) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {currentRole === 'customer' ? (
            <button
              type="button"
              onClick={onOpenCart}
              className="min-h-[40px] px-4 py-2 text-xs font-semibold text-white bg-[#30673A] hover:bg-[#204828] rounded-full transition-colors flex items-center gap-2 shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Table Cart</span>
              {cartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-[#30673A] font-bold flex items-center justify-center text-[10px]">
                  {cartCount}
                </span>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentRole('customer')}
              className="min-h-[40px] px-4 py-2 text-xs font-semibold text-white bg-[#E3792F] hover:bg-[#c96420] rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Back to Menu</span>
            </button>
          )}

          {/* Discreet Staff & Admin Portal Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowStaffMenu(!showStaffMenu)}
              className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors border border-neutral-200 cursor-pointer shadow-2xs"
              title="Staff & Admin Portal"
            >
              <Settings className="w-4 h-4" />
            </button>

            {showStaffMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100">
                  Staff & Management Portal
                </div>
                <button
                  type="button"
                  onClick={() => { setCurrentRole('customer'); setShowStaffMenu(false); }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-[#30673A]/10 hover:text-[#30673A] flex items-center gap-2 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-[#30673A]" />
                  <span>Digital Menu View</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setCurrentRole('qr_stand'); setShowStaffMenu(false); }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-[#30673A]/10 hover:text-[#30673A] flex items-center gap-2 cursor-pointer"
                >
                  <Store className="w-3.5 h-3.5 text-[#30673A]" />
                  <span>Table Stand Studio</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setCurrentRole('kitchen'); setShowStaffMenu(false); }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-[#30673A]/10 hover:text-[#30673A] flex items-center gap-2 cursor-pointer"
                >
                  <ChefHat className="w-3.5 h-3.5 text-[#30673A]" />
                  <span>Kitchen KDS</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setCurrentRole('waiter'); setShowStaffMenu(false); }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-[#30673A]/10 hover:text-[#30673A] flex items-center gap-2 cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5 text-[#30673A]" />
                  <span>Waiter Calling Bell</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setCurrentRole('restaurant_admin'); setShowStaffMenu(false); }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-[#30673A]/10 hover:text-[#30673A] flex items-center gap-2 border-t border-neutral-100 cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-[#30673A]" />
                  <span>Restaurant Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setCurrentRole('super_admin'); setShowStaffMenu(false); }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-[#30673A]/10 hover:text-[#30673A] flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#30673A]" />
                  <span>SaaS Platform</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};


