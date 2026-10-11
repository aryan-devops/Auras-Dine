import React from 'react';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

interface HeaderProps {
  onOpenCart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart }) => {
  const { currentTenant, cartCount, currentRole, setCurrentRole } = useRestaurant();

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F2]/90 backdrop-blur-md border-b border-[#30673A]/15 w-full max-w-full overflow-hidden shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-8 w-full min-w-0">
        
        {/* Zone 1: Hotel Name + Powered by AuraDine */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setCurrentRole('customer');
          }}
          className="flex items-center gap-2 sm:gap-3 min-w-0 group cursor-pointer"
        >
          <span className="text-base sm:text-xl font-bold tracking-tight text-[#1E231F] glinster-font truncate group-hover:text-[#30673A] transition-colors">
            {currentTenant.name}
          </span>
          <span className="hidden xs:inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium text-[#30673A] bg-[#30673A]/10 px-2 py-0.5 rounded-full border border-[#30673A]/20 whitespace-nowrap shadow-2xs">
            <Sparkles className="w-3 h-3 text-[#30673A]" />
            Powered by AuraDine
          </span>
        </a>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
          <button
            type="button"
            onClick={() => setCurrentRole('customer')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#30673A] cursor-pointer ${
              currentRole === 'customer' ? 'text-[#30673A] font-bold' : ''
            }`}
          >
            Digital Menu
          </button>
          <button
            type="button"
            onClick={() => setCurrentRole('qr_stand')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#30673A] cursor-pointer ${
              currentRole === 'qr_stand' ? 'text-[#30673A] font-bold' : ''
            }`}
          >
            Table Stand Studio
          </button>
          <button
            type="button"
            onClick={() => setCurrentRole('kitchen')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#30673A] cursor-pointer ${
              currentRole === 'kitchen' ? 'text-[#30673A] font-bold' : ''
            }`}
          >
            Kitchen KDS
          </button>
          <button
            type="button"
            onClick={() => setCurrentRole('waiter')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#30673A] cursor-pointer ${
              currentRole === 'waiter' ? 'text-[#30673A] font-bold' : ''
            }`}
          >
            Waiter Calling Bell
          </button>
          <button
            type="button"
            onClick={() => setCurrentRole('restaurant_admin')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#30673A] cursor-pointer ${
              currentRole === 'restaurant_admin' ? 'text-[#30673A] font-bold' : ''
            }`}
          >
            Restaurant Admin
          </button>
          <button
            type="button"
            onClick={() => setCurrentRole('super_admin')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#30673A] cursor-pointer ${
              currentRole === 'super_admin' ? 'text-[#30673A] font-bold' : ''
            }`}
          >
            SaaS Platform
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
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
              className="min-h-[40px] px-4 py-2 text-xs font-semibold text-white bg-[#E3792F] hover:bg-[#c96420] rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
            >
              Scan Table QR
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

