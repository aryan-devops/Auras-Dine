export type FoodType = 'veg' | 'non_veg' | 'vegan' | 'egg';

export type DietaryFilterValue = 'all' | 'veg' | 'non_veg';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export type ServiceRequestType = 'waiter' | 'water' | 'bill' | 'clean' | 'urgent';
export type ServiceRequestStatus = 'open' | 'in_progress' | 'resolved';

export interface MenuItemVariant {
  id: string;
  name: string; // e.g. "Regular", "Large", "Bowl"
  priceDelta: number; // e.g. 0 or +3.50
}

export interface MenuItemAddon {
  id: string;
  name: string; // e.g. "Extra Truffle Aioli", "Garlic Naan"
  price: number;
}

export interface MenuItem {
  id: string;
  tenantId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  foodType: FoodType;
  imagePath?: string;
  isAvailable: boolean;
  isRecommended: boolean;
  isMustTry: boolean;
  isTodaySpecial?: boolean;
  specialStartDate?: string;
  specialEndDate?: string;
  isBestseller?: boolean;
  isTemporarilyUnavailable?: boolean;
  displayOrder: number;
  prepTimeMinutes: number;
  allergenInformation?: string;
  variants?: MenuItemVariant[];
  addons?: MenuItemAddon[];
  calories?: number;
}

export interface MenuCategory {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  iconName?: string;
  isActive?: boolean;
  imageUrl?: string;
}

export interface RestaurantTable {
  id: string;
  tenantId: string;
  tableNumber: string; // e.g. "Table 4", "Patio 2"
  capacity: number;
  qrToken: string;
  isActive: boolean;
  currentOrderId?: string;
}

export interface CartItem {
  cartItemId: string; // unique instance in cart
  menuItem: MenuItem;
  selectedVariant?: MenuItemVariant;
  selectedAddons: MenuItemAddon[];
  quantity: number;
  specialInstructions?: string;
  unitPrice: number; // base + variant + sum(addons)
  itemTotal: number; // unitPrice * quantity
}

export interface OrderItemRecord {
  id: string;
  menuItemId: string;
  itemName: string;
  foodType: FoodType;
  basePrice: number;
  variantName?: string;
  variantPriceDelta?: number;
  addons: { name: string; price: number }[];
  quantity: number;
  specialInstructions?: string;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "#GT-104"
  tenantId: string;
  tableId: string;
  tableNumber: string;
  customerName?: string;
  items: OrderItemRecord[];
  subtotal: number;
  taxAmount: number;
  serviceChargeAmount: number;
  discountAmount: number;
  grandTotal: number;
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
  createdAt: string;
  updatedAt: string;
  paymentStatus: 'pending' | 'paid';
  specialNotes?: string;
}

export interface ServiceRequest {
  id: string;
  tenantId: string;
  tableId: string;
  tableNumber: string;
  type: ServiceRequestType;
  status: ServiceRequestStatus;
  createdAt: string;
  claimedByStaff?: string;
  resolvedAt?: string;
  note?: string;
}

export interface MembershipPlan {
  id: '3_months' | '6_months' | '12_months';
  name: string;
  durationMonths: number;
  price: number;
  maxTables: number;
  features: string[];
  recommended?: boolean;
}

export interface TenantSubscription {
  planId: '3_months' | '6_months' | '12_months';
  planName: string;
  startDate: string;
  expiryDate: string;
  status: 'active' | 'suspended' | 'trial' | 'expired';
  lastPaymentAmount: number;
  lastPaymentDate: string;
  autoRenew: boolean;
}

export interface RestaurantTenant {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  cuisine: string;
  description: string;
  logoUrl?: string;
  coverUrl?: string;
  primaryColor: string; // e.g. #30673A
  accentColor: string; // e.g. #E3792F
  secondaryColor: string; // e.g. #E9E9C7
  currency: string;
  currencySymbol: string;
  taxRatePercent: number; // e.g. 5%
  serviceChargePercent: number; // e.g. 5%
  isOpen: boolean;
  address: string;
  phone: string;
  subscription: TenantSubscription;
}

export type UserRole = 'customer' | 'waiter' | 'kitchen' | 'restaurant_admin' | 'super_admin' | 'qr_stand' | 'onboarding';

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  planId: '3_months' | '6_months' | '12_months';
  planName: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'refunded';
  paymentMethod: string;
  billingPeriod: string;
}

export interface AuditLogEvent {
  id: string;
  actor: string;
  action: string;
  tenantName?: string;
  details: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface PlatformAnnouncement {
  enabled: boolean;
  message: string;
  type: 'info' | 'maintenance' | 'promo';
}

export interface PlatformGlobalSettings {
  defaultCurrency: string;
  platformFeePercent: number;
  allowSelfRegistration: boolean;
  maintenanceMode: boolean;
  announcement: PlatformAnnouncement;
}
