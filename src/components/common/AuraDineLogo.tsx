import React from 'react';

interface AuraDineLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'emblem' | 'dark' | 'light' | 'official_card';
  className?: string;
  showSubtitle?: boolean;
}

export const AuraDineLogo: React.FC<AuraDineLogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
  showSubtitle = true,
}) => {
  if (variant === 'official_card') {
    return (
      <div className={`rounded-2xl overflow-hidden shadow-lg border border-[#07543a]/30 inline-block ${className}`}>
        <img
          src="/aurasdine-logo.png"
          alt="AurasDine Official Brand"
          className="w-full h-auto object-contain select-none"
          draggable={false}
        />
      </div>
    );
  }

  const emblemSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const subtitleSizes = {
    sm: 'text-[8px]',
    md: 'text-[9px]',
    lg: 'text-[11px]',
    xl: 'text-xs',
  };

  const isLight = variant === 'light';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Official AurasDine Monogram Emblem ('a') */}
      <div
        className={`relative ${emblemSizes[size]} rounded-2xl p-1.5 flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105 shrink-0 overflow-hidden`}
        style={{
          background: 'linear-gradient(135deg, #07543a 0%, #053d2a 60%, #021a11 100%)',
          boxShadow: '0 4px 16px -2px rgba(7, 84, 58, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
        }}
      >
        <img
          src="/aurasdine-emblem-transparent.png"
          alt="AurasDine Emblem"
          className="w-full h-full object-contain filter drop-shadow-sm select-none"
          draggable={false}
        />
      </div>

      {/* Wordmark & Aura Tag */}
      {variant !== 'emblem' && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-black tracking-tight font-heading glinster-font ${textSizes[size]} ${
                isLight ? 'text-white' : 'text-[#0D1914]'
              }`}
            >
              Auras<span className="text-[#07543a]">Dine</span>
            </span>
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#07543a] shadow-[0_0_8px_#07543a]"
              title="Verified Hospitality OS"
            />
          </div>
          {showSubtitle && (
            <span
              className={`font-bold tracking-wider uppercase ${subtitleSizes[size]} mt-0.5 ${
                isLight ? 'text-neutral-300' : 'text-[#07543a]'
              }`}
            >
              A Complete Dining Experience
            </span>
          )}
        </div>
      )}
    </div>
  );
};
