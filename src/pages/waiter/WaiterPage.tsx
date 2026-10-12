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
  Radio,
  Check,
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
  } = useRestaurant();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<ServiceRequestType | 'all'>('all');

  // Incoming calling bell flash alert banner state
  const [incomingCallAlert, setIncomingCallAlert] = useState<{
    request: ServiceRequest;
    timestamp: number;
  } | null>(null);

  const seenRequestIdsRef = useRef<Set<string>>(new Set());
  const initialLoadedRef = useRef<boolean>(false);

  // Filter service requests for this tenant (resilient matching across tenant ID, slug, or assigned staff)
  const tenantRequests = useMemo(() => {
    return serviceRequests.filter((r) => {
      if (!r) return false;
      return (
        r.tenantId === currentTenant.id ||
        r.tenantId === currentTenant.slug ||
        (currentStaffUser && r.tenantId === currentStaffUser.tenantId) ||
        !r.tenantId
      );
    });
  }, [serviceRequests, currentTenant.id, currentTenant.slug, currentStaffUser]);

  const openRequests = useMemo(() => {
    return tenantRequests.filter((r) => r.status !== 'resolved');
  }, [tenantRequests]);

  const displayedRequests = useMemo(() => {
    if (filterType === 'all') return openRequests;
    return openRequests.filter((r) => r.type === filterType);
  }, [openRequests, filterType]);

  // Ready orders waiting for waiter delivery
  const readyOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        (o.tenantId === currentTenant.id ||
          o.tenantId === currentTenant.slug ||
          (currentStaffUser && o.tenantId === currentStaffUser.tenantId) ||
          !o.tenantId) &&
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
    openRequests.forEach((req) => {
      if (!seenRequestIdsRef.current.has(req.id)) {
        seenRequestIdsRef.current.add(req.id);
        newCalls.push(req);
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

  return (
    <div className="min-h-screen bg-[#FAF8F2] p-3 sm:p-6 pb-24">
      <div className="max-w-7xl mx-auto space-y-5">
        
        {/* Top Header Card */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-neutral-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#30673A] text-white shadow-2xs">
                Live Floor Operations
              </span>
              <span className="text-xs text-neutral-500 font-semibold">· {currentTenant.name}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1E231F] glinster-font mt-1">
              Waiter Service Portal
            </h1>
            {currentStaffUser ? (
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-neutral-600">
                <span className="font-bold text-[#30673A] flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  {currentStaffUser.name}
                </span>
                <span className="text-neutral-400 font-mono text-[11px]">@{currentStaffUser.username}</span>
                {currentStaffUser.station && (
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                    {currentStaffUser.station}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                <span>Demo floor server view</span>
                <Link
                  to={`/staff-login?hotel=${encodeURIComponent(currentTenant.name)}`}
                  className="text-[#30673A] hover:underline font-bold text-[11px] inline-flex items-center gap-1"
                >
                  <span>Sign In with Staff ID</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 self-start lg:self-auto">
            {/* Live Cloud Sync Pill */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Cloud Sync Live</span>
            </div>

            {/* Manual Sync Button */}
            <button
              type="button"
              disabled={isRefreshing}
              onClick={async () => {
                setIsRefreshing(true);
                await refreshCloudOrders();
                setTimeout(() => setIsRefreshing(false), 600);
              }}
              className="px-3 py-2 rounded-2xl bg-[#FAF8F2] hover:bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs active:scale-95"
              title="Fetch latest table calls from cloud"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#30673A]' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Sync'}</span>
            </button>

            {/* Test Chime Button */}
            <button
              type="button"
              onClick={() => {
                waiterAlert.init();
                waiterAlert.playWaiterCallChime();
              }}
              className="px-3 py-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-800 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Test Table Calling Chime"
            >
              <BellRing className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Test Chime</span>
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => {
                waiterAlert.init();
                setSoundEnabled(!soundEnabled);
              }}
              className="px-3 py-2 rounded-2xl bg-[#FAF8F2] hover:bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Toggle Call Bell Sound"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Chime: ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="hidden sm:inline">Chime: OFF</span>
                </>
              )}
            </button>

            <LogoutButton label="Sign Out" />
          </div>
        </div>

        {/* Incoming Calling Bell Flash Alert Banner */}
        {incomingCallAlert && (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-[#E3792F] shadow-xl shadow-[#E3792F]/10 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3 duration-300">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-[#E3792F] text-white flex items-center justify-center font-bold shadow-md shadow-[#E3792F]/20 shrink-0 animate-bounce">
                <BellRing className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider text-white bg-[#E3792F] px-2 py-0.5 rounded-full">
                    Table Calling Now!
                  </span>
                  <span className="text-sm font-extrabold text-[#1E231F]">
                    {incomingCallAlert.request.tableNumber}
                  </span>
                  <span className="text-xs text-neutral-400">·</span>
                  <span className="text-xs font-bold text-[#E3792F]">
                    {getRequestMeta(incomingCallAlert.request.type).label}
                  </span>
                </div>
                <p className="text-xs text-neutral-700 font-semibold mt-0.5 truncate">
                  {incomingCallAlert.request.note ? (
                    <span>Customer note: &quot;{incomingCallAlert.request.note}&quot;</span>
                  ) : (
                    <span>{getRequestMeta(incomingCallAlert.request.type).fullTitle}</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleClaim(incomingCallAlert.request.id)}
                className="px-4 py-2.5 rounded-2xl bg-[#30673A] hover:bg-[#204828] text-white text-xs font-extrabold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Claim Table</span>
              </button>
              <button
                type="button"
                onClick={() => setIncomingCallAlert(null)}
                className="p-2.5 rounded-2xl text-neutral-400 hover:text-neutral-700 hover:bg-black/5 transition-colors cursor-pointer"
                aria-label="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 1. Pass Counter: Hot Dishes Ready for Table Delivery from Kitchen */}
        {readyOrders.length > 0 && (
          <div className="p-4 sm:p-5 rounded-3xl bg-sky-500/10 border border-sky-500/30 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-sky-700 animate-pulse" />
                <h2 className="text-xs sm:text-sm font-extrabold text-sky-800 uppercase tracking-wider">
                  Kitchen Pass: Plated & Ready for Delivery ({readyOrders.length})
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {readyOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 bg-white rounded-2xl border border-sky-200/80 shadow-xs flex flex-col justify-between gap-3 hover:border-sky-400 transition-colors"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-mono font-black text-sky-700">
                        {ord.orderNumber}
                      </span>
                      <span className="text-xs font-extrabold bg-[#E9E9C7] text-[#1E231F] px-2.5 py-0.5 rounded-lg border border-neutral-300">
                        {ord.tableNumber}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-700 font-medium mt-2 line-clamp-2">
                      {ord.items.map((i) => `${i.quantity}× ${i.itemName}`).join(', ')}
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
                    <span>Delivered to Guest</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Customer Calling Bells & Service Requests */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#E3792F]/10 flex items-center justify-center text-[#E3792F]">
                <Bell className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-black text-[#1E231F] glinster-font">
                Active Table Calling Bells ({openRequests.length})
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
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
          </div>

          {displayedRequests.length === 0 ? (
            <div className="text-center py-14 bg-white rounded-3xl border border-neutral-200/80 p-8 shadow-xs flex flex-col items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-[#30673A] mx-auto mb-2" />
              <h3 className="text-base font-black text-[#1E231F] glinster-font">
                All Tables Attended!
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-4">
                No customer calling bells are currently waiting in this queue. When diners scan and ring their bell on their phone, it will alert you here immediately.
              </p>
              <button
                type="button"
                disabled={isRefreshing}
                onClick={async () => {
                  setIsRefreshing(true);
                  await refreshCloudOrders();
                  setTimeout(() => setIsRefreshing(false), 600);
                }}
                className="px-4 py-2 rounded-2xl bg-[#FAF8F2] hover:bg-neutral-100 border border-neutral-300 text-neutral-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-2xs"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#30673A]' : ''}`} />
                <span>Check for Calling Bells from Cloud</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedRequests.map((req) => {
                const meta = getRequestMeta(req.type);
                const Icon = meta.icon;
                const isClaimed = req.status === 'in_progress';
                const minutesAgo = Math.floor(
                  (Date.now() - new Date(req.createdAt).getTime()) / 60000
                );
                const isOverdue = minutesAgo >= 4 && !isClaimed;

                return (
                  <div
                    key={req.id}
                    className={`p-5 rounded-3xl bg-white border-2 shadow-sm flex flex-col justify-between gap-4 transition-all hover:shadow-md ${
                      req.type === 'urgent'
                        ? 'border-red-400 bg-red-50/20'
                        : isOverdue
                        ? 'border-[#E3792F] bg-amber-50/20'
                        : isClaimed
                        ? 'border-emerald-300 bg-emerald-50/10'
                        : 'border-[#30673A]/25'
                    }`}
                  >
                    <div>
                      {/* Top Bar: Table Number + Time Elapsed */}
                      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black px-3 py-1 rounded-xl bg-[#1E231F] text-white shadow-2xs">
                            {req.tableNumber}
                          </span>
                          {isOverdue && (
                            <span className="text-[10px] font-black uppercase text-red-600 bg-red-100 px-2 py-0.5 rounded-full animate-pulse">
                              Overdue
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 text-xs font-mono font-semibold text-neutral-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{minutesAgo < 1 ? 'Just now' : `${minutesAgo}m ago`}</span>
                        </div>
                      </div>

                      {/* Request Header */}
                      <div className="flex items-start gap-3 mt-3.5">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${meta.bg}`}
                        >
                          <Icon className={`w-5 h-5 ${meta.color}`} />
                        </div>
                        <div>
                          <div className="text-xs font-black uppercase tracking-wider text-neutral-400">
                            Customer Call
                          </div>
                          <h3 className="text-base font-extrabold text-[#1E231F] leading-tight">
                            {meta.fullTitle}
                          </h3>
                        </div>
                      </div>

                      {/* Customer Note Callout (Whatever customer asked) */}
                      {req.note ? (
                        <div className="mt-3 p-3 rounded-2xl bg-[#FAF8F2] border border-neutral-200/90 text-xs">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-0.5">
                            Customer Requested:
                          </span>
                          <p className="text-neutral-800 font-semibold italic text-[12.5px]">
                            &quot;{req.note}&quot;
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3 p-2.5 rounded-2xl bg-neutral-50 text-[11.5px] text-neutral-500 font-medium">
                          Standard table service requested by guest.
                        </div>
                      )}

                      {/* Attended Status Tag */}
                      {isClaimed && (
                        <div className="mt-3 text-xs text-emerald-800 font-bold bg-emerald-100/70 border border-emerald-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4 text-emerald-700" />
                          <span>Being attended by {req.claimedByStaff}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-neutral-100 flex items-center gap-2">
                      {!isClaimed ? (
                        <button
                          type="button"
                          onClick={() => handleClaim(req.id)}
                          className="flex-1 py-3 px-4 rounded-2xl bg-[#E3792F] hover:bg-[#c96420] text-white text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Claim Table</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleResolve(req.id)}
                          className="flex-1 py-3 px-4 rounded-2xl bg-[#30673A] hover:bg-[#204828] text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Resolve & Close</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Floor Plan / Active Tables Overview */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[#1E231F] glinster-font">
              Floor Plan & Table Occupancy
            </h2>
            <span className="text-xs text-neutral-500 font-medium">
              {tables.length} tables registered
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
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
                  className={`p-3.5 rounded-2xl bg-white border shadow-2xs flex flex-col justify-between gap-2.5 transition-all ${
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
                    <div className="text-[10.5px] text-neutral-400 font-medium">
                      Cap: {t.capacity} guests
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[10.5px]">
                    {callingRequest ? (
                      <span className="font-extrabold text-[#E3792F] flex items-center gap-1 animate-pulse">
                        <Bell className="w-3.5 h-3.5" />
                        Paging ({callingRequest.type})
                      </span>
                    ) : activeTableOrder ? (
                      <span className="font-extrabold text-[#30673A] capitalize">
                        {activeTableOrder.status}
                      </span>
                    ) : (
                      <span className="text-neutral-400 font-medium">Available</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
