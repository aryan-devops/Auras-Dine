import React, { useState, useMemo } from 'react';
import { ChefHat, Clock, CheckCircle2, Play, AlertTriangle, Volume2, VolumeX, Eye } from 'lucide-react';
import { OrderStatus } from '../../types';
import { useRestaurant } from '../../context/RestaurantContext';

export const KitchenKdsView: React.FC = () => {
  const { orders, updateOrderStatus, currentTenant } = useRestaurant();
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<string | null>(null);

  // Filter orders for the active tenant
  const tenantOrders = useMemo(() => {
    return orders.filter((o) => o.tenantId === currentTenant.id);
  }, [orders, currentTenant.id]);

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
      {/* KDS Header Bar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#30673A] text-white flex items-center justify-center shadow-md">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold glinster-font text-white">
                Live Kitchen Display System (KDS)
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#30673A]/20 text-[#E9E9C7] border border-[#30673A]/40 font-mono">
                {currentTenant.name}
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Station Pass & Ticket Pipeline · Real-Time Kitchen Dispatch
            </p>
          </div>
        </div>

        {/* Audio notification toggle & metric pills */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#30673A]" />
                <span>Ticket Bell: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                <span>Ticket Bell: OFF</span>
              </>
            )}
          </button>

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
        </div>
      </div>

      {/* Main Ticket Grid */}
      <div className="max-w-7xl mx-auto pt-6">
        {displayedOrders.length === 0 ? (
          <div className="text-center py-20 bg-neutral-900/60 rounded-2xl border border-neutral-800 p-8">
            <CheckCircle2 className="w-12 h-12 text-[#30673A] mx-auto mb-3" />
            <h3 className="text-lg font-bold glinster-font text-white">
              All Kitchen Tickets Clear!
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
              No orders are currently waiting in this queue state. New incoming table orders will appear here automatically.
            </p>
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
