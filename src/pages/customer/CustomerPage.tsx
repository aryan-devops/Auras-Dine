import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Bell,
  Sparkles,
  CheckCircle2,
  Heart,
  Check,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { DietaryFilter } from '../../components/menu/DietaryFilter';
import { DietaryConflictModal } from '../../components/menu/DietaryConflictModal';
import { MenuItemCard } from '../../components/menu/MenuItemCard';
import { CartDrawer } from '../../components/cart/CartDrawer';
import { ServiceRequestModal } from '../../components/orders/ServiceRequestModal';
import { OrderTrackingModal } from '../../components/orders/OrderTrackingModal';
import { OrderHistoryPage } from '../../components/orders/OrderHistoryPage';
import { filterMenuItems } from '../../lib/filterUtils';
import { TableAuthorizationModal } from '../../components/menu/TableAuthorizationModal';
import { AuraDineLogo } from '../../components/common/AuraDineLogo';
import { SamsungLiveIsland } from '../../components/orders/SamsungLiveIsland';

export const CustomerPage: React.FC = () => {
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
    lastAddedItem,
    orders,
    activeCustomerOrderId,
    isTableAuthorized,
    favorites,
    serviceRequests,
  } = useRestaurant();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isTableAuthModalOpen, setIsTableAuthModalOpen] = useState(!isTableAuthorized);

  // Added-to-cart toast and cart button ping animation
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [isCartPinging, setIsCartPinging] = useState(false);

  useEffect(() => {
    if (lastAddedItem) {
      setShowAddedToast(true);
      setIsCartPinging(true);
      const timer = setTimeout(() => {
        setShowAddedToast(false);
        setIsCartPinging(false);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [lastAddedItem]);

  // Active placed order for this session ONLY (no fallback to dummy table 4 orders)
  const latestOrder = useMemo(() => {
    if (activeCustomerOrderId) {
      const found = orders.find((o) => o.id === activeCustomerOrderId);
      if (found && found.status !== 'completed' && found.status !== 'cancelled') {
        return found;
      }
    }
    return null;
  }, [orders, activeCustomerOrderId]);

  const hasActiveRequest = useMemo(() => {
    return serviceRequests.some(
      (r) => r.tableId === currentTable?.id && r.status !== 'resolved'
    );
  }, [serviceRequests, currentTable?.id]);

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

  const hasLiveOrder = useMemo(() => {
    return Boolean(
      latestOrder &&
      !isTrackingModalOpen &&
      latestOrder.status !== 'completed' &&
      latestOrder.status !== 'cancelled'
    );
  }, [latestOrder, isTrackingModalOpen]);

  const hasCart = cartCount > 0;

  return (
    <div className="min-h-screen bg-[#F4F8F6] w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col min-h-full w-full max-w-full min-w-0 overflow-x-hidden">
      {/* Hotel Header Banner with AuraDine Brand POV */}
      <div className="bg-white border-b border-[#07543a]/15 py-3.5 px-4 sm:px-6 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {currentTenant.logoUrl ? (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white border border-[#07543a]/25 shadow-xs p-1 flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={currentTenant.logoUrl}
                  alt={currentTenant.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <AuraDineLogo size="sm" variant="emblem" />
            )}
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-[#07543a] bg-[#E6F2ED] px-2 py-0.5 rounded-full border border-[#C2DFD4] mb-0.5 shadow-2xs">
                <Sparkles className="w-3 h-3 text-[#07543a]" />
                <span>Powered by AurasDine</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#0D1914] glinster-font tracking-tight">
                {currentTenant.name}
              </h1>
              <p className="text-xs text-neutral-500">
                {currentTenant.tagline} {currentTable ? `· Seated at ${currentTable.tableNumber}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="hidden xs:inline-block px-2.5 py-1 rounded-full bg-[#E6F2ED] text-[#07543a] text-xs font-bold border border-[#C2DFD4]">
              {currentTenant.isOpen ? 'Open Now' : 'Closed'}
            </span>

            {/* Call Waiter Bell Button */}
            <button
              type="button"
              onClick={() => setIsServiceModalOpen(true)}
              title="Page Floor Waiter"
              aria-label="Call Waiter"
              className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full transition-all flex items-center justify-center shadow-xs shrink-0 cursor-pointer active:scale-95 ${
                hasActiveRequest
                  ? 'bg-[#07543a] text-white ring-2 ring-[#E6F2ED] animate-pulse'
                  : 'bg-white hover:bg-[#E6F2ED] text-[#07543a] border border-[#07543a]/25'
              }`}
            >
              <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              {hasActiveRequest && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#07543a] border border-white" />
              )}
            </button>

            {/* Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartDrawerOpen(true)}
              title="Open Cart"
              aria-label="Open Cart"
              className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full text-white bg-[#07543a] hover:bg-[#053d2a] active:scale-95 transition-all flex items-center justify-center shadow-xs shrink-0 cursor-pointer ${
                isCartPinging ? 'scale-110 ring-4 ring-[#07543a]/30 animate-pulse' : ''
              }`}
            >
              <ShoppingCart className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] sm:min-w-[20px] h-[18px] sm:h-5 px-1 rounded-full bg-[#07543a] text-white font-bold flex items-center justify-center text-[10px] shadow-xs border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Re-aligned Slim Sticky Filter & Search Bar */}
      <div className="sticky top-0 z-30 bg-[#F4F8F6]/95 backdrop-blur-md border-b border-[#07543a]/10 py-2 sm:py-2.5 px-3 sm:px-4 shadow-2xs space-y-1.5 sm:space-y-2 w-full max-w-full overflow-hidden">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 w-full min-w-0">
          
          {/* Clean Search Input with 16px font on mobile to prevent iOS auto-zoom */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes or drinks..."
              className="w-full pl-8.5 pr-7 py-1.5 text-base sm:text-xs rounded-full bg-white border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-[#07543a] shadow-2xs"
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

        {/* 3. Zomato-Style Circular Food Category Scroller */}
        <div className="max-w-6xl mx-auto flex items-start gap-3 sm:gap-4 md:gap-5 overflow-x-auto no-scrollbar py-2 px-1 w-full min-w-0 overscroll-x-contain">
          {/* All Items */}
          <button
            type="button"
            onClick={() => setSelectedCategoryId('all')}
            className="group flex flex-col items-center gap-1.5 shrink-0 focus:outline-none cursor-pointer active:scale-95 transition-transform"
          >
            <div
              className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 transition-all duration-200 ${
                selectedCategoryId === 'all'
                  ? 'ring-[2.5px] ring-[#07543a] ring-offset-2 ring-offset-[#F4F8F6] shadow-md shadow-[#07543a]/25 scale-105'
                  : 'ring-1.5 ring-[#C2DFD4] hover:ring-[#07543a]/70 bg-white shadow-2xs hover:scale-105'
              }`}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-neutral-100">
                <img
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80"
                  alt="All items"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {dietaryFilteredItems.length > 0 && (
                <span
                  className={`absolute -top-1 -right-1 min-w-[19px] h-[19px] px-1 rounded-full text-[10px] font-mono font-bold flex items-center justify-center shadow-xs ring-2 ring-white transition-colors ${
                    selectedCategoryId === 'all'
                      ? 'bg-[#07543a] text-white'
                      : 'bg-[#E6F2ED] text-[#07543a]'
                  }`}
                >
                  {dietaryFilteredItems.length}
                </span>
              )}
            </div>

            <span
              className={`text-[11px] sm:text-xs text-center max-w-[68px] sm:max-w-[76px] leading-tight line-clamp-2 transition-colors ${
                selectedCategoryId === 'all'
                  ? 'font-bold text-[#07543a]'
                  : 'font-medium text-neutral-700 group-hover:text-neutral-900'
              }`}
            >
              All Items
            </span>

            {selectedCategoryId === 'all' && (
              <span className="w-4 h-1 rounded-full bg-[#07543a] -mt-0.5" />
            )}
          </button>

          {/* Favorites */}
          {favorites.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedCategoryId('favorites')}
              className="group flex flex-col items-center gap-1.5 shrink-0 focus:outline-none cursor-pointer active:scale-95 transition-transform"
            >
              <div
                className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 transition-all duration-200 ${
                  selectedCategoryId === 'favorites'
                    ? 'ring-[2.5px] ring-[#07543a] ring-offset-2 ring-offset-[#F4F8F6] shadow-md shadow-[#07543a]/25 scale-105'
                    : 'ring-1.5 ring-[#C2DFD4] hover:ring-[#07543a]/70 bg-white shadow-2xs hover:scale-105'
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-neutral-100">
                  <img
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=80"
                    alt="Favorites"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                <span
                  className={`absolute -top-1 -right-1 min-w-[19px] h-[19px] px-1 rounded-full text-[10px] font-mono font-bold flex items-center justify-center shadow-xs ring-2 ring-white transition-colors ${
                    selectedCategoryId === 'favorites'
                      ? 'bg-[#07543a] text-white'
                      : 'bg-[#E6F2ED] text-[#07543a]'
                  }`}
                >
                  {dietaryFilteredItems.filter((i) => favorites.includes(i.id)).length}
                </span>

                <span className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-[#07543a] flex items-center justify-center ring-2 ring-white shadow-xs">
                  <Heart className="w-2.5 h-2.5 fill-white text-white" />
                </span>
              </div>

            <span
                className={`text-[11px] sm:text-xs text-center max-w-[68px] sm:max-w-[76px] leading-tight line-clamp-2 transition-colors ${
                  selectedCategoryId === 'favorites'
                    ? 'font-bold text-[#07543a]'
                    : 'font-medium text-neutral-700 group-hover:text-neutral-900'
                }`}
              >
                Favorites
              </span>

              {selectedCategoryId === 'favorites' && (
                <span className="w-4 h-1 rounded-full bg-[#07543a] -mt-0.5" />
              )}
            </button>
          )}

          {/* Dynamic Categories */}
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            const count = dietaryFilteredItems.filter((i) => i.categoryId === cat.id).length;
            if (count === 0 && dietaryFilter !== 'all') return null;

            const categoryImg =
              cat.imageUrl ||
              dietaryFilteredItems.find((i) => i.categoryId === cat.id && i.imagePath)?.imagePath ||
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80';

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className="group flex flex-col items-center gap-1.5 shrink-0 focus:outline-none cursor-pointer active:scale-95 transition-transform"
              >
                <div
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 transition-all duration-200 ${
                    isSelected
                      ? 'ring-[2.5px] ring-[#07543a] ring-offset-2 ring-offset-[#F4F8F6] shadow-md shadow-[#07543a]/25 scale-105'
                      : 'ring-1.5 ring-[#C2DFD4] hover:ring-[#07543a]/70 bg-white shadow-2xs hover:scale-105'
                  }`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-neutral-100">
                    <img
                      src={categoryImg}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80';
                      }}
                    />
                  </div>

                  <span
                    className={`absolute -top-1 -right-1 min-w-[19px] h-[19px] px-1 rounded-full text-[10px] font-mono font-bold flex items-center justify-center shadow-xs ring-2 ring-white transition-colors ${
                      isSelected
                        ? 'bg-[#07543a] text-white'
                        : 'bg-[#E6F2ED] text-[#07543a]'
                    }`}
                  >
                    {count}
                  </span>
                </div>

                <span
                  className={`text-[11px] sm:text-xs text-center max-w-[68px] sm:max-w-[76px] leading-tight line-clamp-2 transition-colors ${
                    isSelected
                      ? 'font-bold text-[#07543a]'
                      : 'font-medium text-neutral-700 group-hover:text-neutral-900'
                  }`}
                >
                  {cat.name}
                </span>

                {isSelected && (
                  <span className="w-4 h-1 rounded-full bg-[#07543a] -mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Menu Dishes Section */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6 pb-32 sm:pb-36 space-y-6 sm:space-y-8 flex-1 w-full max-w-full min-w-0">
        
        {/* Signatures & Recommendations (when browsing all) */}
        {!searchQuery && selectedCategoryId === 'all' && (
          <>
            {mustTryItems.length > 0 && (
              <section className="space-y-2.5 w-full max-w-full min-w-0 overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#07543a]" />
                    <h2 className="text-base sm:text-xl font-bold text-[#0D1914] font-heading glinster-font tracking-tight">
                      Must-Try Signatures
                    </h2>
                  </div>
                  <span className="text-[11px] text-[#07543a] font-bold">
                    House Specialities
                  </span>
                </div>

                {/* Mobile: Horizontal Carousel (No vertical congestion) */}
                <div className="md:hidden flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-0.5 snap-x w-full max-w-full min-w-0 overscroll-x-contain">
                  {mustTryItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} variant="highlight" />
                  ))}
                </div>

                {/* Desktop/Tablet: Multi-column Grid */}
                <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5 w-full min-w-0">
                  {mustTryItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {recommendedItems.length > 0 && (
              <section className="space-y-2.5 w-full max-w-full min-w-0 overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#07543a]" />
                    <h2 className="text-base sm:text-xl font-bold text-[#0D1914] font-heading glinster-font tracking-tight">
                      Chef&apos;s Recommendations
                    </h2>
                  </div>
                  <span className="text-[11px] text-[#07543a] font-bold">
                    Curated
                  </span>
                </div>

                {/* Mobile: Horizontal Carousel */}
                <div className="md:hidden flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-0.5 snap-x w-full max-w-full min-w-0 overscroll-x-contain">
                  {recommendedItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} variant="highlight" />
                  ))}
                </div>

                {/* Desktop/Tablet: Multi-column Grid */}
                <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5 w-full min-w-0">
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
          <section className="space-y-3 w-full max-w-full min-w-0">
            <h2 className="text-base font-bold text-[#0D1914] font-heading glinster-font">
              Search Results ({searchedItems.length} dishes found)
            </h2>

            {searchedItems.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200/80 p-8">
                <p className="text-base font-bold text-[#0D1914] font-heading glinster-font mb-1">
                  No dishes matched &quot;{searchQuery}&quot;
                </p>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
                  Try adjusting keywords or switch your Veg / Non-Veg filter.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="py-2 px-4 rounded-full bg-[#07543a] hover:bg-[#053d2a] text-white text-xs font-semibold cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5 w-full max-w-full min-w-0">
                {searchedItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>
        ) : selectedCategoryId === 'favorites' ? (
          <section className="space-y-3 w-full max-w-full min-w-0">
            <div className="border-b border-[#07543a]/15 pb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 fill-[#07543a] text-[#07543a]" />
                <h2 className="text-lg font-bold text-[#0D1914] font-heading glinster-font">
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
                <p className="text-base font-bold text-[#0D1914] font-heading glinster-font mb-1">
                  No favorites in this dietary view
                </p>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-4">
                  Tap the heart icon on any card to save your favorite dishes here for quick reordering.
                </p>
                <button
                  onClick={() => setSelectedCategoryId('all')}
                  className="py-2 px-4 rounded-full bg-[#07543a] hover:bg-[#053d2a] text-white text-xs font-semibold cursor-pointer"
                >
                  Browse All Dishes
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5 w-full max-w-full min-w-0">
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
                <section key={cat.id} id={`category-${cat.slug}`} className="space-y-2.5 sm:space-y-3 w-full max-w-full min-w-0">
                  <div className="border-b border-[#07543a]/15 pb-1.5 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <h2 className="text-base sm:text-lg font-bold text-[#0D1914] font-heading glinster-font truncate">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5 w-full max-w-full min-w-0">
                    {items.map((item) => (
                      <MenuItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </section>
              );
            })
        )}
      </main>

      {/* Added to Order Animated Floating Toast Notification */}
      {showAddedToast && lastAddedItem && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2.5 bg-[#07543a] text-white px-4 py-2 rounded-full shadow-xl border border-white/20 backdrop-blur-md">
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 text-white stroke-[3] animate-bounce" />
            </div>
            <span className="text-xs font-bold tracking-tight">
              Added &quot;{lastAddedItem.name}&quot; to order
            </span>
            <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-full font-bold">
              Cart: {cartCount}
            </span>
          </div>
        </div>
      )}

      {/* 5. Sticky Floating Bottom Action Dock with Samsung Dynamic Island */}
      {/* Only show when an event occurs: items in cart, active live order, or floor waiter paged */}
      {(hasCart || hasLiveOrder || hasActiveRequest) && (
        <div className="fixed bottom-4 left-3 right-3 sm:left-6 sm:right-6 z-40 max-w-sm mx-auto pointer-events-auto animate-in slide-in-from-bottom-5 duration-300">
          <SamsungLiveIsland
            latestOrder={latestOrder}
            hasActiveRequest={hasActiveRequest}
            cartCount={cartCount}
            cartTotal={cartTotal}
            tableNumber={currentTable?.tableNumber || '4'}
            currencySymbol={currentTenant.currencySymbol}
            onOpenTracking={() => setIsTrackingModalOpen(true)}
            onOpenServiceModal={() => setIsServiceModalOpen(true)}
            onOpenCart={() => setIsCartDrawerOpen(true)}
          />
        </div>
      )}
      </div>

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
      {isHistoryModalOpen && (
        <OrderHistoryPage
          onBack={() => setIsHistoryModalOpen(false)}
          onReorder={(order) => {
            // Implementation for reordering will use addToCart
            order.items.forEach(item => {
              // This is simplified reordering logic
              // In production, we'd map items to menuItems
            });
            setIsHistoryModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
