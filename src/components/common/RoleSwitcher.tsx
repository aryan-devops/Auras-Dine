import React from 'react';
import { Smartphone, ChefHat, Bell, Store, ShieldAlert, Building2, Sparkles } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { UserRole } from '../../types';

export const RoleSwitcher: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    tenants,
    currentTenantId,
    setCurrentTenantId,
    tables,
    currentTableId,
    setCurrentTableId,
  } = useRestaurant();

  const roles: { role: UserRole; label: string; icon: React.ElementType }[] = [
    { role: 'customer', label: 'Customer (QR Menu)', icon: Smartphone },
    { role: 'qr_stand', label: 'Table QR Stand', icon: Sparkles },
    { role: 'kitchen', label: 'Kitchen KDS', icon: ChefHat },
    { role: 'waiter', label: 'Waiter Bell', icon: Bell },
    { role: 'restaurant_admin', label: 'Restaurant Admin', icon: Store },
    { role: 'super_admin', label: 'Super Admin', icon: ShieldAlert },
  ];

  return (
    <div className="bg-[#1E231F] text-white border-b border-neutral-800 px-3 sm:px-4 py-1.5 sm:py-2 text-xs select-none w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3 overflow-x-auto no-scrollbar w-full min-w-0">
        
        {/* Role Segmented Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mr-1 hidden lg:inline">
            Role:
          </span>
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = currentRole === r.role;
            return (
              <button
                key={r.role}
                type="button"
                onClick={() => setCurrentRole(r.role)}
                className={`min-h-[26px] sm:min-h-[30px] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#30673A] text-white font-bold shadow-xs'
                    : 'bg-neutral-800/80 text-neutral-300 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tenant & Table Quick Selectors */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Tenant Switcher */}
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#E3792F]" />
            <select
              value={currentTenantId}
              onChange={(e) => setCurrentTenantId(e.target.value)}
              className="bg-neutral-800 text-neutral-200 text-xs rounded-lg px-2 py-1 border border-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#30673A] cursor-pointer"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Table Switcher (when in customer mode) */}
          {currentRole === 'customer' && (
            <div className="flex items-center gap-1.5">
              <span className="text-neutral-400 text-[11px]">Table:</span>
              <select
                value={currentTableId}
                onChange={(e) => setCurrentTableId(e.target.value)}
                className="bg-neutral-800 text-neutral-200 text-xs rounded-lg px-2 py-1 border border-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#30673A] cursor-pointer"
              >
                {tables.map((tbl) => (
                  <option key={tbl.id} value={tbl.id}>
                    {tbl.tableNumber}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
