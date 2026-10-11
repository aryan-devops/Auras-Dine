import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle2, Droplets, Receipt, Sparkles, AlertCircle, ChefHat, UserCheck, ArrowRight } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { LogoutButton } from '../../components/auth/LogoutButton';

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
  } = useRestaurant();

  // Active service requests for this tenant
  const tenantRequests = serviceRequests.filter((r) => r.tenantId === currentTenant.id);
  const openRequests = tenantRequests.filter((r) => r.status !== 'resolved');

  // Ready orders waiting for waiter delivery
  const readyOrders = orders.filter(
    (o) => o.tenantId === currentTenant.id && o.status === 'ready'
  );

  return (
    <div className="min-h-screen bg-[#FAF8F2] p-4 sm:p-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#30673A] text-white">
                Floor Service
              </span>
              <span className="text-xs text-neutral-400">· {currentTenant.name}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1E231F] glinster-font mt-0.5">
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
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {currentStaffUser.station}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                <span>Demo mode active</span>
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

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <LogoutButton label="Sign Out" />
          </div>
        </div>

        {/* 1. Urgent Pass: Ready Orders Waiting for Server Delivery */}
        {readyOrders.length > 0 && (
          <div className="p-4 rounded-2xl bg-[#0284C7]/10 border border-[#0284C7]/30 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-[#0284C7]" />
                <h2 className="text-sm font-bold text-[#0284C7] uppercase tracking-wider">
                  Pass Counter: Dishes Ready for Table Delivery ({readyOrders.length})
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {readyOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-3.5 bg-white rounded-xl border border-neutral-200 shadow-2xs flex flex-col justify-between gap-2"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-mono font-bold text-[#0284C7]">
                        {ord.orderNumber}
                      </span>
                      <span className="text-xs font-bold bg-[#E9E9C7] text-[#1E231F] px-2 py-0.5 rounded-md">
                        {ord.tableNumber}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-600 mt-1 line-clamp-2">
                      {ord.items.map((i) => `${i.quantity}× ${i.itemName}`).join(', ')}
                    </div>
                  </div>

                  <button
                    onClick={() => updateOrderStatus(ord.id, 'completed', 'Server delivered to table')}
                    className="w-full py-2 px-3 rounded-lg bg-[#0284C7] hover:bg-[#0369a1] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Delivered to Guest
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Customer Calling Bells & Service Requests */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1E231F] glinster-font flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#E3792F]" />
              Active Calling Bells ({openRequests.length})
            </h2>
          </div>

          {openRequests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200/80 p-6">
              <CheckCircle2 className="w-10 h-10 text-[#30673A] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#1E231F] glinster-font">
                No Open Service Requests
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                All table calling bells and bill requests are attended to.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {openRequests.map((req) => {
                const isClaimed = req.status === 'in_progress';

                return (
                  <div
                    key={req.id}
                    className={`p-4 rounded-2xl bg-white border shadow-xs flex flex-col justify-between gap-3 ${
                      req.type === 'urgent'
                        ? 'border-red-400 bg-red-50/20'
                        : isClaimed
                        ? 'border-[#30673A]/40'
                        : 'border-[#E3792F]/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#FAF8F2] border border-neutral-200">
                          {req.tableNumber}
                        </span>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-2.5">
                        {req.type === 'waiter' && <Bell className="w-4 h-4 text-[#30673A]" />}
                        {req.type === 'water' && <Droplets className="w-4 h-4 text-[#0284C7]" />}
                        {req.type === 'bill' && <Receipt className="w-4 h-4 text-[#E3792F]" />}
                        {req.type === 'clean' && <Sparkles className="w-4 h-4 text-[#8B5CF6]" />}
                        {req.type === 'urgent' && <AlertCircle className="w-4 h-4 text-[#DC2626]" />}
                        <h3 className="text-sm font-bold text-[#1E231F]">
                          {req.type === 'waiter' && 'Call Waiter Assistance'}
                          {req.type === 'water' && 'Water Pitcher Refill'}
                          {req.type === 'bill' && 'Request Check / Bill'}
                          {req.type === 'clean' && 'Table Tidy / Cutlery'}
                          {req.type === 'urgent' && 'Urgent Attention Needed'}
                        </h3>
                      </div>

                      {req.note && (
                        <p className="text-xs text-neutral-600 mt-1 italic">
                          &quot;{req.note}&quot;
                        </p>
                      )}

                      {isClaimed && (
                        <div className="mt-2 text-[11px] text-[#30673A] font-semibold bg-[#30673A]/10 px-2 py-1 rounded-md">
                          Attended by {req.claimedByStaff}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-neutral-100 flex items-center gap-2">
                      {!isClaimed ? (
                        <button
                          onClick={() => claimServiceRequest(req.id, 'Floor Server')}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#E3792F] hover:bg-[#c96420] text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Claim Table
                        </button>
                      ) : (
                        <button
                          onClick={() => resolveServiceRequest(req.id)}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#30673A] hover:bg-[#204828] text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Resolve Request
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
          <h2 className="text-lg font-bold text-[#1E231F] glinster-font">
            Floor Plan & Table Occupancy
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {tables.map((t) => {
              const activeTableOrder = orders.find(
                (o) => o.tableId === t.id && o.status !== 'completed' && o.status !== 'cancelled'
              );
              const hasCallingBell = openRequests.some((r) => r.tableId === t.id);

              return (
                <div
                  key={t.id}
                  className={`p-3 rounded-xl bg-white border shadow-2xs flex flex-col justify-between gap-2 ${
                    hasCallingBell
                      ? 'border-[#E3792F] ring-2 ring-[#E3792F]/30 bg-orange-50/20'
                      : activeTableOrder
                      ? 'border-[#30673A] bg-emerald-50/20'
                      : 'border-neutral-200'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-[#1E231F]">
                      {t.tableNumber}
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      Cap: {t.capacity} guests
                    </div>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px]">
                    {hasCallingBell ? (
                      <span className="font-bold text-[#E3792F] flex items-center gap-1">
                        <Bell className="w-3 h-3 animate-bounce" />
                        Paging
                      </span>
                    ) : activeTableOrder ? (
                      <span className="font-bold text-[#30673A]">
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

      </div>
    </div>
  );
};
