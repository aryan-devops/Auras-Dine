import React, { useState } from 'react';
import { ShoppingCart, Sparkles, Shield, ChefHat, Bell, QrCode, Store, Settings } from 'lucide-react';
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
        <div className="flex flex-col justify-center min-w-0">
          <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold text-[#30673A] tracking-wider uppercase leading-none mb-0.5">
            <Sparkles className="w-2.5 h-2.5 text-[#30673A]" />
            Powered by Aurasdine
          </span>
          <span className="text-base sm:text-xl font-bold tracking-tight text-[#1E231F] glinster-font truncate leading-tight">
            {currentTenant.name}
          </span>
        </div>

        {/* Zone 2: Right Actions (Cart / Staff Menu) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {currentRole === 'customer' ? (
            <button
              type="button"
              onClick={onOpenCart}
              title="Cart"
              aria-label="View Cart"
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full text-white bg-[#30673A] hover:bg-[#204828] transition-colors flex items-center justify-center shadow-xs shrink-0 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] sm:min-w-[20px] h-[18px] sm:h-5 px-1 rounded-full bg-[#E3792F] text-white font-bold flex items-center justify-center text-[10px] shadow-xs border-2 border-[#FAF8F2]">
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


