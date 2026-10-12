import React, { useMemo } from 'react';
import { Clock, CheckCircle, ChevronRight, RotateCcw, UtensilsCrossed } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Order } from '../../types';

interface OrderHistoryPageProps {
  onBack: () => void;
  onReorder: (order: Order) => void;
}

export const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ onBack, onReorder }) => {
  const { orders, currentTenant } = useRestaurant();

  // Filter only completed orders for this tenant
  const orderHistory = useMemo(() => {
    return orders
      .filter((o) => o.tenantId === currentTenant.id && o.status === 'completed')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, currentTenant.id]);

  return (
    <div className="min-h-screen bg-[#F4F9FD] p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        <header className="flex items-center gap-3 pt-2">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-neutral-200">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <h1 className="text-xl font-bold font-heading glinster-font text-[#1E231F]">My Order History</h1>
        </header>

        {orderHistory.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
            <UtensilsCrossed className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-[#1E231F] mb-2">No past orders yet</h2>
            <p className="text-xs text-neutral-500">Your completed dining experiences will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orderHistory.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-sm text-[#1E231F] font-heading">{order.orderNumber}</div>
                    <div className="text-[11px] text-neutral-400">{new Date(order.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-sm font-bold text-[#2C5EAD]">{currentTenant.currencySymbol}{order.grandTotal.toFixed(2)}</div>
                </div>

                <div className="text-[11px] text-neutral-600 line-clamp-2">
                    {order.items.map(item => `${item.quantity}x ${item.itemName}`).join(', ')}
                </div>

                <button
                  onClick={() => onReorder(order)}
                  className="w-full py-2.5 rounded-xl bg-[#F4F9FD] hover:bg-[#C4E2F5]/50 border border-[#2C5EAD]/20 text-[#2C5EAD] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Re-order these items
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
