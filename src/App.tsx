import React, { useEffect } from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { Header } from './components/common/Header';
import { RoleSwitcher } from './components/common/RoleSwitcher';
import { CustomerMenuView } from './components/menu/CustomerMenuView';
import { KitchenKdsView } from './components/kitchen/KitchenKdsView';
import { WaiterFloorView } from './components/staff/WaiterFloorView';
import { RestaurantAdminView } from './components/admin/RestaurantAdminView';
import { SuperAdminView } from './components/superadmin/SuperAdminView';
import { TableStandStudio } from './components/stand/TableStandStudio';

const MainAppContent: React.FC = () => {
  const {
    currentRole,
    setIsCartDrawerOpen,
    simulateQrScan,
    setCurrentTenantId,
    setCurrentTableId,
    setCurrentRole,
    tenants,
    platformSettings,
  } = useRestaurant();

  // Handle URL query parameters for simulated QR scans
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const tenantSlug = params.get('tenant');
    const tableId = params.get('table');

    if (token) {
      simulateQrScan(token);
    } else if (tenantSlug) {
      const match = tenants.find((t) => t.slug === tenantSlug);
      if (match) setCurrentTenantId(match.id);
      if (tableId) setCurrentTableId(tableId);
      setCurrentRole('customer');
    }
  }, [simulateQrScan, tenants, setCurrentTenantId, setCurrentTableId, setCurrentRole]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F2] w-full max-w-full overflow-x-hidden">
      {/* 1. Developer / Tester Role Switcher Strip */}
      <RoleSwitcher />

      {/* 2. Top Navigation Bar conforming to 3-zone contract */}
      <Header onOpenCart={() => setIsCartDrawerOpen(true)} />

      {/* 2b. Broadcast Announcement Banner if enabled by Super Admin */}
      {platformSettings.announcement.enabled && platformSettings.announcement.message && (
        <div className="bg-[#E3792F] text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2 shadow-xs animate-in fade-in w-full max-w-full">
          <span className="font-bold uppercase tracking-wider text-[10px] bg-black/20 px-1.5 py-0.5 rounded">
            Platform Notice
          </span>
          <span className="truncate">{platformSettings.announcement.message}</span>
        </div>
      )}

      {/* 3. Role Viewport */}
      <main className="flex-1 w-full max-w-full min-w-0">
        {currentRole === 'customer' && <CustomerMenuView />}
        {currentRole === 'qr_stand' && <TableStandStudio />}
        {currentRole === 'kitchen' && <KitchenKdsView />}
        {currentRole === 'waiter' && <WaiterFloorView />}
        {currentRole === 'restaurant_admin' && <RestaurantAdminView />}
        {currentRole === 'super_admin' && <SuperAdminView />}
      </main>

      {/* 4. Elegant Footer */}
      <footer className="bg-[#1E231F] text-neutral-400 text-xs py-8 px-4 border-t border-neutral-800 w-full max-w-full overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white glinster-font text-base">AuraDine</span>
            <span>·</span>
            <span>Premium Contactless Dining & Kitchen Operations SaaS</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-neutral-400">
            <span>Powered by Supabase Multi-Tenant Engine</span>
            <span>·</span>
            <span>WCAG 2.2 AA Compliant</span>
            <span>·</span>
            <span>© 2026 AuraDine</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <RestaurantProvider>
      <MainAppContent />
    </RestaurantProvider>
  );
}
