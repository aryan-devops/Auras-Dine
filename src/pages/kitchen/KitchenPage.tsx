import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Clock, CheckCircle2, Play, AlertTriangle, Volume2, VolumeX, Eye, UserCheck, ArrowRight, BellRing, Sparkles, X, Bell, RotateCw, Radio } from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { useRestaurant } from '../../context/RestaurantContext';
import { LogoutButton } from '../../components/auth/LogoutButton';
import { kitchenAlert } from '../../lib/audioAlert';

export const KitchenPage: React.FC = () => {
  const { orders, updateOrderStatus, currentTenant, currentStaffUser, refreshCloudOrders } = useRestaurant();
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Incoming order alert banner state
  const [incomingAlert, setIncomingAlert] = useState<{ order: Order; timestamp: number } | null>(null);
  const seenOrderIdsRef = useRef<Set<string>>(new Set());
  const initialLoadedRef = useRef<boolean>(false);

  // Filter orders for the active tenant (resilient matching across IDs and slugs)
  const tenantOrders = useMemo(() => {
    return orders.filter((o) => {
      if (!o) return false;
      return (
        o.tenantId === currentTenant.id ||
        o.tenantId === currentTenant.slug ||
        (currentStaffUser && o.tenantId === currentStaffUser.tenantId) ||
        !o.tenantId
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

    pendingOrders.forEach((ord) => {
      if (!seenOrderIdsRef.current.has(ord.id)) {
        seenOrderIdsRef.current.add(ord.id);
        newPendingOrders.push(ord);
      }
    });

    if (newPendingOrders.length > 0) {
      // New order received in real-time from customer phone!
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
    <div className="min-h-screen bg-[#1E231F] text-[#FAF8F2] p-4 sm:p-6">
        {/* Header with Chef profile, Audio toggle & Sign Out */}
        <div className="flex items-center justify-between gap-3 flex-wrap pb-6 border-b border-neutral-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                  Kitchen Display System (KDS)
                </span>
                <span className="text-xs text-neutral-400">· {currentTenant.name}</span>
              </div>
              {currentStaffUser ? (
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-neutral-300">
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    {currentStaffUser.name}
                  </span>
                  <span className="text-neutral-500 font-mono text-[11px]">@{currentStaffUser.username}</span>
                  {currentStaffUser.station && (
                    <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {currentStaffUser.station}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400">
                  <span>Demo KDS Session</span>
                  <Link
                    to={`/staff-login?hotel=${encodeURIComponent(currentTenant.name)}`}
                    className="text-amber-400 hover:underline font-bold text-[11px] inline-flex items-center gap-1"
                  >
                    <span>Sign In with Staff ID</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Cloud Sync Pill */}
            <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Cloud Sync</span>
            </div>

            {/* Manual Sync Cloud Orders button */}
            <button
              type="button"
              disabled={isRefreshing}
              onClick={async () => {
                setIsRefreshing(true);
                await refreshCloudOrders();
                setTimeout(() => setIsRefreshing(false), 600);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Sync latest orders from Cloud"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Sync'}</span>
            </button>

            {/* Test Bell button */}
            <button
              type="button"
              onClick={() => {
                kitchenAlert.init();
                kitchenAlert.playKitchenBell();
              }}
              className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Test Kitchen Service Bell"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Test Bell</span>
            </button>

            {/* Sound toggle button */}
            <button
              type="button"
              onClick={() => {
                kitchenAlert.init();
                setSoundEnabled(!soundEnabled);
              }}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ticket Bell: ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Ticket Bell: OFF</span>
                </>
              )}
            </button>

            <LogoutButton label="Sign Out" className="py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0" />
          </div>
        </div>

        {/* Incoming Order Flash Alert Banner */}
        {incomingAlert && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-[#E3792F]/20 to-amber-500/20 border-2 border-[#E3792F] shadow-lg shadow-[#E3792F]/10 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#E3792F] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0 animate-bounce">
                <BellRing className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#E3792F] bg-black/40 px-2 py-0.5 rounded">
                    New Incoming Ticket
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    {incomingAlert.order.orderNumber}
                  </span>
                </div>
                <p className="text-xs text-neutral-200 font-semibold mt-0.5 truncate">
                  {incomingAlert.order.tableNumber} · {incomingAlert.order.items.length} items (
                  {incomingAlert.order.items.map((i) => `${i.quantity}x ${i.itemName}`).join(', ')}
                  )
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  updateOrderStatus(incomingAlert.order.id, 'preparing');
                  setIncomingAlert(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#30673A] hover:bg-[#204828] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Cooking</span>
              </button>
              <button
                type="button"
                onClick={() => setIncomingAlert(null)}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterStatus === 'all'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Active ({pendingCount + preparingCount + readyCount})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                filterStatus === 'pending'
                  ? 'bg-[#E3792F] text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>Pending</span>
              <span className="w-4 h-4 rounded-full bg-black/30 text-[10px] flex items-center justify-center font-mono">
                {pendingCount}
              </span>
            </button>
            <button
              onClick={() => setFilterStatus('preparing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                filterStatus === 'preparing'
                  ? 'bg-[#30673A] text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>Cooking</span>
              <span className="w-4 h-4 rounded-full bg-black/30 text-[10px] flex items-center justify-center font-mono">
                {preparingCount}
              </span>
            </button>
            <button
              onClick={() => setFilterStatus('ready')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                filterStatus === 'ready'
                  ? 'bg-[#0284C7] text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>Ready Pass</span>
              <span className="w-4 h-4 rounded-full bg-black/30 text-[10px] flex items-center justify-center font-mono">
                {readyCount}
              </span>
            </button>
          </div>

      {/* Main Ticket Grid */}
      <div className="max-w-7xl mx-auto pt-6">
        {displayedOrders.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900/60 rounded-2xl border border-neutral-800 p-8 flex flex-col items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-[#30673A] mx-auto mb-3" />
            <h3 className="text-lg font-bold glinster-font text-white">
              All Kitchen Tickets Clear!
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1 mb-4">
              No orders are currently waiting in this queue state. New incoming table orders will appear here automatically.
            </p>
            <button
              type="button"
              disabled={isRefreshing}
              onClick={async () => {
                setIsRefreshing(true);
                await refreshCloudOrders();
                setTimeout(() => setIsRefreshing(false), 600);
              }}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Checking Cloud...' : 'Refresh Orders from Cloud'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayedOrders.map((ord) => {
              const minutesAgo = Math.floor(
                (Date.now() - new Date(ord.createdAt).getTime()) / 60000
              );
              const isUrgent = minutesAgo >= 15 && ord.status !== 'ready';

              return (
                <div
                  key={ord.id}
                  className={`flex flex-col justify-between rounded-2xl bg-neutral-900 border p-4 shadow-lg transition-all ${
                    ord.status === 'pending'
                      ? 'border-[#E3792F] shadow-[#E3792F]/10'
                      : ord.status === 'preparing'
                      ? 'border-[#30673A] shadow-[#30673A]/10'
                      : ord.status === 'ready'
                      ? 'border-[#0284C7] shadow-[#0284C7]/10'
                      : 'border-neutral-800'
                  }`}
                >
                  <div>
                    {/* Ticket Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black font-mono tracking-tight text-white">
                            {ord.orderNumber}
                          </span>
                          <span className="text-xs font-bold text-[#E9E9C7] bg-white/10 px-2 py-0.5 rounded-md">
                            {ord.tableNumber}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          Guest: {ord.customerName || 'Diner'}
                        </div>
                      </div>

                      {/* Elapsed Timer */}
                      <div
                        className={`flex items-center gap-1 text-xs font-mono font-bold px-2 py-1 rounded-lg ${
                          isUrgent
                            ? 'bg-red-500/20 text-red-400 animate-pulse'
                            : 'bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{minutesAgo}m ago</span>
                      </div>
                    </div>

                    {/* Customer Notes */}
                    {ord.specialNotes && (
                      <div className="my-2.5 p-2 bg-[#E3792F]/10 border border-[#E3792F]/30 rounded-lg text-xs text-[#E3792F] flex items-center gap-1.5 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{ord.specialNotes}</span>
                      </div>
                    )}

                    {/* Item list */}
                    <div className="py-3 space-y-2.5">
                      {ord.items.map((it) => (
                        <div key={it.id} className="text-xs">
                          <div className="flex items-start justify-between font-bold text-white">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-[8px] ${
                                  it.foodType === 'veg' || it.foodType === 'vegan'
                                    ? 'text-[#30673A]'
                                    : 'text-[#E3792F]'
                                }`}
                              >
                                {it.foodType === 'veg' ? '●' : it.foodType === 'vegan' ? '🌱' : '▲'}
                              </span>
                              <span className="text-sm font-mono text-[#E9E9C7]">
                                {it.quantity}×
                              </span>
                              <span>{it.itemName}</span>
                            </div>
                          </div>

                          {it.variantName && (
                            <div className="ml-5 text-[11px] text-[#30673A] font-semibold">
                              Size: {it.variantName}
                            </div>
                          )}

                          {it.addons.length > 0 && (
                            <div className="ml-5 text-[11px] text-neutral-400">
                              + {it.addons.map((a) => a.name).join(', ')}
                            </div>
                          )}

                          {it.specialInstructions && (
                            <div className="ml-5 text-[11px] text-[#E3792F] italic">
                              &quot;{it.specialInstructions}&quot;
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* KDS Action Workflow Buttons */}
                  <div className="pt-3 border-t border-neutral-800 space-y-2">
                    {ord.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(ord.id, 'preparing', 'Chef accepted ticket')}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#E3792F] hover:bg-[#c96420] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        Accept & Start Cooking
                      </button>
                    )}

                    {ord.status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus(ord.id, 'ready', 'Plated on pass counter')}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#30673A] hover:bg-[#204828] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark Ready to Serve
                      </button>
                    )}

                    {ord.status === 'ready' && (
                      <button
                        onClick={() => updateOrderStatus(ord.id, 'completed', 'Served to table')}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Complete / Hand to Server
                      </button>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedOrderDetails(ord.id)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        History
                      </button>

                      {ord.status === 'pending' && (
                        <button
                          onClick={() => {
                            const reason = prompt('Cancellation reason:') || 'Unavailable';
                            updateOrderStatus(ord.id, 'cancelled', reason);
                          }}
                          className="py-1.5 px-2.5 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-400 text-[11px] font-medium transition-colors"
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

      {/* History Details Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-neutral-900 rounded-2xl p-6 border border-neutral-700 text-white">
            <h3 className="text-base font-bold glinster-font mb-3">
              Order Audit History
            </h3>
            <div className="space-y-3 my-4 max-h-60 overflow-y-auto">
              {tenantOrders
                .find((o) => o.id === selectedOrderDetails)
                ?.statusHistory.map((h, i) => (
                  <div key={i} className="text-xs p-2.5 bg-neutral-800 rounded-lg space-y-0.5">
                    <div className="flex justify-between font-bold text-[#E9E9C7]">
                      <span className="uppercase">{h.status}</span>
                      <span className="font-mono text-neutral-400">
                        {new Date(h.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {h.note && <div className="text-neutral-300">{h.note}</div>}
                  </div>
                ))}
            </div>
            <button
              onClick={() => setSelectedOrderDetails(null)}
              className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
