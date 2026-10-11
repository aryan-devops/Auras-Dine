import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { ThemeInjector } from './components/common/ThemeInjector';
import { Dashboard } from './pages/Dashboard';
import { CustomerPage } from './pages/customer/CustomerPage';
import { CustomerAuthPage } from './pages/customer/CustomerAuthPage';
import { KitchenPage } from './pages/kitchen/KitchenPage';
import { WaiterPage } from './pages/waiter/WaiterPage';
import { AdminPage } from './pages/admin/AdminPage';
import { SuperAdminView } from './components/superadmin/SuperAdminView';
import { TableStandStudio } from './components/stand/TableStandStudio';
import { OnboardingFlow } from './components/auth/OnboardingFlow';
import { RestaurantAdminLogin } from './pages/auth/RestaurantAdminLogin';

const MainAppContent: React.FC = () => {
  const {
    currentRole,
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
    <ThemeInjector>
      <div className="min-h-screen flex flex-col bg-[#FAF8F2] w-full max-w-full overflow-x-hidden">
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
          <Routes>
            <Route path="/admin-login" element={<RestaurantAdminLogin />} />
            <Route path="/:tenantSlug/:tableId/auth" element={<CustomerAuthPage />} />
            <Route path="/:tenantSlug/menu" element={<CustomerPage />} />
            <Route path="/restaurant/:tenantSlug/table/:tableId/auth" element={<CustomerAuthPage />} />
            <Route path="/restaurant/:tenantSlug/menu" element={<CustomerPage />} />
            <Route path="/customer" element={<CustomerPage />} />
            <Route path="/kitchen" element={<KitchenPage />} />
            <Route path="/waiter" element={<WaiterPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/superadmin" element={<SuperAdminView />} />
            <Route path="/qr-stand" element={<TableStandStudio />} />
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </ThemeInjector>
  );
};

export default function App() {
  return (
    <Router>
        <RestaurantProvider>
        <MainAppContent />
        </RestaurantProvider>
    </Router>
  );
}
