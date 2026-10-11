import React from 'react';
import { FoodType } from '../../types';

interface DietaryBadgeProps {
  foodType: FoodType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const DietaryBadge: React.FC<DietaryBadgeProps> = ({
  foodType,
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  const isVeg = foodType === 'veg';
  const isVegan = foodType === 'vegan';
  const isNonVeg = foodType === 'non_veg';
  const isEgg = foodType === 'egg';

  // Dimension mapping
  const boxDimensions =
    size === 'sm'
      ? 'w-3.5 h-3.5 border-[1.5px]'
      : size === 'lg'
      ? 'w-5 h-5 border-2'
      : 'w-4 h-4 border-[1.5px]';

  const dotDimensions =
    size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-2.5 h-2.5' : 'w-2 h-2';

  const triangleDimensions =
    size === 'sm'
      ? 'border-x-[3px] border-b-[5px]'
      : size === 'lg'
      ? 'border-x-[5px] border-b-[8px]'
      : 'border-x-[4px] border-b-[6.5px]';

  const label = isVeg
    ? 'Vegetarian'
    : isVegan
    ? '100% Plant-Based Vegan'
    : isEgg
    ? 'Eggitarian'
    : 'Non-Vegetarian';

  return (
    <div
      className={`inline-flex items-center gap-1.5 select-none ${className}`}
      title={label}
      aria-label={label}
    >
      {/* Authentic FSSAI-style dietary symbol */}
      {isVeg && (
        <span
          className={`shrink-0 rounded-[3px] border-[#30673A] bg-white flex items-center justify-center ${boxDimensions}`}
        >
          <span className={`rounded-full bg-[#30673A] ${dotDimensions}`} />
        </span>
      )}

      {isVegan && (
        <span
          className={`shrink-0 rounded-[3px] border-[#30673A] bg-white flex items-center justify-center ${boxDimensions}`}
        >
          <span className="text-[10px] leading-none text-[#30673A] font-bold">🌱</span>
        </span>
      )}

      {isNonVeg && (
        <span
          className={`shrink-0 rounded-[3px] border-[#E3792F] bg-white flex items-center justify-center ${boxDimensions}`}
        >
          {/* Authentic equilateral upward triangle */}
          <span
            className={`w-0 h-0 border-l-transparent border-r-transparent border-b-[#E3792F] ${triangleDimensions}`}
          />
        </span>
      )}

      {isEgg && (
        <span
          className={`shrink-0 rounded-[3px] border-amber-600 bg-white flex items-center justify-center ${boxDimensions}`}
        >
          <span className={`rounded-full bg-amber-500 ${dotDimensions}`} />
        </span>
      )}

      {showLabel && (
        <span
          className={`text-[11px] font-semibold tracking-tight ${
            isVeg || isVegan ? 'text-[#30673A]' : isEgg ? 'text-amber-700' : 'text-[#E3792F]'
          }`}
        >
          {label}
        </span>
      )}
    </div>
  );
};
