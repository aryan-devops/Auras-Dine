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
  KeyRound,
  ChefHat,
  UserCheck,
  UserX,
  ShieldCheck,
  EyeOff,
  Search,
  Phone,
  Mail,
  CheckCircle2,
  Lock,
  Shuffle,
  Upload,
  SlidersHorizontal,
} from 'lucide-react';
import { FoodType, MenuItem, MenuCategory, StaffMember, StaffRole, MenuItemVariant, MenuItemAddon } from '../../types';
import { useRestaurant } from '../../context/RestaurantContext';
import { AuraDineLogo } from "../../components/common/AuraDineLogo";
import { TableQrCard } from '../../components/qr/TableQrCard';
import { FoodImageStudioModal } from '../../components/admin/FoodImageStudioModal';
import { DishCustomizationModal } from '../../components/admin/DishCustomizationModal';

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
    scopedStaffMembers,
    addStaff,
    resetStaffPassword,
    toggleStaffStatus,
    deleteStaff,
    currentStaffUser,
  } = useRestaurant();

  const [activeTab, setActiveTab] = useState<'menu' | 'categories' | 'tables' | 'analytics' | 'settings' | 'staff'>('menu');

  // Staff Management state
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [staffRoleFilter, setStaffRoleFilter] = useState<'all' | StaffRole>('all');
  const [staffStatusFilter, setStaffStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Add staff modal state
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffUsername, setNewStaffUsername] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<StaffRole>('waiter');
  const [newStaffStation, setNewStaffStation] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [showNewStaffPassword, setShowNewStaffPassword] = useState(false);

  // Reset password modal state
  const [resetPasswordStaff, setResetPasswordStaff] = useState<StaffMember | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const generateSecurePassword = () => {
    const prefixes = ['Bistro', 'Chef', 'Table', 'Aura', 'Dining', 'Kitchen', 'Grand', 'Green'];
    const pfx = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    const symbols = ['!', '@', '#', '$'];
    const sym = symbols[Math.floor(Math.random() * symbols.length)];
    return `${pfx}${num}${sym}`;
  };

  // Category Management State
  const scopedCategories = categories.filter((c) => c.tenantId === currentTenant.id);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [categoryFormName, setCategoryFormName] = useState('');
  const [categoryFormDescription, setCategoryFormDescription] = useState('');
  const [categoryFormImageUrl, setCategoryFormImageUrl] = useState('');
  const [categoryDeleteTarget, setCategoryDeleteTarget] = useState<MenuCategory | null>(null);

  const CATEGORY_PHOTO_PRESETS = [
    { name: 'Starters & Tapas', url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=400&q=80' },
    { name: 'Mains & Curries', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80' },
    { name: 'Stone Pizzas', url: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=400&q=80' },
    { name: 'Smash Burgers', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80' },
    { name: 'Grills & Barbecue', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80' },
    { name: 'Loaded Sides', url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=400&q=80' },
    { name: 'Desserts & Gelato', url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80' },
    { name: 'Drinks & Mocktails', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80' },
  ];

  const filteredScopedCategories = scopedCategories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(categorySearchQuery.toLowerCase()))
  );

  const handleCategoryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCategoryFormImageUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormName('');
    setCategoryFormDescription('');
    setCategoryFormImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80');
    setIsAddCategoryOpen(true);
  };

  const handleOpenEditCategory = (cat: MenuCategory) => {
    setEditingCategory(cat);
    setCategoryFormName(cat.name);
    setCategoryFormDescription(cat.description || '');
    setCategoryFormImageUrl(cat.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80');
    setIsAddCategoryOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormName.trim()) return;

    const slug = categoryFormName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: categoryFormName.trim(),
        slug: slug || editingCategory.slug,
        description: categoryFormDescription.trim(),
        imageUrl: categoryFormImageUrl.trim(),
      });
    } else {
      addCategory({
        name: categoryFormName.trim(),
        slug: slug || `category-${Date.now()}`,
        description: categoryFormDescription.trim(),
        displayOrder: scopedCategories.length + 1,
        imageUrl: categoryFormImageUrl.trim(),
        isActive: true,
      });
    }
    setIsAddCategoryOpen(false);
    setEditingCategory(null);
  };

  const handleConfirmDeleteCategory = () => {
    if (!categoryDeleteTarget) return;
    deleteCategory(categoryDeleteTarget.id);
    setCategoryDeleteTarget(null);
  };

  // Filter & Search in menu
  const [menuFilter, setMenuFilter] = useState<'all' | 'available' | 'sold_out' | 'specials' | 'must_try' | 'recommended'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [menuDietaryFilter, setMenuDietaryFilter] = useState<'all' | FoodType>('all');
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

  // Customization State (Variants / Sizes & Add-ons)
  const [formVariants, setFormVariants] = useState<MenuItemVariant[]>([]);
  const [formAddons, setFormAddons] = useState<MenuItemAddon[]>([]);
  const [showCustomizationInForm, setShowCustomizationInForm] = useState(false);
  const [customizingDish, setCustomizingDish] = useState<MenuItem | null>(null);

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
  const [restaurantLogoUrl, setRestaurantLogoUrl] = useState(currentTenant.logoUrl || '');
  const [taxRate, setTaxRate] = useState(String(currentTenant.taxRatePercent));
  const [serviceCharge, setServiceCharge] = useState(String(currentTenant.serviceChargePercent));
  const [isOpen, setIsOpen] = useState(currentTenant.isOpen);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Filtered menu items
  const filteredMenuItems = menuItems.filter((item) => {
    if (categoryFilter !== 'all' && item.categoryId !== categoryFilter) return false;
    if (menuDietaryFilter !== 'all' && item.foodType !== menuDietaryFilter) return false;
    if (menuFilter === 'available' && !item.isAvailable) return false;
    if (menuFilter === 'sold_out' && item.isAvailable) return false;
    if (menuFilter === 'specials' && !item.isTodaySpecial) return false;
    if (menuFilter === 'must_try' && !item.isMustTry) return false;
    if (menuFilter === 'recommended' && !item.isRecommended) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.allergenInformation && item.allergenInformation.toLowerCase().includes(q))
      );
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

    const cleanVariants = formVariants
      .filter((v) => v.name.trim().length > 0)
      .map((v) => ({
        id: v.id || `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: v.name.trim(),
        priceDelta: Number(v.priceDelta) || 0,
      }));

    const cleanAddons = formAddons
      .filter((a) => a.name.trim().length > 0)
      .map((a) => ({
        id: a.id || `a-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: a.name.trim(),
        price: Math.max(0, Number(a.price) || 0),
      }));

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
        variants: cleanVariants.length > 0 ? cleanVariants : undefined,
        addons: cleanAddons.length > 0 ? cleanAddons : undefined,
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
        variants: cleanVariants.length > 0 ? cleanVariants : undefined,
        addons: cleanAddons.length > 0 ? cleanAddons : undefined,
      });
    }

    // Reset form
    setFormName('');
    setFormDescription('');
    setFormImagePath('');
    setFormVariants([]);
    setFormAddons([]);
    setShowCustomizationInForm(false);
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
    const itemVars = item.variants ? JSON.parse(JSON.stringify(item.variants)) : [];
    const itemAdds = item.addons ? JSON.parse(JSON.stringify(item.addons)) : [];
    setFormVariants(itemVars);
    setFormAddons(itemAdds);
    setShowCustomizationInForm(itemVars.length > 0 || itemAdds.length > 0);
    setIsAddingItem(true);
  };

  const handleQuickSaveCustomization = (
    dishId: string,
    variants: MenuItemVariant[] | undefined,
    addons: MenuItemAddon[] | undefined
  ) => {
    updateMenuItem(dishId, { variants, addons });
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
      logoUrl: restaurantLogoUrl.trim() || undefined,
      taxRatePercent: parseFloat(taxRate) || 0,
      serviceChargePercent: parseFloat(serviceCharge) || 0,
      isOpen,
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between">
      <div className="p-4 sm:p-6 pb-24 flex-1">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Hotel Admin Header Banner */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              {currentTenant.logoUrl ? (
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#07543a]/25 shadow-xs p-1 flex items-center justify-center shrink-0 overflow-hidden">
                  <img
                    src={currentTenant.logoUrl}
                    alt={currentTenant.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <AuraDineLogo size="md" variant="emblem" />
              )}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#07543a] text-white">
                    Hotel Admin Portal
                  </span>
                  <span className="text-xs text-neutral-400">· {currentTenant.slug}</span>
                </div>
                <h1 className="text-2xl font-black text-[#151815] glinster-font">
                  {currentTenant.name}
                </h1>
                <p className="text-xs text-neutral-500">{currentTenant.tagline} ({currentTenant.address})</p>
                {currentStaffUser && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#07543a] font-semibold">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Logged in as: {currentStaffUser.name} (@{currentStaffUser.username})</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
              <button
                onClick={() => setCurrentRole('customer')}
                className="flex-1 sm:flex-initial py-2 px-3.5 rounded-xl bg-[#FAF8F5] hover:bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Customer Menu</span>
              </button>
              <LogoutButton />
            </div>
          </div>

          {/* Phone-Friendly Mobile Navigation Grid (All 6 sections visible without horizontal scrolling!) */}
          <div className="md:hidden bg-white p-2.5 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-2">
            <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 px-1 flex items-center justify-between">
              <span>Restaurant Admin Hub</span>
              <span className="text-[#07543a] font-bold">
                {activeTab === 'menu' && 'Menu Dishes'}
                {activeTab === 'categories' && 'Categories'}
                {activeTab === 'tables' && 'Tables & QR'}
                {activeTab === 'analytics' && 'Analytics'}
                {activeTab === 'staff' && 'Staff Management'}
                {activeTab === 'settings' && 'Settings'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setActiveTab('menu')}
                className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'menu'
                    ? 'bg-[#07543a] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-neutral-700 hover:bg-neutral-100 border border-neutral-200/70'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <UtensilsCrossed className="w-4 h-4 shrink-0" />
                  <span className="truncate">Menu Dishes</span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                  activeTab === 'menu' ? 'bg-white/20 text-white' : 'bg-neutral-200/70 text-neutral-800'
                }`}>
                  {menuItems.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('categories')}
                className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'categories'
                    ? 'bg-[#07543a] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-neutral-700 hover:bg-neutral-100 border border-neutral-200/70'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FolderPlus className="w-4 h-4 shrink-0" />
                  <span className="truncate">Categories</span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                  activeTab === 'categories' ? 'bg-white/20 text-white' : 'bg-neutral-200/70 text-neutral-800'
                }`}>
                  {scopedCategories.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('tables')}
                className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'tables'
                    ? 'bg-[#07543a] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-neutral-700 hover:bg-neutral-100 border border-neutral-200/70'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <QrCode className="w-4 h-4 shrink-0" />
                  <span className="truncate">Tables & QR</span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                  activeTab === 'tables' ? 'bg-white/20 text-white' : 'bg-neutral-200/70 text-neutral-800'
                }`}>
                  {tables.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-[#07543a] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-neutral-700 hover:bg-neutral-100 border border-neutral-200/70'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <TrendingUp className="w-4 h-4 shrink-0" />
                  <span className="truncate">Analytics</span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                  activeTab === 'analytics' ? 'bg-white/20 text-white' : 'bg-neutral-200/70 text-neutral-800'
                }`}>
                  {tenantOrders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('staff')}
                className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'staff'
                    ? 'bg-[#07543a] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-neutral-700 hover:bg-neutral-100 border border-neutral-200/70'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Users className="w-4 h-4 shrink-0" />
                  <span className="truncate">Staff Mgmt</span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                  activeTab === 'staff' ? 'bg-white/20 text-white' : 'bg-neutral-200/70 text-neutral-800'
                }`}>
                  {scopedStaffMembers.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-[#07543a] text-white shadow-xs'
                    : 'bg-[#FAF8F5] text-neutral-700 hover:bg-neutral-100 border border-neutral-200/70'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Settings className="w-4 h-4 shrink-0" />
                  <span className="truncate">Settings</span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                  activeTab === 'settings' ? 'bg-white/20 text-white' : 'bg-neutral-200/70 text-neutral-800'
                }`}>
                  ⚙
                </span>
              </button>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex items-center justify-between bg-white p-1 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'menu' ? 'bg-[#07543a] text-white' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Menu Dishes</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full tabular-nums font-bold ${
                  activeTab === 'menu' ? 'bg-white/20 text-white' : 'bg-[#EAE8D5]/50 text-[#07543a]'
                }`}>
                  {menuItems.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'categories' ? 'bg-[#07543a] text-white' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Categories</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full tabular-nums font-bold ${
                  activeTab === 'categories' ? 'bg-white/20 text-white' : 'bg-[#EAE8D5]/50 text-[#07543a]'
                }`}>
                  {scopedCategories.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('tables')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'tables' ? 'bg-[#07543a] text-white' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Tables & QR Codes</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full tabular-nums font-bold ${
                  activeTab === 'tables' ? 'bg-white/20 text-white' : 'bg-[#EAE8D5]/50 text-[#07543a]'
                }`}>
                  {tables.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'analytics' ? 'bg-[#07543a] text-white' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Sales & Analytics</span>
              </button>
              <button
                onClick={() => setActiveTab('staff')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'staff' ? 'bg-[#07543a] text-white' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Staff Management</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full tabular-nums font-bold ${
                  activeTab === 'staff' ? 'bg-white/20 text-white' : 'bg-[#EAE8D5]/50 text-[#07543a]'
                }`}>
                  {scopedStaffMembers.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'settings' ? 'bg-[#07543a] text-white' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>
            </div>
          </div>

        {/* TAB 1: MENU MANAGEMENT */}
        {activeTab === 'menu' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Top Bar with Title, Subtitle, and Create Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-[#151815] glinster-font">
                    Dishes & Beverage Catalogue ({filteredMenuItems.length})
                  </h2>
                  {filteredMenuItems.length !== menuItems.length && (
                    <span className="text-[11px] font-semibold text-neutral-400">
                      (filtered from {menuItems.length})
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Classify dietary profiles, toggle live availability, configure prices & portion customizations
                </p>
              </div>

              {!isAddingItem && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingItemId(null);
                    setFormName('');
                    setFormDescription('');
                    setFormImagePath('');
                    setFormVariants([]);
                    setFormAddons([]);
                    setShowCustomizationInForm(false);
                    setIsAddingItem(true);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-[#07543a] hover:bg-[#053d2a] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer w-full sm:w-auto"
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
                className="p-4 sm:p-5 bg-white rounded-2xl border border-[#07543a]/25 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <h3 className="text-base font-bold text-[#151815] glinster-font flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#07543a]" />
                    <span>{editingItemId ? 'Edit Menu Item' : 'New Dish Configuration'}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddingItem(false)}
                    className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4 text-xs">
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
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-[#FAF8F5] focus:outline-none focus:ring-1 focus:ring-[#07543a]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-[#FAF8F5] focus:outline-none focus:ring-1 focus:ring-[#07543a]"
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
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-[#FAF8F5] font-mono focus:outline-none focus:ring-1 focus:ring-[#07543a]"
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
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-[#FAF8F5] font-semibold text-[#07543a] focus:outline-none focus:ring-1 focus:ring-[#07543a]"
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
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-[#FAF8F5] focus:outline-none focus:ring-1 focus:ring-[#07543a]"
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
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-[#FAF8F5] focus:outline-none focus:ring-1 focus:ring-[#07543a]"
                    />
                  </div>
                </div>

                {/* Food Photography Studio Section */}
                <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-neutral-200/90 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-neutral-800 text-xs flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-[#07543a]" />
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
                          className="py-1.5 px-3 rounded-xl bg-[#07543a] hover:bg-[#053d2a] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
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
                          className="py-1.5 px-3 rounded-xl bg-white hover:bg-neutral-100 text-[#07543a] border border-[#07543a]/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#0a7350]" />
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
                    className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 bg-[#FAF8F5] focus:outline-none focus:ring-1 focus:ring-[#07543a]"
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
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-neutral-200 bg-[#FAF8F5] focus:outline-none focus:ring-1 focus:ring-[#07543a]"
                  />
                </div>

                {/* Interactive Customizations (Variants & Addons) in Form */}
                <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-neutral-200/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#07543a]" />
                      <span className="font-bold text-neutral-800 text-xs">
                        Dish Customization & Extras (Portion Sizes & Add-ons)
                      </span>
                      {(formVariants.length > 0 || formAddons.length > 0) && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EAE8D5] text-[#07543a] font-bold">
                          {formVariants.length} Sizes · {formAddons.length} Extras
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCustomizationInForm(!showCustomizationInForm)}
                      className="text-xs font-bold text-[#07543a] hover:underline cursor-pointer"
                    >
                      {showCustomizationInForm ? 'Hide Options' : 'Configure Sizes & Add-ons'}
                    </button>
                  </div>

                  {showCustomizationInForm && (
                    <div className="space-y-4 pt-2 border-t border-neutral-200/70">
                      {/* 1. Portion Sizes / Variants */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-neutral-700">
                              1. Portion Sizes / Serving Variants:
                            </span>
                            <p className="text-[11px] text-neutral-400">
                              e.g. Regular Portion (+{currentTenant.currencySymbol}0.00), Large / Sharing Platter (+{currentTenant.currencySymbol}5.50)
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newId = `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
                              setFormVariants((prev) => [
                                ...prev,
                                { id: newId, name: prev.length === 0 ? 'Regular' : '', priceDelta: 0 },
                              ]);
                            }}
                            className="text-xs font-bold text-[#07543a] hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Size</span>
                          </button>
                        </div>

                        {/* Quick presets */}
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setFormVariants([
                                { id: `v-${Date.now()}-1`, name: 'Regular Portion', priceDelta: 0 },
                                { id: `v-${Date.now()}-2`, name: 'Large / Sharing', priceDelta: 5.5 },
                              ])
                            }
                            className="px-2 py-0.5 text-[10px] font-semibold bg-white hover:bg-neutral-100 text-[#07543a] rounded-lg border border-[#07543a]/20 cursor-pointer"
                          >
                            + Preset: Regular / Large
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFormVariants([
                                { id: `v-${Date.now()}-1`, name: 'Half Plate', priceDelta: 0 },
                                { id: `v-${Date.now()}-2`, name: 'Full Plate', priceDelta: 4.5 },
                              ])
                            }
                            className="px-2 py-0.5 text-[10px] font-semibold bg-white hover:bg-neutral-100 text-[#07543a] rounded-lg border border-[#07543a]/20 cursor-pointer"
                          >
                            + Preset: Half / Full
                          </button>
                        </div>

                        {formVariants.map((v, idx) => (
                          <div key={v.id || idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-neutral-200">
                            <input
                              type="text"
                              placeholder="Size Name (e.g. Regular)"
                              value={v.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormVariants((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, name: val } : item))
                                );
                              }}
                              className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-neutral-200 bg-[#FAF8F5]"
                            />
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[11px] text-neutral-400">+{currentTenant.currencySymbol}</span>
                              <input
                                type="number"
                                step="0.50"
                                placeholder="0.00"
                                value={v.priceDelta}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setFormVariants((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, priceDelta: val } : item))
                                  );
                                }}
                                className="w-20 px-2 py-1 text-xs rounded-lg border border-neutral-200 bg-[#FAF8F5] font-mono"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setFormVariants((prev) => prev.filter((_, i) => i !== idx))}
                              className="p-1 text-neutral-400 hover:text-red-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* 2. Add-on Extras */}
                      <div className="space-y-2 pt-2 border-t border-neutral-200/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-neutral-700">
                              2. Add-on Extras & Toppings:
                            </span>
                            <p className="text-[11px] text-neutral-400">
                              e.g. Extra Truffle Aioli (+{currentTenant.currencySymbol}1.50), Garlic Butter Naan (+{currentTenant.currencySymbol}2.50)
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newId = `a-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
                              setFormAddons((prev) => [...prev, { id: newId, name: '', price: 1.5 }]);
                            }}
                            className="text-xs font-bold text-[#07543a] hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Extra</span>
                          </button>
                        </div>

                        {/* Quick presets */}
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const newId = `a-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
                              setFormAddons((prev) => [...prev, { id: newId, name: 'Extra Dip / Sauce', price: 1.5 }]);
                            }}
                            className="px-2 py-0.5 text-[10px] font-semibold bg-white hover:bg-neutral-100 text-[#07543a] rounded-lg border border-[#07543a]/20 cursor-pointer"
                          >
                            + Extra Dip (+{currentTenant.currencySymbol}1.50)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const newId = `a-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
                              setFormAddons((prev) => [...prev, { id: newId, name: 'Extra Melted Cheese', price: 2.0 }]);
                            }}
                            className="px-2 py-0.5 text-[10px] font-semibold bg-white hover:bg-neutral-100 text-[#07543a] rounded-lg border border-[#07543a]/20 cursor-pointer"
                          >
                            + Extra Cheese (+{currentTenant.currencySymbol}2.00)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const newId = `a-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
                              setFormAddons((prev) => [...prev, { id: newId, name: 'Garlic Butter Naan', price: 2.5 }]);
                            }}
                            className="px-2 py-0.5 text-[10px] font-semibold bg-white hover:bg-neutral-100 text-[#07543a] rounded-lg border border-[#07543a]/20 cursor-pointer"
                          >
                            + Garlic Naan (+{currentTenant.currencySymbol}2.50)
                          </button>
                        </div>

                        {formAddons.map((addon, idx) => (
                          <div key={addon.id || idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-neutral-200">
                            <input
                              type="text"
                              placeholder="Add-on Name (e.g. Extra Truffle Aioli)"
                              value={addon.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormAddons((prev) =>
                                  prev.map((item, i) => (i === idx ? { ...item, name: val } : item))
                                );
                              }}
                              className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-neutral-200 bg-[#FAF8F5]"
                            />
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-[11px] text-neutral-400">{currentTenant.currencySymbol}</span>
                              <input
                                type="number"
                                step="0.25"
                                placeholder="1.50"
                                value={addon.price}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setFormAddons((prev) =>
                                    prev.map((item, i) => (i === idx ? { ...item, price: val } : item))
                                  );
                                }}
                                className="w-20 px-2 py-1 text-xs rounded-lg border border-neutral-200 bg-[#FAF8F5] font-mono"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setFormAddons((prev) => prev.filter((_, i) => i !== idx))}
                              className="p-1 text-neutral-400 hover:text-red-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-6 pt-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsRecommended}
                      onChange={(e) => setFormIsRecommended(e.target.checked)}
                      className="w-4 h-4 rounded text-[#07543a]"
                    />
                    <span className="font-semibold text-neutral-700">Chef&apos;s Recommendation</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsMustTry}
                      onChange={(e) => setFormIsMustTry(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0a7350]"
                    />
                    <span className="font-semibold text-[#0a7350]">Must-Try Signature</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setIsAddingItem(false)}
                    className="py-2 px-4 rounded-xl border border-neutral-200 text-neutral-600 text-xs font-semibold hover:bg-neutral-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-5 rounded-xl bg-[#07543a] text-white text-xs font-bold hover:bg-[#053d2a] cursor-pointer"
                  >
                    {editingItemId ? 'Update Dish' : 'Publish to Digital Menu'}
                  </button>
                </div>
              </form>
            )}

            {/* Menu Search & Filter Controls */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dishes by name, ingredients, or allergens..."
                  className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-[#FAF8F5] border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-[#07543a]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filters bar */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                {/* Category select */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl bg-[#FAF8F5] border border-neutral-200 text-neutral-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#07543a] cursor-pointer"
                >
                  <option value="all">All Categories ({menuItems.length})</option>
                  {categories.map((c) => {
                    const count = menuItems.filter((i) => i.categoryId === c.id).length;
                    return (
                      <option key={c.id} value={c.id}>
                        {c.name} ({count})
                      </option>
                    );
                  })}
                </select>

                {/* Dietary select */}
                <select
                  value={menuDietaryFilter}
                  onChange={(e) => setMenuDietaryFilter(e.target.value as 'all' | FoodType)}
                  className="px-2.5 py-1.5 text-xs rounded-xl bg-[#FAF8F5] border border-neutral-200 text-neutral-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#07543a] cursor-pointer"
                >
                  <option value="all">All Dietary Types</option>
                  <option value="veg">● Vegetarian Only</option>
                  <option value="vegan">🌱 100% Vegan Only</option>
                  <option value="non_veg">▲ Non-Veg Only</option>
                  <option value="egg">🥚 Eggitarian Only</option>
                </select>

                {/* Availability Filter */}
                <div className="flex items-center bg-[#FAF8F5] p-1 rounded-xl border border-neutral-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setMenuFilter('all')}
                    className={`px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      menuFilter === 'all' ? 'bg-white shadow-2xs text-[#151815] font-bold' : 'text-neutral-500'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setMenuFilter('available')}
                    className={`px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      menuFilter === 'available' ? 'bg-white shadow-2xs text-emerald-700 font-bold' : 'text-neutral-500'
                    }`}
                  >
                    In Stock
                  </button>
                  <button
                    type="button"
                    onClick={() => setMenuFilter('sold_out')}
                    className={`px-2 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      menuFilter === 'sold_out' ? 'bg-white shadow-2xs text-red-700 font-bold' : 'text-neutral-500'
                    }`}
                  >
                    Sold Out
                  </button>
                </div>

                {/* Reset Filters button */}
                {(searchQuery || categoryFilter !== 'all' || menuDietaryFilter !== 'all' || menuFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('all');
                      setMenuDietaryFilter('all');
                      setMenuFilter('all');
                    }}
                    className="px-2.5 py-1 text-xs text-[#07543a] bg-emerald-50 hover:bg-emerald-100 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>

            {/* Empty state when no dishes match */}
            {filteredMenuItems.length === 0 && (
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-8 sm:p-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center mb-3">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#151815]">No dishes found</h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                  No menu items matched your active search or filters. Try adjusting your search query or reset filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                    setMenuDietaryFilter('all');
                    setMenuFilter('all');
                  }}
                  className="mt-4 px-4 py-2 text-xs font-semibold text-[#07543a] bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* PHONE VIEW: MOBILE CARDS LIST (Clean, thumb-friendly, no sideways scroll) */}
            <div className="block md:hidden space-y-3">
              {filteredMenuItems.map((item) => {
                const category = categories.find((c) => c.id === item.categoryId);
                const hasCustomizations =
                  (item.variants && item.variants.length > 0) ||
                  (item.addons && item.addons.length > 0);

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-neutral-200/90 p-3.5 shadow-2xs space-y-3 transition-all"
                  >
                    {/* Top Row: Thumbnail + Title + Category + Price */}
                    <div className="flex items-start gap-3">
                      <div
                        onClick={() => {
                          setSelectedDishForImage(item);
                          setFormImagePath(item.imagePath || '');
                          setIsImageStudioOpen(true);
                        }}
                        className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 cursor-pointer shadow-2xs group/mthumb"
                        title="Tap to change or capture photo"
                      >
                        {item.imagePath ? (
                          <img
                            src={item.imagePath}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400 bg-neutral-50">
                            <Camera className="w-5 h-5" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/mthumb:opacity-100 transition-opacity text-white">
                          <Camera className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="min-w-0">
                            {/* Dietary Badge & Category Pill */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                  item.foodType === 'veg'
                                    ? 'bg-emerald-50 text-[#07543a] border border-emerald-200'
                                    : item.foodType === 'vegan'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                    : item.foodType === 'egg'
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                }`}
                              >
                                <span>
                                  {item.foodType === 'veg'
                                    ? '●'
                                    : item.foodType === 'vegan'
                                    ? '🌱'
                                    : item.foodType === 'egg'
                                    ? '🥚'
                                    : '▲'}
                                </span>
                                <span className="uppercase text-[9px]">{item.foodType}</span>
                              </span>
                              <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                                {category?.name || 'Mains'}
                              </span>
                            </div>
                            <h4 className="font-bold text-sm text-[#151815] mt-1 line-clamp-1">
                              {item.name}
                            </h4>
                          </div>

                          <div className="font-mono font-bold text-sm text-[#07543a] shrink-0">
                            {currentTenant.currencySymbol}{item.basePrice.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {item.description && (
                      <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {/* Badges & Customization Indicator */}
                    <div className="flex items-center justify-between gap-1.5 flex-wrap pt-0.5 text-xs">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => toggleItemFlag(item.id, 'isRecommended')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                            item.isRecommended
                              ? 'bg-[#07543a] text-white shadow-2xs'
                              : 'bg-neutral-100 text-neutral-500 hover:text-neutral-800'
                          }`}
                        >
                          👨‍🍳 Chef
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleItemFlag(item.id, 'isMustTry')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                            item.isMustTry
                              ? 'bg-[#0a7350] text-white shadow-2xs'
                              : 'bg-neutral-100 text-neutral-500 hover:text-neutral-800'
                          }`}
                        >
                          ⭐ Must-Try
                        </button>
                      </div>

                      {/* Customize dish button / badge */}
                      <button
                        type="button"
                        onClick={() => setCustomizingDish(item)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                          hasCustomizations
                            ? 'bg-[#EAE8D5]/70 text-[#07543a] border border-[#07543a]/25 hover:bg-[#EAE8D5]'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        <Sparkles className="w-3 h-3 text-[#0a7350]" />
                        <span>
                          {hasCustomizations
                            ? `${item.variants?.length || 0} Sizes · ${item.addons?.length || 0} Extras`
                            : '+ Add Customization'}
                        </span>
                      </button>
                    </div>

                    {/* Action Bar: In Stock Toggle + Edit / Duplicate / Delete */}
                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => toggleItemAvailability(item.id)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          item.isAvailable
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.isAvailable ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                        />
                        <span>{item.isAvailable ? 'In Stock (Live)' : 'Sold Out'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => startEditItem(item)}
                        className="py-2 px-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                        title="Edit Dish"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicate(item.id)}
                        className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 cursor-pointer"
                        title="Duplicate Dish"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete "${item.name}"?`)) {
                            deleteMenuItem(item.id);
                          }
                        }}
                        className="p-2 rounded-xl border border-neutral-200 hover:bg-red-50 text-neutral-400 hover:text-red-600 cursor-pointer"
                        title="Delete Dish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP VIEW: MENU ITEMS TABLE */}
            <div className="hidden md:block bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-neutral-200 text-neutral-600 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Photo</th>
                      <th className="py-3 px-4">Dish</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Dietary Type</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Badges</th>
                      <th className="py-3 px-4">Customizations</th>
                      <th className="py-3 px-4">In Stock</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredMenuItems.map((item) => {
                      const category = categories.find((c) => c.id === item.categoryId);
                      const hasCustomizations =
                        (item.variants && item.variants.length > 0) ||
                        (item.addons && item.addons.length > 0);

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
                          <td className="py-3 px-4 font-bold text-[#151815]">
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
                                  ? 'text-[#07543a]'
                                  : 'text-[#0a7350]'
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
                                    ? 'bg-[#07543a] text-white'
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
                                    ? 'bg-[#0a7350] text-white'
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
                              onClick={() => setCustomizingDish(item)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer ${
                                hasCustomizations
                                  ? 'bg-[#EAE8D5]/70 text-[#07543a] border border-[#07543a]/25 hover:bg-[#EAE8D5]'
                                  : 'bg-neutral-100 text-neutral-500 hover:text-neutral-800'
                              }`}
                              title="Configure sizes and add-ons for this dish"
                            >
                              <Sparkles className="w-3 h-3 text-[#0a7350]" />
                              <span>
                                {hasCustomizations
                                  ? `${item.variants?.length || 0} Sizes · ${item.addons?.length || 0} Extras`
                                  : '+ Add Options'}
                              </span>
                            </button>
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
                                className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
                                title="Edit item"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDuplicate(item.id)}
                                className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
                                title="Duplicate item"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Delete "${item.name}"?`)) {
                                    deleteMenuItem(item.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
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

        {/* TAB: CATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#151815] glinster-font">
                  Food Categories & Sections ({scopedCategories.length})
                </h2>
                <p className="text-xs text-neutral-500">
                  Organize menu courses, upload beautiful section imagery, and structure diner navigation
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddCategory}
                className="py-2.5 px-4 rounded-xl bg-[#07543a] hover:bg-[#053d2a] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Food Category</span>
              </button>
            </div>

            {/* Category Search & Filter */}
            <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-[#07543a]"
                />
              </div>
              <div className="text-xs text-neutral-500 font-medium">
                {scopedCategories.length} {scopedCategories.length === 1 ? 'category' : 'categories'} configured
              </div>
            </div>

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredScopedCategories.map((cat) => {
                const itemCount = menuItems.filter((i) => i.categoryId === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-2xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Rounded Category Avatar */}
                      <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 bg-[#EAE8D5]/20 ring-2 ring-[#EAE8D5] shadow-xs">
                        <img
                          src={cat.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80'}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80';
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-[#151815] truncate group-hover:text-[#07543a] transition-colors">
                            {cat.name}
                          </h3>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EAE8D5]/40 text-[#07543a] font-bold shrink-0">
                            {itemCount} {itemCount === 1 ? 'dish' : 'dishes'}
                          </span>
                        </div>
                        {cat.description ? (
                          <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                            {cat.description}
                          </p>
                        ) : (
                          <p className="text-xs text-neutral-400 italic mt-1">No description provided</p>
                        )}
                        <div className="mt-2 text-[10px] text-neutral-400 font-mono">
                          slug: /{cat.slug}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                      <span className="text-[11px] text-neutral-400">
                        Display order: #{cat.displayOrder || 1}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditCategory(cat)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-[#07543a] hover:bg-[#FAF8F5] border border-neutral-200 transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCategoryDeleteTarget(cat)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-red-600 hover:bg-red-50 border border-neutral-200 transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredScopedCategories.length === 0 && (
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-12 text-center">
                <FolderPlus className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-neutral-800">No categories found</h3>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-1 mb-4">
                  {categorySearchQuery ? 'No categories matched your search criteria.' : 'Create your first food category to start grouping dishes.'}
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddCategory}
                  className="py-2 px-4 rounded-xl bg-[#07543a] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Category</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TABLES & QR CODES */}
        {activeTab === 'tables' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#151815] glinster-font">
                  Floor Tables & Cryptographic QR Codes ({tables.length} tables)
                </h2>
                <p className="text-xs text-neutral-500">
                  Each QR code binds the diner securely to their designated table
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setCurrentRole('qr_stand')}
                  className="py-2.5 px-3.5 rounded-xl bg-[#0a7350] hover:bg-[#07543a] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer w-full sm:w-auto"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch Table Stand Studio</span>
                </button>

                {/* Add Table Mini Form */}
                <form onSubmit={handleAddTableSubmit} className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    required
                    placeholder="Table Name (e.g. Patio 3)"
                    value={newTableNumber}
                    onChange={(e) => setNewTableNumber(e.target.value)}
                    className="flex-1 sm:w-44 px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#07543a]"
                  />
                  <select
                    value={newTableCapacity}
                    onChange={(e) => setNewTableCapacity(e.target.value)}
                    className="px-2.5 py-2 text-xs rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#07543a]"
                  >
                    <option value="2">2 Seats</option>
                    <option value="4">4 Seats</option>
                    <option value="6">6 Seats</option>
                    <option value="8">8 Seats</option>
                  </select>
                  <button
                    type="submit"
                    className="py-2 px-3.5 rounded-xl bg-[#07543a] text-white text-xs font-bold hover:bg-[#053d2a] shrink-0 cursor-pointer"
                  >
                    + Add
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
            <h2 className="text-lg font-bold text-[#151815] glinster-font">
              Daily Restaurant Performance & Volume
            </h2>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-xs font-semibold">Total Revenue</span>
                  <DollarSign className="w-4 h-4 text-[#07543a]" />
                </div>
                <div className="text-2xl font-black font-mono tabular-nums text-[#151815] mt-2">
                  {currentTenant.currencySymbol}{totalSales.toFixed(2)}
                </div>
                <div className="text-[11px] text-[#07543a] font-semibold mt-1">
                  Active orders & completed
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-xs font-semibold">Orders Today</span>
                  <ShoppingBag className="w-4 h-4 text-[#0a7350]" />
                </div>
                <div className="text-2xl font-black font-mono tabular-nums text-[#151815] mt-2">
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
                <div className="text-2xl font-black font-mono tabular-nums text-[#151815] mt-2">
                  {currentTenant.currencySymbol}{avgOrderValue.toFixed(2)}
                </div>
                <div className="text-[11px] text-neutral-500 mt-1">
                  Per seated party
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-xs font-semibold">Membership Plan</span>
                  <Calendar className="w-4 h-4 text-[#07543a]" />
                </div>
                <div className="text-base font-bold text-[#151815] mt-2">
                  {currentTenant.subscription.planName}
                </div>
                <div className="text-[11px] text-[#07543a] font-semibold mt-1">
                  Expires: {new Date(currentTenant.subscription.expiryDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Orders Breakdown List */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-[#151815] glinster-font">
                Recent Orders Stream
              </h3>
              <div className="space-y-2">
                {tenantOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-3 bg-[#FAF8F5] rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-[#07543a]">
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
          <div className="max-w-2xl bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-6 shadow-2xs space-y-5">
            <div>
              <h2 className="text-lg font-bold text-[#151815] glinster-font">
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
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-[#FAF8F5] text-sm font-semibold"
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
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-[#FAF8F5]"
                />
              </div>

              {/* Restaurant Logo Settings */}
              <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-neutral-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-neutral-700">
                    Restaurant Brand Logo
                  </label>
                  {restaurantLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setRestaurantLogoUrl('')}
                      className="text-[11px] text-red-500 hover:text-red-600 font-semibold cursor-pointer"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-white border border-neutral-200 shadow-xs flex items-center justify-center p-1 overflow-hidden shrink-0">
                    {restaurantLogoUrl ? (
                      <img
                        src={restaurantLogoUrl}
                        alt="Restaurant Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-neutral-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#07543a] hover:bg-[#053d2a] text-white text-xs font-semibold cursor-pointer transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Logo File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 5 * 1024 * 1024) {
                            alert('Logo file must be under 5MB');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (typeof ev.target?.result === 'string') {
                              setRestaurantLogoUrl(ev.target.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Or paste image URL (https://...)"
                      value={restaurantLogoUrl}
                      onChange={(e) => setRestaurantLogoUrl(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-neutral-200 text-neutral-800 text-[11px] focus:outline-none focus:ring-1 focus:ring-[#07543a]"
                    />
                  </div>
                </div>
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
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-[#FAF8F5] font-mono"
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
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 bg-[#FAF8F5] font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOpen}
                    onChange={(e) => setIsOpen(e.target.checked)}
                    className="w-4 h-4 rounded text-[#07543a]"
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
                  <span className="text-xs text-[#07543a] font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Settings saved successfully!
                  </span>
                ) : (
                  <span />
                )}

                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-[#07543a] hover:bg-[#053d2a] text-white font-bold text-xs shadow-sm transition-colors"
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
            {/* Top Bar with Title, Subtitle, and Add Staff Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-[#151815] glinster-font">
                    Staff & Operations Management
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#07543a]/10 text-[#07543a]">
                    {scopedStaffMembers.length} Members
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Manage active restaurant personnel, station assignments, and reset secure staff credentials.
                </p>
              </div>

              <button
                onClick={() => {
                  setNewStaffName('');
                  setNewStaffUsername('');
                  setNewStaffRole('waiter');
                  setNewStaffStation('');
                  setNewStaffPhone('');
                  setNewStaffEmail('');
                  setNewStaffPassword(generateSecurePassword());
                  setShowNewStaffPassword(false);
                  setIsAddStaffOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#07543a] hover:bg-[#053d2a] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Staff Member</span>
              </button>
            </div>

            {/* Quick Metrics KPI cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-neutral-500">Total Roster</span>
                  <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-black text-[#151815] glinster-font">
                  {scopedStaffMembers.length}
                </div>
                <span className="text-[10px] text-neutral-400">Scoped to {currentTenant.name}</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-neutral-500">Dining Waiters</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#07543a] flex items-center justify-center">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-black text-[#07543a] glinster-font">
                  {scopedStaffMembers.filter((s) => s.role === 'waiter').length}
                </div>
                <span className="text-[10px] text-emerald-600/80 font-medium">Floor & Table Service</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-neutral-500">Kitchen Brigade</span>
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <ChefHat className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-black text-amber-700 glinster-font">
                  {scopedStaffMembers.filter((s) => s.role === 'kitchen').length}
                </div>
                <span className="text-[10px] text-amber-600/80 font-medium">Line Chefs & Prep</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-neutral-500">Active Now</span>
                  <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-black text-[#151815] glinster-font">
                  {scopedStaffMembers.filter((s) => s.status === 'active').length}
                </div>
                <span className="text-[10px] text-teal-600/80 font-medium">Ready for duty</span>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search staff by name, @username, or station..."
                  value={staffSearchQuery}
                  onChange={(e) => setStaffSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#FAF8F5] border border-neutral-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#07543a]/20 focus:border-[#07543a] transition-all"
                />
                {staffSearchQuery && (
                  <button
                    onClick={() => setStaffSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Role Filter Pills */}
                <div className="flex items-center bg-[#FAF8F5] p-1 rounded-xl border border-neutral-200/80 text-xs">
                  <button
                    onClick={() => setStaffRoleFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      staffRoleFilter === 'all'
                        ? 'bg-white shadow-2xs text-[#151815] font-bold'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    All Roles ({scopedStaffMembers.length})
                  </button>
                  <button
                    onClick={() => setStaffRoleFilter('waiter')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      staffRoleFilter === 'waiter'
                        ? 'bg-white shadow-2xs text-[#07543a] font-bold'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    Waiters ({scopedStaffMembers.filter((s) => s.role === 'waiter').length})
                  </button>
                  <button
                    onClick={() => setStaffRoleFilter('kitchen')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      staffRoleFilter === 'kitchen'
                        ? 'bg-white shadow-2xs text-amber-700 font-bold'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    Kitchen ({scopedStaffMembers.filter((s) => s.role === 'kitchen').length})
                  </button>
                  <button
                    onClick={() => setStaffRoleFilter('admin')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      staffRoleFilter === 'admin'
                        ? 'bg-white shadow-2xs text-[#07543a] font-bold'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    Admins ({scopedStaffMembers.filter((s) => s.role === 'admin').length})
                  </button>
                </div>

                {/* Status Filter */}
                <select
                  value={staffStatusFilter}
                  onChange={(e) => setStaffStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  className="px-2.5 py-1.5 text-xs rounded-xl bg-[#FAF8F5] border border-neutral-200/80 text-neutral-700 font-medium focus:outline-none focus:border-[#07543a]"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>

            {/* Staff Members List */}
            {scopedStaffMembers.filter((staff) => {
              const query = staffSearchQuery.toLowerCase();
              const matchesSearch =
                staff.name.toLowerCase().includes(query) ||
                staff.username.toLowerCase().includes(query) ||
                (staff.station && staff.station.toLowerCase().includes(query)) ||
                (staff.phone && staff.phone.includes(query)) ||
                (staff.email && staff.email.toLowerCase().includes(query));
              const matchesRole = staffRoleFilter === 'all' || staff.role === staffRoleFilter;
              const matchesStatus = staffStatusFilter === 'all' || staff.status === staffStatusFilter;
              return matchesSearch && matchesRole && matchesStatus;
            }).length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 mx-auto flex items-center justify-center mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#151815]">No staff members found</h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                  {staffSearchQuery || staffRoleFilter !== 'all' || staffStatusFilter !== 'all'
                    ? 'No staff members match your active filters. Try adjusting your search query or reset the filters.'
                    : 'Get started by creating your first restaurant staff credential.'}
                </p>
                {(staffSearchQuery || staffRoleFilter !== 'all' || staffStatusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setStaffSearchQuery('');
                      setStaffRoleFilter('all');
                      setStaffStatusFilter('all');
                    }}
                    className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-[#07543a] bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {scopedStaffMembers
                  .filter((staff) => {
                    const query = staffSearchQuery.toLowerCase();
                    const matchesSearch =
                      staff.name.toLowerCase().includes(query) ||
                      staff.username.toLowerCase().includes(query) ||
                      (staff.station && staff.station.toLowerCase().includes(query)) ||
                      (staff.phone && staff.phone.includes(query)) ||
                      (staff.email && staff.email.toLowerCase().includes(query));
                    const matchesRole = staffRoleFilter === 'all' || staff.role === staffRoleFilter;
                    const matchesStatus = staffStatusFilter === 'all' || staff.status === staffStatusFilter;
                    return matchesSearch && matchesRole && matchesStatus;
                  })
                  .map((staff) => {
                    const roleBadgeConfig =
                      staff.role === 'kitchen'
                        ? {
                            label: 'Kitchen & Chef',
                            bg: 'bg-amber-50 text-amber-800 border-amber-200/80',
                            icon: ChefHat,
                            avatarBg: 'bg-gradient-to-br from-amber-400 to-amber-600 text-white',
                          }
                        : staff.role === 'admin'
                        ? {
                            label: 'Restaurant Admin',
                            bg: 'bg-emerald-50 text-emerald-900 border-emerald-200/80',
                            icon: ShieldCheck,
                            avatarBg: 'bg-gradient-to-br from-[#07543a] to-[#0a7350] text-white',
                          }
                        : {
                            label: 'Floor Waiter',
                            bg: 'bg-emerald-50 text-[#07543a] border-emerald-200/80',
                            icon: UtensilsCrossed,
                            avatarBg: 'bg-gradient-to-br from-[#07543a] to-[#0a7350] text-white',
                          };

                    const RoleIcon = roleBadgeConfig.icon;
                    const initials = staff.name
                      ? staff.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                      : staff.username.slice(0, 2).toUpperCase();

                    return (
                      <div
                        key={staff.id}
                        className={`bg-white rounded-2xl border transition-all p-4 flex flex-col justify-between shadow-2xs hover:shadow-sm ${
                          staff.status === 'active' ? 'border-neutral-200/90' : 'border-neutral-200/50 opacity-75'
                        }`}
                      >
                        {/* Member Header */}
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm tracking-wide shadow-2xs shrink-0 ${roleBadgeConfig.avatarBg}`}
                              >
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-sm font-bold text-[#151815] truncate leading-tight">
                                  {staff.name}
                                </h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[11px] font-mono text-neutral-500 truncate">
                                    @{staff.username}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Status badge toggle */}
                            <button
                              onClick={() => toggleStaffStatus(staff.id)}
                              title={`Click to ${staff.status === 'active' ? 'deactivate' : 'activate'}`}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors shrink-0 ${
                                staff.status === 'active'
                                  ? 'bg-emerald-50 text-[#07543a] border border-emerald-200/80 hover:bg-emerald-100'
                                  : 'bg-neutral-100 text-neutral-500 border border-neutral-200 hover:bg-neutral-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  staff.status === 'active' ? 'bg-[#07543a] animate-pulse' : 'bg-neutral-400'
                                }`}
                              />
                              <span className="capitalize">{staff.status}</span>
                            </button>
                          </div>

                          {/* Role and Station details */}
                          <div className="mt-3.5 space-y-2">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${roleBadgeConfig.bg}`}
                              >
                                <RoleIcon className="w-3 h-3" />
                                {roleBadgeConfig.label}
                              </span>
                            </div>

                            {staff.station && (
                              <div className="text-xs text-neutral-600 bg-[#FAF8F5] px-2.5 py-1.5 rounded-xl border border-neutral-200/60 flex items-center gap-1.5">
                                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider shrink-0">
                                  Station:
                                </span>
                                <span className="font-medium text-neutral-800 truncate">{staff.station}</span>
                              </div>
                            )}

                            {/* Contact Info (if available) */}
                            {(staff.phone || staff.email) && (
                              <div className="text-[11px] text-neutral-500 space-y-0.5 pt-0.5">
                                {staff.phone && (
                                  <div className="flex items-center gap-1.5 truncate">
                                    <Phone className="w-3 h-3 text-neutral-400 shrink-0" />
                                    <span>{staff.phone}</span>
                                  </div>
                                )}
                                {staff.email && (
                                  <div className="flex items-center gap-1.5 truncate">
                                    <Mail className="w-3 h-3 text-neutral-400 shrink-0" />
                                    <span className="truncate">{staff.email}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions footer */}
                        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                          <button
                            onClick={() => {
                              setResetPasswordStaff(staff);
                              setNewPasswordInput(generateSecurePassword());
                              setShowResetPassword(false);
                              setResetSuccessMessage('');
                              setIsCopied(false);
                            }}
                            className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                            <span>Reset Password</span>
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Remove staff member "${staff.name}" (@${staff.username})?`)) {
                                deleteStaff(staff.id);
                              }
                            }}
                            title="Remove Staff"
                            className="p-1.5 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* MODAL: RESET STAFF PASSWORD */}
        {resetPasswordStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-neutral-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#151815] glinster-font">
                      Reset Staff Password
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Configure fresh access credentials for {resetPasswordStaff.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setResetPasswordStaff(null)}
                  className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Staff preview chip */}
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-neutral-200/80 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-neutral-800">{resetPasswordStaff.name}</div>
                  <div className="text-neutral-500 font-mono text-[11px]">@{resetPasswordStaff.username}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-200 text-neutral-700">
                    {resetPasswordStaff.role}
                  </span>
                  <div className="text-[10px] text-neutral-400 mt-0.5">{resetPasswordStaff.station || 'General'}</div>
                </div>
              </div>

              {/* Success notification banner */}
              {resetSuccessMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{resetSuccessMessage}</span>
                </div>
              )}

              {/* Password Input & Generator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-700">
                    New Security Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const pass = generateSecurePassword();
                      setNewPasswordInput(pass);
                      setIsCopied(false);
                    }}
                    className="text-[11px] font-bold text-[#07543a] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>Auto-Generate</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    value={newPasswordInput}
                    onChange={(e) => {
                      setNewPasswordInput(e.target.value);
                      setIsCopied(false);
                    }}
                    placeholder="Enter new password (min 6 characters)"
                    className="w-full px-3 py-2.5 text-xs font-mono rounded-xl bg-[#FAF8F5] border border-neutral-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#07543a]/20 focus:border-[#07543a]"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="p-1 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                      title={showResetPassword ? 'Hide password' : 'Show password'}
                    >
                      {showResetPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (newPasswordInput) {
                          navigator.clipboard.writeText(newPasswordInput);
                          setIsCopied(true);
                          setTimeout(() => setIsCopied(false), 2000);
                        }
                      }}
                      className="p-1 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                      title="Copy password to clipboard"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-400">
                  Password will synchronize with the staff access database. Share this password with the employee.
                </p>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetPasswordStaff(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!newPasswordInput.trim() || newPasswordInput.length < 4}
                  onClick={async () => {
                    if (!resetPasswordStaff || !newPasswordInput.trim()) return;
                    await resetStaffPassword(resetPasswordStaff.id, newPasswordInput.trim());
                    setResetSuccessMessage(`Password updated for ${resetPasswordStaff.name}!`);
                    setTimeout(() => {
                      setResetPasswordStaff(null);
                      setResetSuccessMessage('');
                    }, 1200);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#07543a] hover:bg-[#053d2a] disabled:opacity-50 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Save & Update Password
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD NEW STAFF MEMBER */}
        {isAddStaffOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-neutral-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#07543a]">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#151815] glinster-font">
                      Add New Staff Member
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Create operational credentials for {currentTenant.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddStaffOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newStaffUsername.trim() || !newStaffPassword.trim()) return;
                  await addStaff({
                    name: newStaffName.trim() || newStaffUsername.trim(),
                    username: newStaffUsername.trim().toLowerCase().replace(/\s+/g, '.'),
                    password: newStaffPassword.trim(),
                    role: newStaffRole,
                    station: newStaffStation.trim(),
                    phone: newStaffPhone.trim(),
                    email: newStaffEmail.trim(),
                  });
                  setIsAddStaffOpen(false);
                }}
                className="space-y-3.5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. David Miller"
                      value={newStaffName}
                      onChange={(e) => {
                        setNewStaffName(e.target.value);
                        if (!newStaffUsername) {
                          setNewStaffUsername(
                            e.target.value.toLowerCase().replace(/\s+/g, '.')
                          );
                        }
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF8F5] border border-neutral-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#07543a]/20 focus:border-[#07543a]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Username / Login ID *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. david.server"
                      value={newStaffUsername}
                      onChange={(e) => setNewStaffUsername(e.target.value.toLowerCase().replace(/\s+/g, '.'))}
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-[#FAF8F5] border border-neutral-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#07543a]/20 focus:border-[#07543a]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Staff Role *
                    </label>
                    <select
                      value={newStaffRole}
                      onChange={(e) => setNewStaffRole(e.target.value as StaffRole)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF8F5] border border-neutral-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#07543a]/20 focus:border-[#07543a]"
                    >
                      <option value="waiter">Floor Waiter / Server</option>
                      <option value="kitchen">Kitchen Staff / Chef</option>
                      <option value="admin">Restaurant Admin / Floor Manager</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Floor / Station Assignment
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Main Dining Floor (Tables 1-5)"
                      value={newStaffStation}
                      onChange={(e) => setNewStaffStation(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF8F5] border border-neutral-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#07543a]/20 focus:border-[#07543a]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={newStaffPhone}
                      onChange={(e) => setNewStaffPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF8F5] border border-neutral-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#07543a]/20 focus:border-[#07543a]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-700 block mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      placeholder="staff@restaurant.com"
                      value={newStaffEmail}
                      onChange={(e) => setNewStaffEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF8F5] border border-neutral-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#07543a]/20 focus:border-[#07543a]"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-neutral-700">
                      Initial Access Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => setNewStaffPassword(generateSecurePassword())}
                      className="text-[11px] font-bold text-[#07543a] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Shuffle className="w-3 h-3" />
                      <span>Auto-Generate</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showNewStaffPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={newStaffPassword}
                      onChange={(e) => setNewStaffPassword(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-[#FAF8F5] border border-neutral-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#07543a]/20 focus:border-[#07543a]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewStaffPassword(!showNewStaffPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                    >
                      {showNewStaffPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddStaffOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-[#07543a] hover:bg-[#053d2a] rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    Register Staff Member
                  </button>
                </div>
              </form>
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

        {/* DISH CUSTOMIZATION MODAL */}
        <DishCustomizationModal
          isOpen={Boolean(customizingDish)}
          dish={customizingDish}
          currencySymbol={currentTenant.currencySymbol}
          onClose={() => setCustomizingDish(null)}
          onSave={handleQuickSaveCustomization}
        />

        {/* ADD / EDIT CATEGORY MODAL */}
        {isAddCategoryOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200 max-w-lg w-full p-5 sm:p-6 shadow-2xl relative my-auto">
              <button
                type="button"
                onClick={() => {
                  setIsAddCategoryOpen(false);
                  setEditingCategory(null);
                }}
                className="absolute right-4 top-4 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#07543a]/10 text-[#07543a] flex items-center justify-center font-bold">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#151815] glinster-font">
                    {editingCategory ? 'Edit Food Category' : 'Create New Food Category'}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Configure title, description, and upload appetizing cover image
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryFormName}
                    onChange={(e) => setCategoryFormName(e.target.value)}
                    placeholder="e.g., Artisanal Pizzas, Handcrafted Mocktails"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-[#07543a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={categoryFormDescription}
                    onChange={(e) => setCategoryFormDescription(e.target.value)}
                    placeholder="e.g., 48-hour fermented sourdough with buffalo mozzarella and herbs"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-[#07543a] resize-none"
                  />
                </div>

                {/* Image Upload & Preview Section */}
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE8D5]/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#07543a]">Category Photo (Rounded Preview)</span>
                    <span className="text-[10px] text-neutral-400">Live Zomato Style</span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Live Circular Preview */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shrink-0 ring-3 ring-[#07543a] ring-offset-2 shadow-md bg-neutral-100">
                      <img
                        src={categoryFormImageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80'}
                        alt="Category Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80';
                        }}
                      />
                    </div>

                    <div className="flex-1 space-y-2">
                      {/* File Upload Button */}
                      <div>
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-50 border border-[#07543a]/40 text-[#07543a] text-xs font-bold shadow-2xs cursor-pointer transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Photo from Device</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCategoryFileUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[10px] text-neutral-400 mt-1">PNG, JPG, WebP supported</p>
                      </div>

                      {/* Or URL input */}
                      <div>
                        <input
                          type="url"
                          value={categoryFormImageUrl}
                          onChange={(e) => setCategoryFormImageUrl(e.target.value)}
                          placeholder="Or paste public image URL..."
                          className="w-full px-3 py-1.5 text-xs rounded-lg bg-white border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-[#07543a]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Presets Carousel */}
                  <div>
                    <span className="text-[10.5px] font-semibold text-neutral-600 block mb-1.5">
                      Or select a curated dish photography preset:
                    </span>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                      {CATEGORY_PHOTO_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setCategoryFormImageUrl(preset.url)}
                          className={`group shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-xl border text-[11px] font-medium transition-colors cursor-pointer ${
                            categoryFormImageUrl === preset.url
                              ? 'bg-[#07543a] text-white border-[#07543a]'
                              : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="whitespace-nowrap">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddCategoryOpen(false);
                      setEditingCategory(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#07543a] hover:bg-[#053d2a] text-white shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingCategory ? 'Update Category' : 'Save Category'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETE CATEGORY CONFIRMATION MODAL */}
        {categoryDeleteTarget && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200 max-w-md w-full p-5 sm:p-6 shadow-2xl relative my-auto">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold mb-4 mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <h3 className="text-base font-bold text-center text-[#151815] glinster-font mb-1.5">
                Delete &quot;{categoryDeleteTarget.name}&quot;?
              </h3>
              <p className="text-xs text-neutral-500 text-center leading-relaxed mb-4">
                Are you sure you want to remove this category? Any dishes currently assigned to it will be safely protected and reassigned to another active category so they are never lost.
              </p>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setCategoryDeleteTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  Keep Category
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteCategory}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Confirm Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  </div>
  );
};
