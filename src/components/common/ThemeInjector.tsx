import React, { useMemo } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';

export const ThemeInjector: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentTenant } = useRestaurant();

  const themeVars = useMemo(() => {
    return {
      '--primary-color': currentTenant.primaryColor,
      '--accent-color': currentTenant.accentColor,
      '--secondary-color': currentTenant.secondaryColor,
    } as React.CSSProperties;
  }, [currentTenant]);

  return (
    <div style={themeVars} className="h-full w-full">
      {children}
    </div>
  );
};
