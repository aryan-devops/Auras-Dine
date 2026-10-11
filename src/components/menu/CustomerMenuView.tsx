import React, { useState, useMemo } from 'react';
import {
  Search,
  ShoppingBag,
  Bell,
  Sparkles,
  CheckCircle2,
  Smartphone,
  Maximize2,
  Wifi,
  Battery,
  Heart,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { DietaryFilter } from './DietaryFilter';
import { DietaryConflictModal } from './DietaryConflictModal';
import { MenuItemCard } from './MenuItemCard';
import { CartDrawer } from '../cart/CartDrawer';
import { ServiceRequestModal } from '../orders/ServiceRequestModal';
import { OrderTrackingModal } from '../orders/OrderTrackingModal';
import { filterMenuItems } from '../../lib/filterUtils';
import { TableAuthorizationModal } from './TableAuthorizationModal';

export const CustomerMenuView: React.FC = () => {
  const {
    currentTenant,
    currentTable,
    categories,
    menuItems,
    dietaryFilter,
    setDietaryFilterWithConflictCheck,
    cartCount,
    cartTotal,
    setIsCartDrawerOpen,
    orders,
    activeCustomerOrderId,
    isTableAuthorized,
    favorites,
  } = useRestaurant();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isTableAuthModalOpen, setIsTableAuthModalOpen] = useState(false);
  const [phoneFrameMode, setPhoneFrameMode] = useState(false);

  // Active placed order for this table/session if any
  const latestOrder = useMemo(() => {
    if (activeCustomerOrderId) {
      return orders.find((o) => o.id === activeCustomerOrderId) || null;
    }
    return (
      orders.find(
        (o) =>
          o.tenantId === currentTenant.id &&
          o.tableId === currentTable?.id &&
          o.status !== 'completed' &&
          o.status !== 'cancelled'
      ) || null
    );
  }, [orders, activeCustomerOrderId, currentTenant.id, currentTable?.id]);

  // Filter items by dietary selection first
  const dietaryFilteredItems = useMemo(() => {
    return filterMenuItems(menuItems, dietaryFilter);
  }, [menuItems, dietaryFilter]);

  // Then apply search query
  const searchedItems = useMemo(() => {
    if (!searchQuery.trim()) return dietaryFilteredItems;
    const q = searchQuery.toLowerCase().trim();
    return dietaryFilteredItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }, [dietaryFilteredItems, searchQuery]);

  // Highlighted subsets
  const recommendedItems = useMemo(() => {
    return dietaryFilteredItems.filter((i) => i.isRecommended);
  }, [dietaryFilteredItems]);

  const mustTryItems = useMemo(() => {
    return dietaryFilteredItems.filter((i) => i.isMustTry);
  }, [dietaryFilteredItems]);

  // Inner Menu Content Component (used both in full view and inside Phone frame)
  const MenuContent = () => (
    <div className="flex flex-col min-h-full">
      {/* 1. Re-aligned Clean Restaurant Header */}
      <div className="bg-white border-b border-[#30673A]/15 py-2.5 sm:py-3.5 px-3 sm:px-4 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2.5 sm:gap-3">
          
          {/* Left: Brand Monogram + Name + Table Context */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#30673A] text-white flex items-center justify-center font-bold text-base sm:text-xl shadow-xs shrink-0 font-heading glinster-font border border-[#FAF8F2]">
              {currentTenant.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-lg font-bold text-[#1E231F] font-heading glinster-font tracking-tight truncate">
                  {currentTenant.name}
                </h1>
                <span className="shrink-0 inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold text-[#30673A] bg-[#30673A]/10 px-1.5 sm:px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#30673A]" />
                  <span className="hidden xs:inline">{currentTenant.isOpen ? 'Kitchen Open' : 'Closed'}</span>
                  <span className="xs:hidden">{currentTenant.isOpen ? 'Open' : 'Closed'}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
                <button
                  type="button"
                  onClick={() => setIsTableAuthModalOpen(true)}
                  className="font-bold text-[#30673A] bg-[#E9E9C7]/60 hover:bg-[#E9E9C7] px-2 py-0.5 rounded-md border border-[#30673A]/25 shrink-0 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs group text-[11px] sm:text-xs"
                  title="Click to write or change table number"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#30673A]" />
                  <span>{currentTable?.tableNumber || 'Table 4'}</span>
                  <span className="text-[10px] text-neutral-400 group-hover:text-[#30673A] font-normal underline">
                    change
                  </span>
                </button>
                <span className="truncate text-[11px] text-neutral-400 hidden sm:inline">
                  {currentTenant.cuisine}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Call Server Bell */}
            <button
              type="button"
              onClick={() => setIsServiceModalOpen(true)}
              className="min-h-[34px] sm:min-h-[38px] px-2.5 sm:px-3 rounded-xl bg-[#FAF8F2] hover:bg-[#E9E9C7]/60 text-[#1E231F] border border-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Call Waiter"
            >
              <Bell className="w-3.5 h-3.5 text-[#E3792F]" />
              <span className="hidden sm:inline">Call Server</span>
            </button>

            {/* Live Order Track button */}
            {latestOrder && (
              <button
                type="button"
                onClick={() => setIsTrackingModalOpen(true)}
                className="min-h-[34px] sm:min-h-[38px] px-2.5 sm:px-3 rounded-xl bg-[#30673A] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:bg-[#204828] transition-colors cursor-pointer animate-pulse"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Track</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 2. Re-aligned Slim Sticky Filter & Search Bar */}
      <div className="sticky top-0 z-30 bg-[#FAF8F2]/95 backdrop-blur-md border-b border-[#30673A]/10 py-2 sm:py-2.5 px-3 sm:px-4 shadow-2xs space-y-1.5 sm:space-y-2">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          
          {/* Clean Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes or drinks..."
              className="w-full pl-8.5 pr-7 py-1.5 text-xs rounded-full bg-white border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-[#30673A] shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-neutral-400 hover:text-neutral-700"
              >
                ✕
              </button>
            )}
          </div>

          {/* Segmented Dietary Switch (compact on mobile) */}
          <div className="shrink-0">
            <DietaryFilter
              value={dietaryFilter}
              onChange={setDietaryFilterWithConflictCheck}
              size="sm"
            />
          </div>

        </div>

        {/* 3. Category Chips Scroller */}
        <div className="max-w-6xl mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
          <button
            type="button"
            onClick={() => setSelectedCategoryId('all')}
            className={`min-h-[28px] sm:min-h-[32px] px-3 sm:px-3.5 py-0.5 sm:py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategoryId === 'all'
                ? 'bg-[#1E231F] text-white font-semibold shadow-2xs'
                : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200'
            }`}
          >
            All Items
          </button>

          {favorites.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedCategoryId('favorites')}
              className={`min-h-[28px] sm:min-h-[32px] px-3 sm:px-3.5 py-0.5 sm:py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                selectedCategoryId === 'favorites'
                  ? 'bg-[#E3792F] text-white font-semibold shadow-xs'
                  : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200'
              }`}
            >
              <Heart
                className={`w-3 h-3 ${
                  selectedCategoryId === 'favorites' ? 'fill-white text-white' : 'text-[#E3792F]'
                }`}
              />
              <span>Favorites</span>
              <span className="text-[10px] opacity-80 tabular-nums">({favorites.length})</span>
            </button>
          )}

          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            const count = dietaryFilteredItems.filter((i) => i.categoryId === cat.id).length;
            if (count === 0 && dietaryFilter !== 'all') return null;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`min-h-[28px] sm:min-h-[32px] px-3 sm:px-3.5 py-0.5 sm:py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-[#30673A] text-white font-semibold shadow-xs'
                    : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-75 tabular-nums">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Menu Dishes Section */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6 pb-24 space-y-6 sm:space-y-8 flex-1">
        
        {/* Signatures & Recommendations (when browsing all) */}
        {!searchQuery && selectedCategoryId === 'all' && (
          <>
            {mustTryItems.length > 0 && (
              <section className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E3792F]" />
                    <h2 className="text-base sm:text-xl font-bold text-[#1E231F] font-heading glinster-font tracking-tight">
                      Must-Try Signatures
                    </h2>
                  </div>
                  <span className="text-[11px] text-[#E3792F] font-bold">
                    House Specialities
                  </span>
                </div>

                {/* Mobile: Horizontal Carousel (No vertical congestion) */}
                <div className="md:hidden flex gap-3 overflow-x-auto no-scrollbar -mx-3 px-3 pb-2 pt-0.5 snap-x">
                  {mustTryItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} variant="highlight" />
                  ))}
                </div>

                {/* Desktop/Tablet: Multi-column Grid */}
                <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                  {mustTryItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {recommendedItems.length > 0 && (
              <section className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#30673A]" />
                    <h2 className="text-base sm:text-xl font-bold text-[#1E231F] font-heading glinster-font tracking-tight">
                      Chef&apos;s Recommendations
                    </h2>
                  </div>
                  <span className="text-[11px] text-[#30673A] font-bold">
                    Curated
                  </span>
                </div>

                {/* Mobile: Horizontal Carousel */}
                <div className="md:hidden flex gap-3 overflow-x-auto no-scrollbar -mx-3 px-3 pb-2 pt-0.5 snap-x">
                  {recommendedItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} variant="highlight" />
                  ))}
                </div>

                {/* Desktop/Tablet: Multi-column Grid */}
                <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                  {recommendedItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Categorized Dishes */}
        {searchQuery ? (
          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#1E231F] font-heading glinster-font">
              Search Results ({searchedItems.length} dishes found)
            </h2>

            {searchedItems.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200/80 p-8">
                <p className="text-base font-bold text-[#1E231F] font-heading glinster-font mb-1">
                  No dishes matched &quot;{searchQuery}&quot;
                </p>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
                  Try adjusting keywords or switch your Veg / Non-Veg filter.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="py-2 px-4 rounded-full bg-[#30673A] text-white text-xs font-semibold cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                {searchedItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>
        ) : selectedCategoryId === 'favorites' ? (
          <section className="space-y-3">
            <div className="border-b border-[#30673A]/15 pb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 fill-[#E3792F] text-[#E3792F]" />
                <h2 className="text-lg font-bold text-[#1E231F] font-heading glinster-font">
                  Your Favorite Dishes
                </h2>
              </div>
              <span className="text-xs text-neutral-500">
                {dietaryFilteredItems.filter((i) => favorites.includes(i.id)).length} saved
              </span>
            </div>

            {dietaryFilteredItems.filter((i) => favorites.includes(i.id)).length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200/80 p-8">
                <Heart className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-base font-bold text-[#1E231F] font-heading glinster-font mb-1">
                  No favorites in this dietary view
                </p>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
                  Tap the heart icon on any card to save your favorite dishes here for quick reordering.
                </p>
                <button
                  onClick={() => setSelectedCategoryId('all')}
                  className="py-2 px-4 rounded-full bg-[#30673A] text-white text-xs font-semibold cursor-pointer"
                >
                  Browse All Dishes
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                {dietaryFilteredItems
                  .filter((i) => favorites.includes(i.id))
                  .map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
              </div>
            )}
          </section>
        ) : (
          categories
            .filter((cat) => selectedCategoryId === 'all' || selectedCategoryId === cat.id)
            .map((cat) => {
              const items = dietaryFilteredItems.filter((i) => i.categoryId === cat.id);
              if (items.length === 0) return null;

              return (
                <section key={cat.id} id={`category-${cat.slug}`} className="space-y-2.5 sm:space-y-3">
                  <div className="border-b border-[#30673A]/15 pb-1.5 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <h2 className="text-base sm:text-lg font-bold text-[#1E231F] font-heading glinster-font truncate">
                        {cat.name}
                      </h2>
                      {cat.description && (
                        <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">
                          {cat.description}
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] text-neutral-400 font-semibold shrink-0">
                      {items.length} {items.length === 1 ? 'dish' : 'dishes'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                    {items.map((item) => (
                      <MenuItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </section>
              );
            })
        )}
      </main>

      {/* 5. Sticky Floating Bottom Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-3 sm:bottom-4 left-3 right-3 sm:left-4 sm:right-4 z-40 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setIsCartDrawerOpen(true)}
            className="w-full py-3 px-4 sm:py-3.5 sm:px-5 rounded-2xl bg-[#30673A] hover:bg-[#204828] text-white shadow-xl flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                {cartCount}
              </div>
              <div className="text-left">
                <span className="text-xs uppercase font-bold tracking-wider block opacity-95">
                  View Dining Order
                </span>
                <span className="text-[11px] opacity-80">
                  {currentTable?.tableNumber || 'Table Session'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono tabular-nums text-sm font-bold">
                {currentTenant.currencySymbol}{cartTotal.toFixed(2)}
              </span>
              <ShoppingBag className="w-4 h-4 ml-1" />
            </div>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F2]">
      {/* Top Device Simulator Toggle Bar (for testing on desktop/laptop) */}
      <div className="bg-neutral-900 text-white py-2 px-4 border-b border-neutral-800 text-xs hidden md:flex items-center justify-between">
        <div className="flex items-center gap-2 text-neutral-300">
          <Smartphone className="w-3.5 h-3.5 text-[#E3792F]" />
          <span>Phone Screen View Alignment:</span>
          <span className="font-bold text-white">
            {phoneFrameMode ? 'iPhone 16 Pro Frame Active' : 'Responsive View Active'}
          </span>
        </div>

        <button
          onClick={() => setPhoneFrameMode(!phoneFrameMode)}
          className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {phoneFrameMode ? (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Expand to Full View</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-[#30673A]" />
              <span>Simulate iPhone Frame</span>
            </>
          )}
        </button>
      </div>

      {/* Main View: Either inside authentic iPhone Chassis or Fullscreen */}
      {phoneFrameMode ? (
        <div className="py-8 px-4 flex justify-center items-center bg-[#1E231F] min-h-[calc(100vh-120px)]">
          {/* Authentic iPhone Chassis */}
          <div
            className="relative w-[390px] h-[820px] rounded-[50px] border-[10px] border-neutral-850 shadow-2xl bg-[#FAF8F2] overflow-hidden flex flex-col"
            style={{
              boxShadow: '0 30px 70px rgba(0,0,0,0.8), inset 0 0 0 2px rgba(255,255,255,0.1)',
            }}
          >
            {/* Phone Status Bar + Dynamic Island */}
            <div className="bg-white pt-2.5 pb-1 px-6 flex items-center justify-between text-[11px] font-bold text-[#1E231F] shrink-0 border-b border-neutral-100 select-none">
              <span>9:41</span>
              {/* Dynamic Island Pill */}
              <div className="w-24 h-5 bg-black rounded-full mx-auto" />
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3 h-3" />
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Scrollable Phone Menu Viewport */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative">
              <MenuContent />
            </div>

            {/* Phone Home Bar */}
            <div className="h-4 bg-white flex items-center justify-center shrink-0 border-t border-neutral-100">
              <div className="w-32 h-1 bg-neutral-400 rounded-full" />
            </div>
          </div>
        </div>
      ) : (
        /* Fullscreen responsive layout */
        <MenuContent />
      )}

      {/* Floating Live Order Bar (visible when tracking modal is closed so diner can freely browse menu) */}
      {latestOrder && !isTrackingModalOpen && latestOrder.status !== 'completed' && latestOrder.status !== 'cancelled' && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-4 pointer-events-auto">
          <div className="bg-[#1E231F] text-white p-3 rounded-2xl shadow-xl border border-[#30673A]/40 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#30673A] text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-[#E9E9C7] animate-pulse" />
              </div>
              <div className="min-w-0 text-xs">
                <div className="font-bold flex items-center gap-1.5 truncate">
                  <span className="text-[#E9E9C7] font-mono">{latestOrder.orderNumber}</span>
                  <span className="opacity-40">·</span>
                  <span className="capitalize text-[#E3792F]">
                    {latestOrder.status === 'pending'
                      ? 'Received'
                      : latestOrder.status === 'preparing'
                      ? 'Chef Preparing'
                      : 'Ready to Serve'}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 truncate">
                  Dishes cooking for {latestOrder.tableNumber}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsTrackingModalOpen(true)}
              className="py-1.5 px-3 rounded-xl bg-[#30673A] hover:bg-[#204828] text-white font-bold text-xs shrink-0 cursor-pointer transition-colors shadow-xs"
            >
              Live Track
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <DietaryConflictModal />
      <TableAuthorizationModal
        isOpen={isTableAuthModalOpen}
        onClose={() => setIsTableAuthModalOpen(false)}
      />
      <CartDrawer onTrackOrder={() => setIsTrackingModalOpen(true)} />
      <ServiceRequestModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
      />
      <OrderTrackingModal
        isOpen={isTrackingModalOpen}
        order={latestOrder}
        onClose={() => setIsTrackingModalOpen(false)}
        onRequestAssistance={() => {
          setIsTrackingModalOpen(false);
          setIsServiceModalOpen(true);
        }}
      />
    </div>
  );
};
