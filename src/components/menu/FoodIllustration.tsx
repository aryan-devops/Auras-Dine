import React, { useState } from 'react';
import { FoodType } from '../../types';

interface FoodIllustrationProps {
  itemId: string;
  name: string;
  foodType: FoodType;
  imagePath?: string;
  className?: string;
}

export const FoodIllustration: React.FC<FoodIllustrationProps> = ({
  name,
  foodType,
  imagePath,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  // Generate consistent palette shades based on name and foodType
  const isVeg = foodType === 'veg' || foodType === 'vegan';
  const isDessert = name.toLowerCase().includes('chocolate') || name.toLowerCase().includes('skillet') || name.toLowerCase().includes('brownie');
  const isPizza = name.toLowerCase().includes('pizza') || name.toLowerCase().includes('margherita');
  const isBiryani = name.toLowerCase().includes('biryani') || name.toLowerCase().includes('rice');
  const isTikka = name.toLowerCase().includes('tikka') || name.toLowerCase().includes('skewer');
  const isBurger = name.toLowerCase().includes('burger') || name.toLowerCase().includes('smash');
  const isDrink = name.toLowerCase().includes('tonic') || name.toLowerCase().includes('soda') || name.toLowerCase().includes('sparkling');

  // If valid imagePath is provided, render the photo with high fidelity
  if (imagePath && !imgError) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-[#F4F9FD] flex items-center justify-center border border-[#2C5EAD]/10 select-none group ${className}`}
      >
        <img
          src={imagePath}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Subtle vignette gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#F4F9FD] via-[#C4E2F5]/40 to-[#F4F9FD] flex items-center justify-center border border-[#2C5EAD]/10 select-none ${className}`}
    >
      {/* Decorative ceramic plate background */}
      <div className="absolute inset-2 rounded-full border border-neutral-300/40 bg-white/70 shadow-inner flex items-center justify-center">
        <div className="w-[85%] h-[85%] rounded-full border border-dashed border-[#2C5EAD]/15 flex items-center justify-center bg-gradient-to-tr from-[#F4F9FD] to-white/90">
          
          {/* Dish specific artistic culinary glyph */}
          {isPizza && (
            <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-md">
              <circle cx="50" cy="50" r="42" fill="#1591DC" stroke="#B85D1E" strokeWidth="3" />
              <circle cx="50" cy="50" r="37" fill="#FEE4B3" />
              {/* Melted mozzarella spots */}
              <circle cx="38" cy="40" r="11" fill="#FFFDF5" opacity="0.9" />
              <circle cx="62" cy="42" r="10" fill="#FFFDF5" opacity="0.9" />
              <circle cx="48" cy="62" r="12" fill="#FFFDF5" opacity="0.9" />
              {/* Basil leaves */}
              <path d="M48 35 C52 28, 56 32, 53 38 C50 42, 45 40, 48 35 Z" fill="#2C5EAD" />
              <path d="M36 55 C32 60, 38 64, 42 58 C45 54, 40 50, 36 55 Z" fill="#2C5EAD" />
              <path d="M60 58 C66 54, 68 62, 62 65 C58 67, 56 62, 60 58 Z" fill="#2C5EAD" />
            </svg>
          )}

          {isBiryani && (
            <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-md">
              <ellipse cx="50" cy="58" rx="40" ry="24" fill="#D4AF37" stroke="#A88B25" strokeWidth="2" />
              <ellipse cx="50" cy="50" rx="35" ry="18" fill="#FCE7B0" />
              {/* Rice textures */}
              <path d="M30 46 Q35 44 40 47" stroke="#1591DC" strokeWidth="2" strokeLinecap="round" />
              <path d="M48 42 Q54 41 58 45" stroke="#C9752A" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M42 54 Q48 51 54 53" stroke="#1591DC" strokeWidth="2" strokeLinecap="round" />
              <path d="M60 50 Q66 48 70 51" stroke="#2C5EAD" strokeWidth="2" strokeLinecap="round" />
              {/* Mint crown */}
              <path d="M46 36 C42 28, 54 28, 50 36 C55 33, 58 42, 48 40 Z" fill="#2C5EAD" />
            </svg>
          )}

          {isTikka && (
            <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-md">
              {/* Skewer wire */}
              <line x1="15" y1="85" x2="85" y2="15" stroke="#71717A" strokeWidth="2.5" strokeLinecap="round" />
              {/* Charred cubes */}
              <rect x="24" y="55" width="18" height="18" rx="3" fill="#1591DC" stroke="#9A3412" strokeWidth="1.5" transform="rotate(-45 33 64)" />
              <rect x="42" y="37" width="20" height="20" rx="3" fill={isVeg ? "#F4F9FD" : "#1591DC"} stroke="#78350F" strokeWidth="1.5" transform="rotate(-45 52 47)" />
              <rect x="60" y="19" width="18" height="18" rx="3" fill="#2C5EAD" stroke="#14532D" strokeWidth="1.5" transform="rotate(-45 69 28)" />
              {/* Char marks */}
              <line x1="30" y1="62" x2="36" y2="66" stroke="#451A03" strokeWidth="2" />
              <line x1="49" y1="44" x2="55" y2="48" stroke="#451A03" strokeWidth="2" />
            </svg>
          )}

          {isBurger && (
            <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-md">
              {/* Top bun */}
              <path d="M22 46 C22 28, 78 28, 78 46 Z" fill="#1591DC" stroke="#9A3412" strokeWidth="2" />
              {/* Sesame */}
              <ellipse cx="40" cy="36" rx="1.5" ry="3" fill="#F4F9FD" transform="rotate(20 40 36)" />
              <ellipse cx="60" cy="37" rx="1.5" ry="3" fill="#F4F9FD" transform="rotate(-15 60 37)" />
              {/* Lettuce */}
              <path d="M20 50 Q30 54 40 50 Q50 54 60 50 Q70 54 80 50" stroke="#2C5EAD" strokeWidth="4" strokeLinecap="round" />
              {/* Patty */}
              <rect x="22" y="56" width="56" height="10" rx="4" fill="#451A03" />
              {/* Melted cheese */}
              <polygon points="30,56 42,66 54,56" fill="#FBBF24" />
              {/* Bottom bun */}
              <path d="M24 68 C24 76, 76 76, 76 68 Z" fill="#1591DC" stroke="#9A3412" strokeWidth="2" />
            </svg>
          )}

          {isDessert && (
            <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-md">
              {/* Cast iron pan */}
              <circle cx="50" cy="50" r="34" fill="#18181B" stroke="#27272A" strokeWidth="3" />
              {/* Molten fudge brownie */}
              <circle cx="50" cy="50" r="28" fill="#3E2723" />
              {/* Vanilla scoop */}
              <circle cx="50" cy="46" r="14" fill="#FFFDF5" stroke="#FDE68A" strokeWidth="1" />
              {/* Pistachio dust */}
              <circle cx="46" cy="43" r="1.5" fill="#2C5EAD" />
              <circle cx="53" cy="41" r="1.5" fill="#2C5EAD" />
              <circle cx="51" cy="48" r="1.5" fill="#2C5EAD" />
              <circle cx="45" cy="49" r="1.2" fill="#1591DC" />
            </svg>
          )}

          {isDrink && (
            <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-md">
              {/* Highball glass */}
              <path d="M34 20 L38 82 Q38 86 50 86 Q62 86 62 82 L66 20 Z" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" opacity="0.85" />
              {/* Sparkling liquid */}
              <path d="M37 38 L39 80 Q39 84 50 84 Q61 84 61 80 L63 38 Z" fill="#1591DC" opacity="0.65" />
              {/* Orange slice */}
              <circle cx="58" cy="24" r="12" fill="#F97316" stroke="#C2410C" strokeWidth="1.5" />
              <path d="M58 12 L58 36 M46 24 L70 24" stroke="#FFF" strokeWidth="1" />
              {/* Rosemary sprig */}
              <path d="M45 45 Q42 20 48 10" stroke="#2C5EAD" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          )}

          {!isPizza && !isBiryani && !isTikka && !isBurger && !isDessert && !isDrink && (
            <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-md">
              {/* Artisanal bowl */}
              <ellipse cx="50" cy="62" rx="36" ry="20" fill="#C4E2F5" stroke="#2C5EAD" strokeWidth="2" />
              <ellipse cx="50" cy="52" rx="32" ry="14" fill="#2C5EAD" opacity="0.8" />
              {/* Garnished heirloom bowl contents */}
              <circle cx="44" cy="50" r="6" fill="#F4F9FD" />
              <circle cx="56" cy="52" r="5" fill="#1591DC" />
              <circle cx="50" cy="46" r="4" fill="#C4E2F5" />
              <path d="M40 50 Q50 44 60 52" stroke="#F4F9FD" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}

        </div>
      </div>

      {/* Food type pill indicator */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/95 shadow-xs border border-neutral-200">
        <span
          className={`text-[9px] font-black ${
            isVeg ? 'text-[#2C5EAD]' : 'text-[#1591DC]'
          }`}
        >
          {foodType === 'veg' ? '● VEG' : foodType === 'vegan' ? '🌱 VEGAN' : foodType === 'egg' ? '🥚 EGG' : '▲ NON-VEG'}
        </span>
      </div>
    </div>
  );
};
