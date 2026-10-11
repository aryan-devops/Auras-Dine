import React from 'react';
import { ShoppingCart, QrCode } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

interface HeaderProps {
  onOpenCart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart }) => {
  const { currentTenant, cartCount, currentRole, setCurrentRole, setIsCartDrawerOpen } = useRestaurant();

  const handleOpenCart = () => {
    if (onOpenCart) {
      onOpenCart();
    } else {
      setIsCartDrawerOpen(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F2]/90 backdrop-blur-md border-b border-[#30673A]/15 w-full max-w-full overflow-hidden shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-8 w-full min-w-0">
        
        {/* Zone 1: Restaurant Name */}
        <div className="flex items-center min-w-0">
          <span className="text-base sm:text-xl font-bold tracking-tight text-[#1E231F] glinster-font truncate">
            {currentTenant.name}
          </span>
        </div>

        {/* Zone 2: Right Actions (Cart Button) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {currentRole === 'customer' ? (
            <button
              type="button"
              onClick={handleOpenCart}
              title="Open Cart"
              aria-label="Open Cart"
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full text-white bg-[#30673A] hover:bg-[#204828] active:scale-95 transition-all flex items-center justify-center shadow-xs shrink-0 cursor-pointer"
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
        </div>

      </div>
    </header>
  );
};


