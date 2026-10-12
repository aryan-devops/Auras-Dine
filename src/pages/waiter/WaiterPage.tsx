import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Droplets,
  Receipt,
  Sparkles,
  AlertCircle,
  ChefHat,
  UserCheck,
  ArrowRight,
  BellRing,
  Volume2,
  VolumeX,
  RotateCw,
  X,
  Clock,
  Check,
  Layers,
  LayoutGrid,
  CheckCheck,
  Trash2,
} from 'lucide-react';
import { ServiceRequest, ServiceRequestType } from '../../types';
import { useRestaurant } from '../../context/RestaurantContext';
import { LogoutButton } from '../../components/auth/LogoutButton';
import { waiterAlert } from '../../lib/audioAlert';

export const WaiterPage: React.FC = () => {
  const {
    currentTenant,
    tables,
    serviceRequests,
    claimServiceRequest,
    resolveServiceRequest,
    orders,
    updateOrderStatus,
    currentStaffUser,
    refreshCloudOrders,
    clearAllServiceRequests,
  } = useRestaurant();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClearingCalls, setIsClearingCalls] = useState(false);
  const [filterType, setFilterType] = useState<ServiceRequestType | 'all'>('all');
  const [activeMobileView, setActiveMobileView] = useState<'calls' | 'kitchen' | 'tables'>('calls');

  // Incoming calling bell flash alert banner state
  const [incomingCallAlert, setIncomingCallAlert] = useState<{
    request: ServiceRequest;
    timestamp: number;
  } | null>(null);

  const seenRequestIdsRef = useRef<Set<string>>(new Set());
  const initialLoadedRef = useRef<boolean>(false);

  // Filter service requests strictly for this tenant (no leaky !r.tenantId)
  const tenantRequests = useMemo(() => {
    return serviceRequests.filter((r) => {
      if (!r) return false;
      return (
        r.tenantId === currentTenant.id ||
        r.tenantId === currentTenant.slug ||
        (currentStaffUser && r.tenantId === currentStaffUser.tenantId)
      );
    });
  }, [serviceRequests, currentTenant.id, currentTenant.slug, currentStaffUser]);

  // Strict deduplication of open requests:
  // If a table has multiple requests of the same type, keep ONLY the latest one.
  const openRequests = useMemo(() => {
    const raw = tenantRequests.filter((r) => r.status !== 'resolved');
    const sorted = [...raw].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const seenKeys = new Set<string>();
    const deduplicated: ServiceRequest[] = [];

    for (const req of sorted) {
      const tableNorm = (req.tableNumber || req.tableId || 'table').toLowerCase().replace(/\s+/g, '');
      const key = `${tableNorm}_${req.type}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        deduplicated.push(req);
      }
    }
    return deduplicated;
  }, [tenantRequests]);

  const displayedRequests = useMemo(() => {
    if (filterType === 'all') return openRequests;
    return openRequests.filter((r) => r.type === filterType);
  }, [openRequests, filterType]);

  // Ready orders waiting for waiter delivery (strictly scoped to current tenant)
  const readyOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        (o.tenantId === currentTenant.id ||
          o.tenantId === currentTenant.slug ||
          (currentStaffUser && o.tenantId === currentStaffUser.tenantId)) &&
        o.status === 'ready'
    );
  }, [orders, currentTenant.id, currentTenant.slug, currentStaffUser]);

  // Unlock audio on initial user touch/click
  useEffect(() => {
    const handleInteraction = () => {
      waiterAlert.init();
    };
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  // Listen for newly arriving open calling bells in real-time and sound the waiter chime
  useEffect(() => {
    if (!initialLoadedRef.current) {
      openRequests.forEach((r) => seenRequestIdsRef.current.add(r.id));
      initialLoadedRef.current = true;
      return;
    }

    const newCalls: ServiceRequest[] = [];
    const now = Date.now();
    openRequests.forEach((req) => {
      if (!seenRequestIdsRef.current.has(req.id)) {
        seenRequestIdsRef.current.add(req.id);
        const ageMs = now - new Date(req.createdAt).getTime();
        // ONLY trigger audio chime & banner for fresh calls placed within the last 90 seconds
        if (ageMs < 90000) {
          newCalls.push(req);
        }
      }
    });

    if (newCalls.length > 0) {
      const latestCall = newCalls[0];

      if (soundEnabled) {
        waiterAlert.init();
        waiterAlert.playWaiterCallChime();
        if (navigator.vibrate) {
          navigator.vibrate([250, 100, 250]);
        }
      }

      setIncomingCallAlert({
        request: latestCall,
        timestamp: Date.now(),
      });
    }
  }, [openRequests, soundEnabled]);

  // Helper for request display metadata
  const getRequestMeta = (type: ServiceRequestType) => {
    switch (type) {
      case 'waiter':
        return {
          label: 'Waiter Call',
          fullTitle: 'Table Assistance / Questions',
          icon: Bell,
          color: 'text-[#30673A]',
          bg: 'bg-[#30673A]/10 border-[#30673A]/30',
          badge: 'bg-[#30673A] text-white',
        };
      case 'water':
        return {
          label: 'Water Refill',
          fullTitle: 'Fresh Water Pitcher Request',
          icon: Droplets,
          color: 'text-[#0284C7]',
          bg: 'bg-[#0284C7]/10 border-[#0284C7]/30',
          badge: 'bg-[#0284C7] text-white',
        };
      case 'bill':
        return {
          label: 'Request Bill',
          fullTitle: 'Check / Bill Payment Ready',
          icon: Receipt,
          color: 'text-[#E3792F]',
          bg: 'bg-[#E3792F]/10 border-[#E3792F]/30',
          badge: 'bg-[#E3792F] text-white',
        };
      case 'clean':
        return {
          label: 'Table Tidy',
          fullTitle: 'Clear Dishes & Extra Cutlery',
          icon: Sparkles,
          color: 'text-[#8B5CF6]',
          bg: 'bg-[#8B5CF6]/10 border-[#8B5CF6]/30',
          badge: 'bg-[#8B5CF6] text-white',
        };
      case 'urgent':
        return {
          label: 'Urgent Help',
          fullTitle: 'Urgent Staff Attention Needed',
          icon: AlertCircle,
          color: 'text-[#DC2626]',
          bg: 'bg-red-500/15 border-red-500/40',
          badge: 'bg-[#DC2626] text-white',
        };
      default:
        return {
          label: 'Service Call',
          fullTitle: 'Customer Table Assistance',
          icon: Bell,
          color: 'text-neutral-700',
          bg: 'bg-neutral-100 border-neutral-300',
          badge: 'bg-neutral-700 text-white',
        };
    }
  };

  const handleClaim = (requestId: string) => {
    const serverName = currentStaffUser ? currentStaffUser.name : 'Floor Server';
    claimServiceRequest(requestId, serverName);
    if (incomingCallAlert?.request.id === requestId) {
      setIncomingCallAlert(null);
    }
  };

  const handleResolve = (requestId: string) => {
    resolveServiceRequest(requestId);
    if (incomingCallAlert?.request.id === requestId) {
      setIncomingCallAlert(null);
    }
  };

  // Resolve all open calling bells for a table with one tap
  const handleResolveAllForTable = (tableIdentifier: string) => {
    const norm = tableIdentifier.toLowerCase().replace(/\s+/g, '');
    const toResolve = tenantRequests.filter((r) => {
      if (r.status === 'resolved') return false;
      const rNorm = (r.tableNumber || r.tableId || '').toLowerCase().replace(/\s+/g, '');
      return rNorm === norm || r.tableId === tableIdentifier;
    });
    toResolve.forEach((r) => resolveServiceRequest(r.id));
    if (
      incomingCallAlert &&
      ((incomingCallAlert.request.tableNumber || '').toLowerCase().replace(/\s+/g, '') === norm ||
        incomingCallAlert.request.tableId === tableIdentifier)
    ) {
      setIncomingCallAlert(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F2] w-full max-w-full overflow-x-hidden p-2.5 sm:p-5 pb-24">
      <div className="max-w-5xl mx-auto space-y-3.5 sm:space-y-5">
        
        {/* Mobile-First Header Bar */}
        <header className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-neutral-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2.5 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#30673A] text-white">
                  Floor Service
                </span>
                <span className="text-xs text-neutral-500 font-semibold truncate">
                  · {currentTenant.name}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-[#1E231F] glinster-font tracking-tight mt-0.5">
                Waiter Service Portal
              </h1>
              {currentStaffUser ? (
                <div className="flex items-center gap-2 text-xs text-neutral-600 mt-0.5 truncate">
                  <span className="font-bold text-[#30673A] flex items-center gap-1 truncate">
                    <UserCheck className="w-3.5 h-3.5 shrink-0" />
                    {currentStaffUser.name}
                  </span>
                  <span className="text-neutral-400 font-mono text-[11px]">
                    @{currentStaffUser.username}
                  </span>
                  {currentStaffUser.station && (
                    <span className="hidden sm:inline bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {currentStaffUser.station}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-0.5">
                  <span>Demo Mode</span>
                  <Link
                    to={`/staff-login?hotel=${encodeURIComponent(currentTenant.name)}`}
                    className="text-[#30673A] hover:underline font-bold inline-flex items-center gap-0.5"
                  >
                    <span>Login</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions (Audio, Test Chime, Sync, Logout) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Sync Button */}
              <button
                type="button"
                disabled={isRefreshing}
                onClick={async () => {
                  setIsRefreshing(true);
                  await refreshCloudOrders();
                  setTimeout(() => setIsRefreshing(false), 500);
                }}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#FAF8F2] hover:bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 shadow-2xs"
                title="Sync from cloud"
                aria-label="Sync from cloud"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#30673A]' : ''}`} />
                <span className="hidden md:inline">{isRefreshing ? 'Syncing...' : 'Sync'}</span>
              </button>

              {/* Test Chime Button */}
              <button
                type="button"
                onClick={() => {
                  waiterAlert.init();
                  waiterAlert.playWaiterCallChime();
                }}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-800 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                title="Test Chime Sound"
                aria-label="Test Chime Sound"
              >
                <BellRing className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden md:inline">Test</span>
              </button>

              {/* Sound Toggle */}
              <button
                type="button"
                onClick={() => {
                  waiterAlert.init();
                  setSoundEnabled(!soundEnabled);
                }}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#FAF8F2] hover:bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-700 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                title="Toggle Chime Sound"
                aria-label="Toggle Chime Sound"
              >
                {soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                )}
                <span className="hidden md:inline">{soundEnabled ? 'Chime ON' : 'Muted'}</span>
              </button>

              {/* Purge / Clear All Calls */}
              <button
                type="button"
                disabled={isClearingCalls || openRequests.length === 0}
                onClick={async () => {
                  if (window.confirm(`Clear all table calls for ${currentTenant.name}?`)) {
                    setIsClearingCalls(true);
                    await clearAllServiceRequests(true);
                    seenRequestIdsRef.current.clear();
                    setIncomingCallAlert(null);
                    setIsClearingCalls(false);
                  }
                }}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-bold text-red-600 flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                title="Clear all calls"
                aria-label="Clear all calls"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{isClearingCalls ? 'Clearing...' : 'Clear Calls'}</span>
              </button>

              <LogoutButton label="Exit" className="p-2 sm:px-3 sm:py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition-colors cursor-pointer" />
            </div>
          </div>

          {/* Mobile Tab Switcher: Calling Bells / Kitchen Ready Pass / Tables */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#FAF8F2] rounded-xl border border-neutral-200/80">
            <button
              type="button"
              onClick={() => setActiveMobileView('calls')}
              className={`py-2 px-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMobileView === 'calls'
                  ? 'bg-[#30673A] text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Calls</span>
              <span
                className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-mono flex items-center justify-center font-bold ${
                  activeMobileView === 'calls' ? 'bg-white/25 text-white' : 'bg-neutral-200 text-neutral-700'
                }`}
              >
                {openRequests.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMobileView('kitchen')}
              className={`py-2 px-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMobileView === 'kitchen'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Pass</span>
              <span
                className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-mono flex items-center justify-center font-bold ${
                  activeMobileView === 'kitchen' ? 'bg-white/25 text-white' : 'bg-neutral-200 text-neutral-700'
                }`}
              >
                {readyOrders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMobileView('tables')}
              className={`py-2 px-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMobileView === 'tables'
                  ? 'bg-[#1E231F] text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Tables</span>
              <span
                className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-mono flex items-center justify-center font-bold ${
                  activeMobileView === 'tables' ? 'bg-white/25 text-white' : 'bg-neutral-200 text-neutral-700'
                }`}
              >
                {tables.length}
              </span>
            </button>
          </div>
        </header>

        {/* Incoming Calling Bell Real-Time Flash Alert Banner */}
        {incomingCallAlert && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-[#E3792F] shadow-lg shadow-[#E3792F]/15 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#E3792F] text-white flex items-center justify-center shrink-0 shadow-xs animate-bounce">
                <BellRing className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black uppercase text-white bg-[#E3792F] px-1.5 py-0.2 rounded-full">
                    Calling Now
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-[#1E231F]">
                    {incomingCallAlert.request.tableNumber}
                  </span>
                  <span className="text-xs text-neutral-400">·</span>
                  <span className="text-xs font-bold text-[#E3792F] truncate">
                    {getRequestMeta(incomingCallAlert.request.type).label}
                  </span>
                </div>
                <p className="text-[11.5px] text-neutral-700 font-semibold truncate mt-0.5">
                  {incomingCallAlert.request.note
                    ? `"${incomingCallAlert.request.note}"`
                    : getRequestMeta(incomingCallAlert.request.type).fullTitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleClaim(incomingCallAlert.request.id)}
                className="py-1.5 px-3 rounded-xl bg-[#30673A] hover:bg-[#204828] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Claim</span>
              </button>
              <button
                type="button"
                onClick={() => setIncomingCallAlert(null)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-black/5"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* VIEW 1: ACTIVE CALLING BELLS */}
        {activeMobileView === 'calls' && (
          <div className="space-y-3">
            {/* Horizontal Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 w-full min-w-0">
              {[
                { id: 'all', label: 'All', count: openRequests.length },
                { id: 'waiter', label: 'Waiter', count: openRequests.filter((r) => r.type === 'waiter').length },
                { id: 'water', label: 'Water', count: openRequests.filter((r) => r.type === 'water').length },
                { id: 'bill', label: 'Bill', count: openRequests.filter((r) => r.type === 'bill').length },
                { id: 'clean', label: 'Cutlery/Clean', count: openRequests.filter((r) => r.type === 'clean').length },
                { id: 'urgent', label: 'Urgent', count: openRequests.filter((r) => r.type === 'urgent').length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterType(tab.id as ServiceRequestType | 'all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    filterType === tab.id
                      ? 'bg-[#30673A] text-white shadow-xs'
                      : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      filterType === tab.id ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {displayedRequests.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200/90 p-6 shadow-xs flex flex-col items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-[#30673A] mx-auto mb-2" />
                <h3 className="text-base font-bold text-[#1E231F] glinster-font">
                  All Table Calls Clear!
                </h3>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-1 mb-4">
                  No guest calls are waiting in this category. New rings from customer phones will pop up here with instant chimes.
                </p>
                <button
                  type="button"
                  disabled={isRefreshing}
                  onClick={async () => {
                    setIsRefreshing(true);
                    await refreshCloudOrders();
                    setTimeout(() => setIsRefreshing(false), 500);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#FAF8F2] hover:bg-neutral-100 border border-neutral-300 text-neutral-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-2xs"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#30673A]' : ''}`} />
                  <span>Check Cloud for Table Calls</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {displayedRequests.map((req) => {
                  const meta = getRequestMeta(req.type);
                  const Icon = meta.icon;
                  const isClaimed = req.status === 'in_progress';
                  const minutesAgo = Math.floor(
                    (Date.now() - new Date(req.createdAt).getTime()) / 60000
                  );
                  const isOverdue = minutesAgo >= 3 && !isClaimed;

                  return (
                    <div
                      key={req.id}
                      className={`p-4 rounded-2xl bg-white border-2 shadow-xs flex flex-col justify-between gap-3 transition-all ${
                        req.type === 'urgent'
                          ? 'border-red-400 bg-red-50/15'
                          : isOverdue
                          ? 'border-[#E3792F] bg-amber-50/15'
                          : isClaimed
                          ? 'border-emerald-300 bg-emerald-50/10'
                          : 'border-[#30673A]/20'
                      }`}
                    >
                      <div>
                        {/* Card Top: Table Number + Time Ago */}
                        <div className="flex items-center justify-between pb-2.5 border-b border-neutral-100">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-[#1E231F] text-white">
                              {req.tableNumber}
                            </span>
                            {isOverdue && (
                              <span className="text-[10px] font-black uppercase text-red-600 bg-red-100 px-2 py-0.5 rounded-full animate-pulse">
                                Overdue
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-neutral-500">
                            <Clock className="w-3 h-3" />
                            <span>{minutesAgo < 1 ? 'Just now' : `${minutesAgo}m ago`}</span>
                          </div>
                        </div>

                        {/* Title & Icon */}
                        <div className="flex items-start gap-2.5 mt-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${meta.bg}`}
                          >
                            <Icon className={`w-4 h-4 ${meta.color}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                              Guest Call
                            </div>
                            <h3 className="text-sm font-extrabold text-[#1E231F] leading-tight truncate">
                              {meta.fullTitle}
                            </h3>
                          </div>
                        </div>

                        {/* Note callout box */}
                        {req.note ? (
                          <div className="mt-2.5 p-2.5 rounded-xl bg-[#FAF8F2] border border-neutral-200/90 text-xs">
                            <span className="text-[9.5px] font-bold text-neutral-400 uppercase tracking-wider block">
                              Guest Request Note:
                            </span>
                            <p className="text-neutral-800 font-semibold italic text-xs mt-0.5">
                              &quot;{req.note}&quot;
                            </p>
                          </div>
                        ) : (
                          <div className="mt-2.5 p-2 rounded-xl bg-neutral-50 text-[11px] text-neutral-500">
                            Standard table service requested.
                          </div>
                        )}

                        {/* Claimed by status */}
                        {isClaimed && (
                          <div className="mt-2 text-xs text-emerald-800 font-bold bg-emerald-100/70 border border-emerald-300 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                            <span className="truncate">Attended by {req.claimedByStaff}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons: Claim, Resolve, Clear All */}
                      <div className="pt-2.5 border-t border-neutral-100 flex items-center gap-1.5">
                        {!isClaimed ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleClaim(req.id)}
                              className="flex-1 py-2.5 px-3 rounded-xl bg-[#E3792F] hover:bg-[#c96420] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Claim Call</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResolveAllForTable(req.tableNumber)}
                              className="py-2.5 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-colors cursor-pointer"
                              title="Resolve all calls for this table"
                            >
                              Done
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleResolve(req.id)}
                            className="w-full py-2.5 px-3 rounded-xl bg-[#30673A] hover:bg-[#204828] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Mark Resolved & Closed</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: KITCHEN PASS (Ready to deliver to guests) */}
        {activeMobileView === 'kitchen' && (
          <div className="space-y-3">
            {readyOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200/90 p-6 shadow-xs flex flex-col items-center justify-center">
                <ChefHat className="w-10 h-10 text-sky-600 mx-auto mb-2" />
                <h3 className="text-base font-bold text-[#1E231F] glinster-font">
                  No Food Waiting on Pass Counter
                </h3>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-1">
                  When chefs plate orders in the kitchen and hit &quot;Ready to Serve&quot;, tickets will appear here for you to carry to guest tables.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {readyOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 bg-white rounded-2xl border-2 border-sky-300 shadow-xs flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex justify-between items-start pb-2 border-b border-sky-100">
                        <span className="text-xs font-mono font-black text-sky-700">
                          {ord.orderNumber}
                        </span>
                        <span className="text-xs font-black bg-[#1E231F] text-white px-2 py-0.5 rounded-lg">
                          {ord.tableNumber}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-800 font-semibold mt-2.5 space-y-1">
                        {ord.items.map((i) => (
                          <div key={i.id} className="flex items-center gap-1.5">
                            <span className="text-sky-700 font-mono font-bold">{i.quantity}×</span>
                            <span>{i.itemName}</span>
                          </div>
                        ))}
                      </div>
                      {ord.specialNotes && (
                        <div className="mt-2 text-[11px] text-[#E3792F] font-semibold bg-amber-50 p-2 rounded-lg border border-amber-200/60">
                          Note: {ord.specialNotes}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => updateOrderStatus(ord.id, 'completed', 'Server delivered to table')}
                      className="w-full py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-[0.98] cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Delivered to Table</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: FLOOR OCCUPANCY & TABLES MAP */}
        {activeMobileView === 'tables' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-black text-[#1E231F] uppercase tracking-wider">
                Floor Plan ({tables.length} Tables)
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {tables.map((t) => {
                const activeTableOrder = orders.find(
                  (o) =>
                    o.tableId === t.id &&
                    o.status !== 'completed' &&
                    o.status !== 'cancelled'
                );
                const callingRequest = openRequests.find((r) => r.tableId === t.id);

                return (
                  <div
                    key={t.id}
                    className={`p-3 rounded-xl bg-white border shadow-2xs flex flex-col justify-between gap-2 ${
                      callingRequest
                        ? 'border-[#E3792F] ring-2 ring-[#E3792F]/40 bg-orange-50/30'
                        : activeTableOrder
                        ? 'border-[#30673A] bg-emerald-50/25'
                        : 'border-neutral-200'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black text-[#1E231F]">
                        {t.tableNumber}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        Cap: {t.capacity} guests
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-neutral-100 text-[10.5px]">
                      {callingRequest ? (
                        <span className="font-extrabold text-[#E3792F] flex items-center gap-1 animate-pulse">
                          <Bell className="w-3 h-3" />
                          <span>Call ({callingRequest.type})</span>
                        </span>
                      ) : activeTableOrder ? (
                        <span className="font-extrabold text-[#30673A] capitalize">
                          {activeTableOrder.status}
                        </span>
                      ) : (
                        <span className="text-neutral-400">Available</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
