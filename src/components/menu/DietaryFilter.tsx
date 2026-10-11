import React, { useId } from 'react';
import { DietaryFilterValue } from '../../types';

interface DietaryFilterProps {
  value: DietaryFilterValue;
  onChange: (value: DietaryFilterValue) => void;
  size?: 'sm' | 'md';
  className?: string;
}

const options: {
  value: DietaryFilterValue;
  label: string;
  shortLabel: string;
  icon?: string;
  activeColor: string;
}[] = [
  {
    value: 'all',
    label: 'All Items',
    shortLabel: 'All',
    activeColor: 'bg-[#1E231F] text-[#FAF8F2]',
  },
  {
    value: 'veg',
    label: 'Veg Only',
    shortLabel: 'Veg',
    icon: '●',
    activeColor: 'bg-[#30673A] text-white',
  },
  {
    value: 'non_veg',
    label: 'Non-Veg',
    shortLabel: 'Non-Veg',
    icon: '▲',
    activeColor: 'bg-[#E3792F] text-white',
  },
];

export const DietaryFilter: React.FC<DietaryFilterProps> = ({
  value,
  onChange,
  size = 'md',
  className = '',
}) => {
  const groupId = useId();
  const isSm = size === 'sm';

  return (
    <div
      role="group"
      aria-label="Filter dishes by dietary classification"
      className={`inline-flex items-center ${
        isSm ? 'p-0.5' : 'p-1'
      } rounded-full bg-[#E9E9C7]/40 border border-[#30673A]/15 backdrop-blur-sm shadow-xs ${className}`}
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        const id = `${groupId}-${option.value}`;

        return (
          <button
            key={option.value}
            id={id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(option.value)}
            className={`${
              isSm
                ? 'min-h-[30px] px-2.5 py-1 text-xs'
                : 'min-h-[34px] sm:min-h-[38px] px-3 sm:px-3.5 py-1 sm:py-1.5 text-xs sm:text-sm'
            } rounded-full font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#30673A] focus-visible:ring-offset-1 select-none ${
              isSelected
                ? `${option.activeColor} shadow-sm font-semibold scale-[1.02]`
                : 'text-[#1E231F]/80 hover:text-[#1E231F] hover:bg-white/50'
            }`}
          >
            {option.icon && (
              <span
                className={`text-[10px] leading-none ${
                  option.value === 'veg'
                    ? isSelected ? 'text-[#FAF8F2]' : 'text-[#30673A]'
                    : isSelected ? 'text-white' : 'text-[#E3792F]'
                }`}
                aria-hidden="true"
              >
                {option.icon}
              </span>
            )}
            <span className="whitespace-nowrap">
              {isSm ? option.shortLabel : option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
