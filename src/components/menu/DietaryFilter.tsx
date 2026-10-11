import React, { useId } from 'react';
import { DietaryFilterValue } from '../../types';

interface DietaryFilterProps {
  value: DietaryFilterValue;
  onChange: (value: DietaryFilterValue) => void;
  className?: string;
}

const options: {
  value: DietaryFilterValue;
  label: string;
  icon?: string;
  activeColor: string;
}[] = [
  {
    value: 'all',
    label: 'All Items',
    activeColor: 'bg-[#1E231F] text-[#FAF8F2]',
  },
  {
    value: 'veg',
    label: 'Veg Only',
    icon: '●',
    activeColor: 'bg-[#30673A] text-white',
  },
  {
    value: 'non_veg',
    label: 'Non-Veg',
    icon: '▲',
    activeColor: 'bg-[#E3792F] text-white',
  },
];

export const DietaryFilter: React.FC<DietaryFilterProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const groupId = useId();

  return (
    <div
      role="group"
      aria-label="Filter dishes by dietary classification"
      className={`inline-flex items-center p-1 rounded-full bg-[#E9E9C7]/40 border border-[#30673A]/15 backdrop-blur-sm shadow-xs ${className}`}
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
            className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#30673A] focus-visible:ring-offset-1 select-none ${
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
            <span className="whitespace-nowrap">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};
