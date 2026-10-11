import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Instagram, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const { currentTenant } = useRestaurant();

  return (
    <footer className="mt-auto py-6 px-4 bg-white border-t border-[#30673A]/15 text-center text-xs text-neutral-500 space-y-2 w-full">
      <div className="font-bold text-[#1E231F] glinster-font">
        {currentTenant.name} · {currentTenant.tagline || 'Digital Dining & Ordering'}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 text-neutral-600">
        <span className="flex items-center gap-1 font-medium">
          <Sparkles className="w-3 h-3 text-[#30673A]" />
          Powered by <strong>AuraDine</strong>
        </span>
        <span className="text-neutral-300">•</span>
        <a
          href="https://www.instagram.com/aurasdine"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#E3792F] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
        >
          <Instagram className="w-3.5 h-3.5" />
          <span>Instagram: @aurasdine</span>
        </a>
      </div>
    </footer>
  );
};
