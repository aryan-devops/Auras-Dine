import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Instagram, Sparkles } from 'lucide-react';
import { AuraDineLogo } from './AuraDineLogo';

export const Footer: React.FC = () => {
  const { currentTenant } = useRestaurant();

  return (
    <footer className="mt-auto py-6 px-4 bg-white border-t border-[#07543a]/15 text-center text-xs text-neutral-500 space-y-2.5 w-full">
      <div className="flex items-center justify-center gap-2">
        <AuraDineLogo size="sm" variant="emblem" />
        <span className="font-bold text-[#0D1914] glinster-font text-sm">
          {currentTenant.name} · {currentTenant.tagline || 'Artisanal Dining & Hospitality'}
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 text-neutral-600">
        <span className="flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3 h-3 text-[#07543a]" />
          Powered by <strong>AurasDine · A Complete Dining Experience</strong>
        </span>
        <span className="text-neutral-300">•</span>
        <a
          href="https://www.instagram.com/aurasdine"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#07543a] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
        >
          <Instagram className="w-3.5 h-3.5" />
          <span>@aurasdine</span>
        </a>
      </div>
    </footer>
  );
};
