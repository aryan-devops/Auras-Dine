import React, { useState } from 'react';
import { LogoutButton } from '../../components/auth/LogoutButton';
import {
  UtensilsCrossed,
  QrCode,
  TrendingUp,
  Settings,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  Calendar,
  DollarSign,
  ShoppingBag,
  Camera,
  Image as ImageIcon,
  Copy,
  Layers,
  Eye,
  CheckSquare,
  Square,
  Clock,
  Flame,
  Star,
  FolderPlus,
  Tag,
  AlertCircle,
  Users,
} from 'lucide-react';
import { FoodType, MenuItem } from '../../types';
import { useRestaurant } from '../../context/RestaurantContext';
import { TableQrCard } from '../../components/qr/TableQrCard';
import { FoodImageStudioModal } from '../../components/admin/FoodImageStudioModal';

export const AdminPage: React.FC = () => {
  const {
    currentTenant,
    updateTenantSettings,
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    duplicateMenuItem,
    bulkUpdateMenuItems,
    bulkDeleteMenuItems,
    toggleItemAvailability,
    toggleItemFlag,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    tables,
    addTable,
    deleteTable,
    orders,
    setCurrentRole,
  } = useRestaurant();

  const [activeTab, setActiveTab] = useState<'menu' | 'categories' | 'tables' | 'analytics' | 'settings' | 'staff'>('menu');

  // Filter & Search in menu
  const [menuFilter, setMenuFilter] = useState<'all' | 'available' | 'sold_out' | 'specials' | 'must_try' | 'recommended'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkCategoryTarget, setBulkCategoryTarget] = useState(categories[0]?.id || '');

  // Menu Creation Form State
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0]?.id || '');
  const [formPrice, setFormPrice] = useState('14.00');
  const [formFoodType, setFormFoodType] = useState<FoodType>('veg');
  const [formDescription, setFormDescription] = useState('');
  const [formImagePath, setFormImagePath] = useState('');
  const [formPrepTime, setFormPrepTime] = useState('15');
  const [formCalories, setFormCalories] = useState('450');
  const [formAllergens, setFormAllergens] = useState('');
  const [formIsRecommended, setFormIsRecommended] = useState(false);
  const [formIsMustTry, setFormIsMustTry] = useState(false);
  const [formIsTodaySpecial, setFormIsTodaySpecial] = useState(false);
  const [formSpecialStartDate, setFormSpecialStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [formSpecialEndDate, setFormSpecialEndDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  );
  const [formIsBestseller, setFormIsBestseller] = useState(false);

  // Inline Category Creator Modal/Popover
  const [isInlineCategoryOpen, setIsInlineCategoryOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Category Tab state
  const [catNameInput, setCatNameInput] = useState('');
  const [catDescInput, setCatDescInput] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  // Food Photo Studio Modal State
  const [isImageStudioOpen, setIsImageStudioOpen] = useState(false);
  const [selectedDishForImage, setSelectedDishForImage] = useState<MenuItem | null>(null);

  // Table Creation Form State
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('4');

  // Settings State
  const [restaurantName, setRestaurantName] = useState(currentTenant.name);
  const [tagline, setTagline] = useState(currentTenant.tagline);
  const [taxRate, setTaxRate] = useState(String(currentTenant.taxRatePercent));
  const [serviceCharge, setServiceCharge] = useState(String(currentTenant.serviceChargePercent));
  const [isOpen, setIsOpen] = useState(currentTenant.isOpen);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Filtered menu items
  const filteredMenuItems = menuItems.filter((item) => {
    if (categoryFilter !== 'all' && item.categoryId !== categoryFilter) return false;
    if (menuFilter === 'available' && !item.isAvailable) return false;
    if (menuFilter === 'sold_out' && item.isAvailable) return false;
    if (menuFilter === 'specials' && !item.isTodaySpecial) return false;
    if (menuFilter === 'must_try' && !item.isMustTry) return false;
    if (menuFilter === 'recommended' && !item.isRecommended) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    }
    return true;
  });

  // Analytics calculation
  const tenantOrders = orders.filter((o) => o.tenantId === currentTenant.id);
  const totalSales = tenantOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const avgOrderValue = tenantOrders.length > 0 ? totalSales / tenantOrders.length : 0;
  const completedOrders = tenantOrders.filter((o) => o.status === 'completed').length;

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingItemId) {
      updateMenuItem(editingItemId, {
        name: formName.trim(),
        categoryId: formCategory,
        basePrice: parseFloat(formPrice) || 10,
        foodType: formFoodType,
        description: formDescription.trim(),
        imagePath: formImagePath.trim() || undefined,
        prepTimeMinutes: parseInt(formPrepTime) || 15,
        calories: parseInt(formCalories) || 400,
        allergenInformation: formAllergens.trim() || undefined,
        isRecommended: formIsRecommended,
        isMustTry: formIsMustTry,
        isTodaySpecial: formIsTodaySpecial,
        specialStartDate: formIsTodaySpecial ? formSpecialStartDate : undefined,
        specialEndDate: formIsTodaySpecial ? formSpecialEndDate : undefined,
        isBestseller: formIsBestseller,
      });
      setEditingItemId(null);
    } else {
      addMenuItem({
        name: formName.trim(),
        slug: formName.toLowerCase().replace(/\s+/g, '-'),
        categoryId: formCategory || categories[0]?.id || 'cat-starters',
        basePrice: parseFloat(formPrice) || 10,
        foodType: formFoodType,
        description: formDescription.trim(),
        imagePath: formImagePath.trim() || undefined,
        isAvailable: true,
        isRecommended: formIsRecommended,
        isMustTry: formIsMustTry,
        isTodaySpecial: formIsTodaySpecial,
        specialStartDate: formIsTodaySpecial ? formSpecialStartDate : undefined,
        specialEndDate: formIsTodaySpecial ? formSpecialEndDate : undefined,
        isBestseller: formIsBestseller,
        displayOrder: menuItems.length + 1,
        prepTimeMinutes: parseInt(formPrepTime) || 15,
        calories: parseInt(formCalories) || 400,
        allergenInformation: formAllergens.trim() || undefined,
      });
    }

    // Reset form
    setFormName('');
    setFormDescription('');
    setFormImagePath('');
    setIsAddingItem(false);
  };

  const startEditItem = (item: MenuItem) => {
    setEditingItemId(item.id);
    setFormName(item.name);
    setFormCategory(item.categoryId);
    setFormPrice(String(item.basePrice));
    setFormFoodType(item.foodType);
    setFormDescription(item.description);
    setFormImagePath(item.imagePath || '');
    setFormPrepTime(String(item.prepTimeMinutes));
    setFormCalories(String(item.calories || ''));
    setFormAllergens(item.allergenInformation || '');
    setFormIsRecommended(item.isRecommended);
    setFormIsMustTry(item.isMustTry);
    setFormIsTodaySpecial(Boolean(item.isTodaySpecial));
    setFormSpecialStartDate(item.specialStartDate || new Date().toISOString().slice(0, 10));
    setFormSpecialEndDate(item.specialEndDate || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
    setFormIsBestseller(Boolean(item.isBestseller));
    setIsAddingItem(true);
  };

  const handleInlineAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const created = addCategory({
      name: newCatName.trim(),
      slug: newCatName.toLowerCase().replace(/\s+/g, '-'),
      description: newCatDesc.trim() || undefined,
      displayOrder: categories.length + 1,
      isActive: true,
    });
    setFormCategory(created.id);
    setNewCatName('');
    setNewCatDesc('');
    setIsInlineCategoryOpen(false);
  };

  const handleAddCategoryTabSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNameInput.trim()) return;
    if (editingCatId) {
      updateCategory(editingCatId, {
        name: catNameInput.trim(),
        description: catDescInput.trim() || undefined,
      });
      setEditingCatId(null);
    } else {
      addCategory({
        name: catNameInput.trim(),
        slug: catNameInput.toLowerCase().replace(/\s+/g, '-'),
        description: catDescInput.trim() || undefined,
        displayOrder: categories.length + 1,
        isActive: true,
      });
    }
    setCatNameInput('');
    setCatDescInput('');
  };

  const handleDuplicate = (id: string) => {
    duplicateMenuItem(id);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredMenuItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMenuItems.map((m) => m.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBulkAvailability = (available: boolean) => {
    bulkUpdateMenuItems(selectedIds, { isAvailable: available });
    setSelectedIds([]);
  };

  const handleBulkChangeCategory = () => {
    if (!bulkCategoryTarget) return;
    bulkUpdateMenuItems(selectedIds, { categoryId: bulkCategoryTarget });
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedIds.length} selected dishes?`)) {
      bulkDeleteMenuItems(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleAddTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber.trim()) return;
    addTable(newTableNumber.trim(), parseInt(newTableCapacity) || 4);
    setNewTableNumber('');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateTenantSettings({
      name: restaurantName,
      tagline,
      taxRatePercent: parseFloat(taxRate) || 0,
      serviceChargePercent: parseFloat(serviceCharge) || 0,
      isOpen,
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F2] p-4 sm:p-6 pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between bg-white p-1 rounded-2xl border border-neutral-200/80 shadow-2xs">
          <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'menu'
                ? 'bg-[#30673A] text-white'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Menu Management</span>
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'tables'
                ? 'bg-[#30673A] text-white'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Tables & QR Codes</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-[#30673A] text-white'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Sales & Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#30673A] text-white'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-[#30673A] text-white'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Staff Management</span>
          </button>
          </div>
          <LogoutButton />
        </div>

        {/* TAB 1: MENU MANAGEMENT */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#1E231F] glinster-font">
                  Dishes & Beverage Catalogue ({menuItems.length})
                </h2>
                <p className="text-xs text-neutral-500">
                  Classify dietary profiles, toggle live availability, and configure prices
                </p>
              </div>

              {!isAddingItem && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingItemId(null);
                    setFormName('');
                    setFormDescription('');
                    setIsAddingItem(true);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-[#30673A] hover:bg-[#204828] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Dish</span>
                </button>
              )}
            </div>

            {/* Dish Add/Edit Form */}
            {isAddingItem && (
              <form
                onSubmit={handleSaveItem}
                className="p-5 bg-white rounded-2xl border border-[#30673A]/20 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <h3 className="text-base font-bold text-[#1E231F] glinster-font">
                    {editingItemId ? 'Edit Menu Item' : 'New Dish Configuration'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddingItem(false)}
                    className="p-1 rounded-full text-neutral-400 hover:text-neutral-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">
                      Dish Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Pistachio Smoked Paneer Tikka"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-[#FAF8F2] focus:outline-none focus:ring-1 focus:ring-[#30673A]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-[#FAF8F2] focus:outline-none focus:ring-1 focus:ring-[#30673A]"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">
                      Base Price ({currentTenant.currencySymbol}) *
                    </label>
                    <input
                      type="number"
                      step="0.10"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-[#FAF8F2] font-mono focus:outline-none focus:ring-1 focus:ring-[#30673A]"
                    />
                  </div>

                  {/* Mandatory Dietary Classification */}
                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">
                      Dietary Classification *
                    </label>
                    <select
                      value={formFoodType}
                      onChange={(e) => setFormFoodType(e.target.value as FoodType)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-[#FAF8F2] font-semibold text-[#30673A] focus:outline-none focus:ring-1 focus:ring-[#30673A]"
                    >
                      <option value="veg">● Vegetarian (Pure Veg)</option>
                      <option value="vegan">🌱 100% Plant-Based Vegan</option>
                      <option value="non_veg">▲ Non-Vegetarian</option>
                      <option value="egg">🥚 Eggitarian (Egg Dishes)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">
                      Prep Time (Minutes)
                    </label>
                    <input
                      type="number"
                      value={formPrepTime}
                      onChange={(e) => setFormPrepTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-[#FAF8F2] focus:outline-none focus:ring-1 focus:ring-[#30673A]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">
                      Calories (kcal)
                    </label>
                    <input
                      type="number"
                      value={formCalories}
                      onChange={(e) => setFormCalories(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-[#FAF8F2] focus:outline-none focus:ring-1 focus:ring-[#30673A]"
                    />
                  </div>
                </div>

                {/* Food Photography Studio Section */}
                <div className="p-3.5 bg-[#FAF8F2] rounded-2xl border border-neutral-200/90 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-neutral-800 text-xs flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-[#30673A]" />
                      Dish Photograph (Upload File, Take Camera Photo, or Presets)
                    </label>
                    {formImagePath && (
                      <button
                        type="button"
                        onClick={() => setFormImagePath('')}
                        className="text-[11px] text-red-600 hover:underline cursor-pointer"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-neutral-300 shrink-0 flex items-center justify-center shadow-inner">
                      {formImagePath ? (
                        <img
                          src={formImagePath}
                          alt="Dish Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-7 h-7 text-neutral-300" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDishForImage(null);
                            setIsImageStudioOpen(true);
                          }}
                          className="py-1.5 px-3 rounded-xl bg-[#30673A] hover:bg-[#204828] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>{formImagePath ? 'Change Dish Photo' : 'Upload or Take Photo'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDishForImage(null);
                            setIsImageStudioOpen(true);
                          }}
                          className="py-1.5 px-3 rounded-xl bg-white hover:bg-neutral-100 text-[#30673A] border border-[#30673A]/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#E3792F]" />
                          <span>Gourmet Presets</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        {formImagePath
                          ? 'Image ready. It will be showcased prominently on the mobile menu card.'
                          : 'Add high-definition photography to give the food menu card an upscale visual presentation.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1 text-xs">
                    Description & Ingredients
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Artisanal description of flavors, seasonings, and textures..."
                    className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 bg-[#FAF8F2] focus:outline-none focus:ring-1 focus:ring-[#30673A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1 text-xs">
                    Allergen Notes
                  </label>
                  <input
                    type="text"
                    value={formAllergens}
                    onChange={(e) => setFormAllergens(e.target.value)}
                    placeholder="e.g. Contains Dairy, Nuts, Gluten"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 bg-[#FAF8F2] focus:outline-none focus:ring-1 focus:ring-[#30673A]"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsRecommended}
                      onChange={(e) => setFormIsRecommended(e.target.checked)}
                      className="w-4 h-4 rounded text-[#30673A]"
                    />
                    <span className="font-semibold text-neutral-700">Chef&apos;s Recommendation</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsMustTry}
                      onChange={(e) => setFormIsMustTry(e.target.checked)}
                      className="w-4 h-4 rounded text-[#E3792F]"
                    />
                    <span className="font-semibold text-[#E3792F]">Must-Try Signature</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setIsAddingItem(false)}
                    className="py-2 px-4 rounded-xl border border-neutral-200 text-neutral-600 text-xs font-semibold hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-5 rounded-xl bg-[#30673A] text-white text-xs font-bold hover:bg-[#204828]"
                  >
                    {editingItemId ? 'Update Dish' : 'Publish to Digital Menu'}
                  </button>
                </div>
              </form>
            )}

            {/* Menu Items Table */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F2] border-b border-neutral-200 text-neutral-600 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Photo</th>
                      <th className="py-3 px-4">Dish</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Dietary Type</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Badges</th>
                      <th className="py-3 px-4">In Stock</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {menuItems.map((item) => {
                      const category = categories.find((c) => c.id === item.categoryId);

                      return (
                        <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                          <td className="py-2.5 px-4">
                            <div
                              onClick={() => {
                                setSelectedDishForImage(item);
                                setFormImagePath(item.imagePath || '');
                                setIsImageStudioOpen(true);
                              }}
                              className="relative group/thumb w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 cursor-pointer shadow-2xs"
                              title="Click to change or capture photo for this dish"
                            >
                              {item.imagePath ? (
                                <img
                                  src={item.imagePath}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-400">
                                  <Camera className="w-4 h-4" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center text-white transition-opacity">
                                <Camera className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-bold text-[#1E231F]">
                            <div>{item.name}</div>
                            <div className="text-[11px] font-normal text-neutral-400 line-clamp-1 max-w-xs">
                              {item.description}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-neutral-600">
                            {category?.name || 'Mains'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`font-semibold inline-flex items-center gap-1 ${
                                item.foodType === 'veg' || item.foodType === 'vegan'
                                  ? 'text-[#30673A]'
                                  : 'text-[#E3792F]'
                              }`}
                            >
                              <span>
                                {item.foodType === 'veg' ? '●' : item.foodType === 'vegan' ? '🌱' : item.foodType === 'egg' ? '🥚' : '▲'}
                              </span>
                              <span className="uppercase text-[10px]">{item.foodType}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-neutral-800">
                            {currentTenant.currencySymbol}{item.basePrice.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => toggleItemFlag(item.id, 'isRecommended')}
                                className={`p-1 rounded-md text-[10px] font-semibold cursor-pointer ${
                                  item.isRecommended
                                    ? 'bg-[#30673A] text-white'
                                    : 'bg-neutral-100 text-neutral-400 hover:text-neutral-700'
                                }`}
                                title="Toggle Chef Recommendation"
                              >
                                Chef
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleItemFlag(item.id, 'isMustTry')}
                                className={`p-1 rounded-md text-[10px] font-semibold cursor-pointer ${
                                  item.isMustTry
                                    ? 'bg-[#E3792F] text-white'
                                    : 'bg-neutral-100 text-neutral-400 hover:text-neutral-700'
                                }`}
                                title="Toggle Must-Try"
                              >
                                Must-Try
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => toggleItemAvailability(item.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                                item.isAvailable
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                              }`}
                            >
                              {item.isAvailable ? 'Available' : 'Sold Out'}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => startEditItem(item)}
                                className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"
                                title="Edit item"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteMenuItem(item.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors"
                                title="Delete item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TABLES & QR CODES */}
        {activeTab === 'tables' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#1E231F] glinster-font">
                  Floor Tables & Cryptographic QR Codes ({tables.length} tables)
                </h2>
                <p className="text-xs text-neutral-500">
                  Each QR code binds the diner securely to their designated table
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setCurrentRole('qr_stand')}
                  className="py-2 px-3.5 rounded-xl bg-[#E3792F] hover:bg-[#c96420] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch Table Stand Studio</span>
                </button>

                {/* Add Table Mini Form */}
                <form onSubmit={handleAddTableSubmit} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Table Name (e.g. Patio 3)"
                    value={newTableNumber}
                    onChange={(e) => setNewTableNumber(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white"
                  />
                  <select
                    value={newTableCapacity}
                    onChange={(e) => setNewTableCapacity(e.target.value)}
                    className="px-2.5 py-2 text-xs rounded-xl border border-neutral-200 bg-white"
                  >
                    <option value="2">2 Seats</option>
                    <option value="4">4 Seats</option>
                    <option value="6">6 Seats</option>
                    <option value="8">8 Seats</option>
                  </select>
                  <button
                    type="submit"
                    className="py-2 px-3.5 rounded-xl bg-[#30673A] text-white text-xs font-bold hover:bg-[#204828] shrink-0"
                  >
                    + Add Table
                  </button>
                </form>
              </div>
            </div>

            {/* Grid of Tables with Live QR Code Generators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tables.map((tbl) => (
                <div key={tbl.id} className="relative group">
                  <TableQrCard table={tbl} />
                  <button
                    onClick={() => deleteTable(tbl.id)}
                    className="absolute top-2 right-2 p-1 text-neutral-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove table"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[#1E231F] glinster-font">
              Daily Restaurant Performance & Volume
            </h2>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-xs font-semibold">Total Revenue</span>
                  <DollarSign className="w-4 h-4 text-[#30673A]" />
                </div>
                <div className="text-2xl font-black font-mono tabular-nums text-[#1E231F] mt-2">
                  {currentTenant.currencySymbol}{totalSales.toFixed(2)}
                </div>
                <div className="text-[11px] text-[#30673A] font-semibold mt-1">
                  Active orders & completed
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-xs font-semibold">Orders Today</span>
                  <ShoppingBag className="w-4 h-4 text-[#E3792F]" />
                </div>
                <div className="text-2xl font-black font-mono tabular-nums text-[#1E231F] mt-2">
                  {tenantOrders.length}
                </div>
                <div className="text-[11px] text-neutral-500 mt-1">
                  {completedOrders} served & closed
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-xs font-semibold">Avg. Order Value</span>
                  <TrendingUp className="w-4 h-4 text-[#0284C7]" />
                </div>
                <div className="text-2xl font-black font-mono tabular-nums text-[#1E231F] mt-2">
                  {currentTenant.currencySymbol}{avgOrderValue.toFixed(2)}
                </div>
                <div className="text-[11px] text-neutral-500 mt-1">
                  Per seated party
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-xs font-semibold">Membership Plan</span>
                  <Calendar className="w-4 h-4 text-[#8B5CF6]" />
                </div>
                <div className="text-base font-bold text-[#1E231F] mt-2">
                  {currentTenant.subscription.planName}
                </div>
                <div className="text-[11px] text-[#30673A] font-semibold mt-1">
                  Expires: {new Date(currentTenant.subscription.expiryDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Orders Breakdown List */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-[#1E231F] glinster-font">
                Recent Orders Stream
              </h3>
              <div className="space-y-2">
                {tenantOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3 bg-[#FAF8F2] rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-[#30673A]">
                        {ord.orderNumber}
                      </span>
                      <span className="font-semibold text-neutral-700">
                        {ord.tableNumber}
                      </span>
                      <span className="text-neutral-400">
                        {ord.items.length} items
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-mono font-bold text-neutral-800">
                        {currentTenant.currencySymbol}{ord.grandTotal.toFixed(2)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          ord.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'preparing'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white rounded-2xl border border-neutral-200/80 p-6 shadow-2xs space-y-5">
            <div>
              <h2 className="text-lg font-bold text-[#1E231F] glinster-font">
                Restaurant Settings & Tax Rules
              </h2>
              <p className="text-xs text-neutral-500">
                Configure dining establishment details, legal taxes, and live service status
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Restaurant Brand Name
                </label>
                <input
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-[#FAF8F2] text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Tagline / Concept Description
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-[#FAF8F2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-[#FAF8F2] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    Service Charge (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={serviceCharge}
                    onChange={(e) => setServiceCharge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-[#FAF8F2] font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOpen}
                    onChange={(e) => setIsOpen(e.target.checked)}
                    className="w-4 h-4 rounded text-[#30673A]"
                  />
                  <div>
                    <span className="font-bold text-neutral-800 block">
                      Kitchen Accepting Live Orders
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      When toggled off, customers see a &quot;Kitchen Closed&quot; advisory.
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                {settingsSaved ? (
                  <span className="text-xs text-[#30673A] font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Settings saved successfully!
                  </span>
                ) : (
                  <span />
                )}

                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-[#30673A] hover:bg-[#204828] text-white font-bold text-xs shadow-sm transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB STAFF MANAGEMENT */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[#1E231F] glinster-font">
              Staff Access Credentials
            </h2>
            <div className="p-4 bg-white rounded-xl border border-neutral-200">
               <p className="text-sm text-neutral-500 mb-4">Create access for Kitchen and Waiter staff.</p>
               {/* Staff creation form would go here */}
            </div>
          </div>
        )}
        <FoodImageStudioModal
          isOpen={isImageStudioOpen}
          onClose={() => {
            setIsImageStudioOpen(false);
            setSelectedDishForImage(null);
          }}
          currentImage={selectedDishForImage ? selectedDishForImage.imagePath : formImagePath}
          itemName={selectedDishForImage ? selectedDishForImage.name : formName || 'New Dish'}
          onSelectImage={(newImg) => {
            if (selectedDishForImage) {
              updateMenuItem(selectedDishForImage.id, { imagePath: newImg });
              setSelectedDishForImage(null);
            } else {
              setFormImagePath(newImg);
            }
          }}
        />

      </div>
    </div>
  );
};
