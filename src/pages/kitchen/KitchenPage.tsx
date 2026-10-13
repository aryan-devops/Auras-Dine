import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Play,
  AlertTriangle,
  Volume2,
  VolumeX,
  Eye,
  UserCheck,
  ArrowRight,
  BellRing,
  X,
  RotateCw,
  Trash2,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { useRestaurant } from '../../context/RestaurantContext';
import { LogoutButton } from '../../components/auth/LogoutButton';
import { kitchenAlert } from '../../lib/audioAlert';

export const KitchenPage: React.FC = () => {
  const { orders, updateOrderStatus, currentTenant, currentStaffUser, refreshCloudOrders, clearAllOrders } = useRestaurant();
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClearingQueue, setIsClearingQueue] = useState(false);

  // Incoming order alert banner state
  const [incomingAlert, setIncomingAlert] = useState<{ order: Order; timestamp: number } | null>(null);
  const seenOrderIdsRef = useRef<Set<string>>(new Set());
  const initialLoadedRef = useRef<boolean>(false);

  // Filter orders strictly for the active tenant (no leaky !o.tenantId)
  const tenantOrders = useMemo(() => {
    return orders.filter((o) => {
      if (!o) return false;
      return (
        o.tenantId === currentTenant.id ||
        o.tenantId === currentTenant.slug ||
        (currentStaffUser && o.tenantId === currentStaffUser.tenantId)
      );
    });
  }, [orders, currentTenant.id, currentTenant.slug, currentStaffUser]);

  // Unlock audio on initial user touch/click
  useEffect(() => {
    const handleInteraction = () => {
      kitchenAlert.init();
    };
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  // Listen for incoming pending orders in real-time and trigger kitchen bell
  useEffect(() => {
    if (!initialLoadedRef.current) {
      tenantOrders.forEach((o) => seenOrderIdsRef.current.add(o.id));
      initialLoadedRef.current = true;
      return;
    }

    const pendingOrders = tenantOrders.filter((o) => o.status === 'pending');
    const newPendingOrders: Order[] = [];
    const now = Date.now();

    pendingOrders.forEach((ord) => {
      if (!seenOrderIdsRef.current.has(ord.id)) {
        seenOrderIdsRef.current.add(ord.id);
        const ageMs = now - new Date(ord.createdAt).getTime();
        // ONLY trigger audio alarm & banner for fresh orders created within the last 90 seconds
        if (ageMs < 90000) {
          newPendingOrders.push(ord);
        }
      }
    });

    if (newPendingOrders.length > 0) {
      if (soundEnabled) {
        kitchenAlert.init();
        kitchenAlert.playKitchenBell();
        if (navigator.vibrate) {
          navigator.vibrate([300, 150, 300]);
        }
      }

      const latest = newPendingOrders[0];
      setIncomingAlert({
        order: latest,
        timestamp: Date.now(),
      });
    }
  }, [tenantOrders, soundEnabled]);

  const displayedOrders = useMemo(() => {
    if (filterStatus === 'all') {
      return tenantOrders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');
    }
    return tenantOrders.filter((o) => o.status === filterStatus);
  }, [tenantOrders, filterStatus]);

  // Order counts
  const pendingCount = tenantOrders.filter((o) => o.status === 'pending').length;
  const preparingCount = tenantOrders.filter((o) => o.status === 'preparing').length;
  const readyCount = tenantOrders.filter((o) => o.status === 'ready').length;

  return (
    <div className="min-h-screen bg-[#141815] text-[#FAF8F5] w-full max-w-full overflow-x-hidden p-2.5 sm:p-5 pb-20">
      <div className="max-w-6xl mx-auto space-y-3.5 sm:space-y-5">
        
        {/* Mobile-First Kitchen Header */}
        <header className="bg-neutral-900/95 border border-neutral-800 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-2.5 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Kitchen KDS
                </span>
                <span className="text-xs text-neutral-400 font-semibold truncate">
                  · {currentTenant.name}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded-full font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black glinster-font text-white tracking-tight mt-0.5">
                Kitchen Display System
              </h1>
              {currentStaffUser ? (
                <div className="flex items-center gap-2 text-xs text-neutral-300 mt-0.5 truncate">
                  <span className="font-bold text-amber-400 flex items-center gap-1 truncate">
                    <UserCheck className="w-3.5 h-3.5 shrink-0" />
                    {currentStaffUser.name}
                  </span>
                  <span className="text-neutral-500 font-mono text-[11px]">
                    @{currentStaffUser.username}
                  </span>
                  {currentStaffUser.station && (
                    <span className="hidden sm:inline bg-neutral-800 text-amber-300 border border-neutral-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {currentStaffUser.station}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-0.5">
                  <span>Demo KDS</span>
                  <Link
                    to={`/staff-login?hotel=${encodeURIComponent(currentTenant.name)}`}
                    className="text-amber-400 hover:underline font-bold inline-flex items-center gap-0.5"
                  >
                    <span>Staff Login</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions (Sync, Test Bell, Bell Mute, Exit) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                disabled={isRefreshing}
                onClick={async () => {
                  setIsRefreshing(true);
                  await refreshCloudOrders();
                  setTimeout(() => setIsRefreshing(false), 500);
                }}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                title="Sync from Cloud"
                aria-label="Sync orders"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
                <span className="hidden md:inline">{isRefreshing ? 'Syncing...' : 'Sync'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  kitchenAlert.init();
                  kitchenAlert.playKitchenBell();
                }}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
                title="Test Kitchen Service Bell"
                aria-label="Test Bell"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Test Bell</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  kitchenAlert.init();
                  setSoundEnabled(!soundEnabled);
                }}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 flex items-center gap-1 transition-colors cursor-pointer"
                title="Toggle Bell Sound"
                aria-label="Toggle Bell"
              >
                {soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-neutral-500" />
                )}
                <span className="hidden md:inline">{soundEnabled ? 'Bell ON' : 'Muted'}</span>
              </button>

              {/* Purge / Clear Stale Test Tickets */}
              <button
                type="button"
                disabled={isClearingQueue || tenantOrders.length === 0}
                onClick={async () => {
                  if (window.confirm(`Clear all ${currentTenant.name} kitchen tickets and purge queue?`)) {
                    setIsClearingQueue(true);
                    await clearAllOrders(true);
                    seenOrderIdsRef.current.clear();
                    setIncomingAlert(null);
                    setIsClearingQueue(false);
                  }
                }}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-bold text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                title="Purge Test Tickets"
                aria-label="Purge Test Tickets"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{isClearingQueue ? 'Clearing...' : 'Clear Queue'}</span>
              </button>

              <LogoutButton label="Exit" className="p-2 sm:px-3 sm:py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-bold transition-colors cursor-pointer" />
            </div>
          </div>

          {/* Mobile Status Segmented Slider */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-black/40 rounded-xl border border-neutral-800/80">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
                filterStatus === 'all'
                  ? 'bg-neutral-700 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>All</span>
              <span className="font-mono text-[10px] opacity-80">
                ({pendingCount + preparingCount + readyCount})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('pending')}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
                filterStatus === 'pending'
                  ? 'bg-[#0a7350] text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>Pending</span>
              <span className="w-4 h-4 rounded-full bg-black/40 text-[10px] flex items-center justify-center font-mono">
                {pendingCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('preparing')}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
                filterStatus === 'preparing'
                  ? 'bg-[#07543a] text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>Cooking</span>
              <span className="w-4 h-4 rounded-full bg-black/40 text-[10px] flex items-center justify-center font-mono">
                {preparingCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('ready')}
              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer truncate ${
                filterStatus === 'ready'
                  ? 'bg-[#0284C7] text-white shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>Ready</span>
              <span className="w-4 h-4 rounded-full bg-black/40 text-[10px] flex items-center justify-center font-mono">
                {readyCount}
              </span>
            </button>
          </div>
        </header>

        {/* Incoming Order Flash Alert Banner */}
        {incomingAlert && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-[#07543a]/25 to-amber-500/20 border-2 border-[#07543a] shadow-lg shadow-[#07543a]/15 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#07543a] text-white flex items-center justify-center shrink-0 shadow-xs animate-bounce">
                <BellRing className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black uppercase text-[#0a7350] bg-black/50 px-1.5 py-0.2 rounded">
                    New Ticket
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    {incomingAlert.order.orderNumber}
                  </span>
                  <span className="text-xs font-extrabold text-[#EAE8D5]">
                    {incomingAlert.order.tableNumber}
                  </span>
                </div>
                <p className="text-[11.5px] text-neutral-300 font-medium truncate mt-0.5">
                  {incomingAlert.order.items.map((i) => `${i.quantity}× ${i.itemName}`).join(', ')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  updateOrderStatus(incomingAlert.order.id, 'preparing');
                  setIncomingAlert(null);
                }}
                className="py-1.5 px-3 rounded-xl bg-[#07543a] hover:bg-[#053d2a] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Cook</span>
              </button>
              <button
                type="button"
                onClick={() => setIncomingAlert(null)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tickets Grid (Mobile 1-col, Tablet 2-col, Desktop 3-4 col) */}
        <div>
          {displayedOrders.length === 0 ? (
            <div className="text-center py-14 bg-neutral-900/60 rounded-2xl border border-neutral-800 p-6 flex flex-col items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-[#07543a] mx-auto mb-2" />
              <h3 className="text-base font-bold glinster-font text-white">
                All Kitchen Tickets Clear!
              </h3>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto mt-1 mb-4">
                No orders are waiting in this queue. When guests submit orders from their table, tickets appear here instantly.
              </p>
              <button
                type="button"
                disabled={isRefreshing}
                onClick={async () => {
                  setIsRefreshing(true);
                  await refreshCloudOrders();
                  setTimeout(() => setIsRefreshing(false), 500);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Checking Cloud...' : 'Refresh Orders from Cloud'}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {displayedOrders.map((ord) => {
                const minutesAgo = Math.floor(
                  (Date.now() - new Date(ord.createdAt).getTime()) / 60000
                );
                const isUrgent = minutesAgo >= 12 && ord.status !== 'ready';

                return (
                  <div
                    key={ord.id}
                    className={`flex flex-col justify-between rounded-2xl bg-neutral-900 border p-3.5 shadow-md transition-all ${
                      ord.status === 'pending'
                        ? 'border-[#0a7350] shadow-[#0a7350]/10'
                        : ord.status === 'preparing'
                        ? 'border-[#07543a] shadow-[#07543a]/10'
                        : ord.status === 'ready'
                        ? 'border-[#0284C7] shadow-[#0284C7]/10'
                        : 'border-neutral-800'
                    }`}
                  >
                    <div>
                      {/* Ticket Header: Order Number, Table, Elapsed Time */}
                      <div className="flex items-center justify-between pb-2.5 border-b border-neutral-800">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-black font-mono text-white">
                              {ord.orderNumber}
                            </span>
                            <span className="text-xs font-bold text-[#EAE8D5] bg-white/10 px-2 py-0.5 rounded-md">
                              {ord.tableNumber}
                            </span>
                          </div>
                          <div className="text-[10.5px] text-neutral-400 mt-0.5">
                            {ord.customerName || 'Diner'}
                          </div>
                        </div>

                        {/* Elapsed Timer Badge */}
                        <div
                          className={`flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg ${
                            isUrgent
                              ? 'bg-red-500/25 text-red-400 border border-red-500/40 animate-pulse'
                              : 'bg-neutral-800 text-neutral-300'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{minutesAgo < 1 ? 'Just now' : `${minutesAgo}m ago`}</span>
                        </div>
                      </div>

                      {/* Special Customer Notes */}
                      {ord.specialNotes && (
                        <div className="my-2 p-2 bg-[#07543a]/10 border border-[#07543a]/30 rounded-lg text-xs text-[#0a7350] flex items-center gap-1.5 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>{ord.specialNotes}</span>
                        </div>
                      )}

                      {/* Food Items List */}
                      <div className="py-2.5 space-y-2">
                        {ord.items.map((it) => (
                          <div key={it.id} className="text-xs">
                            <div className="flex items-start justify-between font-bold text-white">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-[8px] ${
                                    it.foodType === 'veg' || it.foodType === 'vegan'
                                      ? 'text-emerald-400'
                                      : 'text-amber-400'
                                  }`}
                                >
                                  {it.foodType === 'veg' ? '●' : it.foodType === 'vegan' ? '🌱' : '▲'}
                                </span>
                                <span className="text-sm font-mono text-[#EAE8D5]">
                                  {it.quantity}×
                                </span>
                                <span>{it.itemName}</span>
                              </div>
                            </div>

                            {it.variantName && (
                              <div className="ml-5 text-[10.5px] text-[#0a7350] font-semibold">
                                Size: {it.variantName}
                              </div>
                            )}

                            {it.addons.length > 0 && (
                              <div className="ml-5 text-[10.5px] text-neutral-400">
                                + {it.addons.map((a) => a.name).join(', ')}
                              </div>
                            )}

                            {it.specialInstructions && (
                              <div className="ml-5 text-[10.5px] text-[#0a7350] italic">
                                &quot;{it.specialInstructions}&quot;
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* KDS Action Buttons */}
                    <div className="pt-2.5 border-t border-neutral-800 space-y-1.5">
                      {ord.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(ord.id, 'preparing', 'Chef started cooking')}
                          className="w-full py-2.5 px-3 rounded-xl bg-[#0a7350] hover:bg-[#07543a] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Accept & Start Cooking</span>
                        </button>
                      )}

                      {ord.status === 'preparing' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(ord.id, 'ready', 'Plated on pass counter')}
                          className="w-full py-2.5 px-3 rounded-xl bg-[#07543a] hover:bg-[#053d2a] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md active:scale-95"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Ready on Pass</span>
                        </button>
                      )}

                      {ord.status === 'ready' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(ord.id, 'completed', 'Served to table')}
                          className="w-full py-2.5 px-3 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md active:scale-95"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Handed to Waiter / Done</span>
                        </button>
                      )}

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedOrderDetails(ord.id)}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10.5px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>History</span>
                        </button>

                        {ord.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => {
                              const reason = prompt('Cancellation reason:') || 'Unavailable';
                              updateOrderStatus(ord.id, 'cancelled', reason);
                            }}
                            className="py-1.5 px-2.5 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-400 text-[10.5px] font-semibold transition-colors cursor-pointer"
                          >
                            Decline
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* History Audit Modal */}
        {selectedOrderDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs">
            <div className="w-full max-w-sm bg-neutral-900 rounded-2xl p-5 border border-neutral-700 text-white space-y-3">
              <h3 className="text-sm font-bold glinster-font">
                Order Timeline
              </h3>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {tenantOrders
                  .find((o) => o.id === selectedOrderDetails)
                  ?.statusHistory.map((h, i) => (
                    <div key={i} className="text-xs p-2 bg-neutral-800 rounded-lg space-y-0.5">
                      <div className="flex justify-between font-bold text-[#EAE8D5]">
                        <span className="uppercase text-[11px]">{h.status}</span>
                        <span className="font-mono text-neutral-400 text-[10.5px]">
                          {new Date(h.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {h.note && <div className="text-neutral-300 text-[11px]">{h.note}</div>}
                    </div>
                  ))}
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
