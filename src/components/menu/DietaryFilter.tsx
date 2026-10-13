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
    activeColor: 'bg-[#041c14] text-white',
  },
  {
    value: 'veg',
    label: 'Veg Only',
    shortLabel: 'Veg',
    icon: '●',
    activeColor: 'bg-[#07543a] text-white',
  },
  {
    value: 'non_veg',
    label: 'Non-Veg',
    shortLabel: 'Non-Veg',
    icon: '▲',
    activeColor: 'bg-[#0a7350] text-white',
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
      } rounded-full bg-[#E6F2ED] border border-[#C2DFD4] backdrop-blur-sm shadow-xs ${className}`}
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
            } rounded-full font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#07543a] focus-visible:ring-offset-1 select-none ${
              isSelected
                ? `${option.activeColor} shadow-sm font-semibold scale-[1.02]`
                : 'text-[#0D1914]/80 hover:text-[#0D1914] hover:bg-white/70'
            }`}
          >
            {option.icon && (
              <span
                className={`text-[10px] leading-none ${
                  option.value === 'veg'
                    ? isSelected ? 'text-white' : 'text-[#07543a]'
                    : isSelected ? 'text-white' : 'text-[#0a7350]'
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
