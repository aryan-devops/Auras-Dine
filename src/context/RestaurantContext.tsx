import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  RestaurantTenant,
  MenuCategory,
  MenuItem,
  RestaurantTable,
  CartItem,
  Order,
  OrderStatus,
  ServiceRequest,
  ServiceRequestType,
  DietaryFilterValue,
  UserRole,
  MenuItemVariant,
  MenuItemAddon,
  MembershipPlan,
  BillingInvoice,
  AuditLogEvent,
  PlatformGlobalSettings,
} from '../types';
import {
  INITIAL_TENANTS,
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_TABLES,
  INITIAL_ORDERS,
  INITIAL_SERVICE_REQUESTS,
  MEMBERSHIP_PLANS,
  INITIAL_INVOICES,
  INITIAL_AUDIT_LOGS,
  INITIAL_PLATFORM_SETTINGS,
} from '../data/initialData';
import { getConflictingCartItems } from '../lib/filterUtils';

interface RestaurantContextType {
  // Tenant state
  tenants: RestaurantTenant[];
  currentTenantId: string;
  currentTenant: RestaurantTenant;
  setCurrentTenantId: (id: string) => void;

  // Role simulation
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;

  // Customer table context
  currentTableId: string;
  currentTable: RestaurantTable | undefined;
  setCurrentTableId: (tableId: string) => void;
  simulateQrScan: (qrToken: string) => boolean;

  // Menu data (scoped to current tenant)
  categories: MenuCategory[];
  menuItems: MenuItem[];
  dietaryFilter: DietaryFilterValue;
  setDietaryFilterWithConflictCheck: (target: DietaryFilterValue) => void;
  directSetDietaryFilter: (filter: DietaryFilterValue) => void;

  // Conflict modal state
  pendingDietaryFilter: DietaryFilterValue | null;
  conflictingCartItems: CartItem[];
  handleResolveConflict: (action: 'remove_and_continue' | 'keep_cart' | 'cancel') => void;

  // Cart state
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  cartTax: number;
  cartServiceCharge: number;
  cartTotal: number;
  addToCart: (
    item: MenuItem,
    variant?: MenuItemVariant,
    addons?: MenuItemAddon[],
    quantity?: number,
    instructions?: string
  ) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;

  // Orders
  orders: Order[];
  activeCustomerOrderId: string | null;
  setActiveCustomerOrderId: (id: string | null) => void;
  createOrder: (customerName?: string, specialNotes?: string) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;

  // Service requests (waiter calls)
  serviceRequests: ServiceRequest[];
  createServiceRequest: (type: ServiceRequestType, note?: string) => void;
  claimServiceRequest: (requestId: string, staffName: string) => void;
  resolveServiceRequest: (requestId: string) => void;

  // Admin menu management
  addMenuItem: (item: Omit<MenuItem, 'id' | 'tenantId'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  toggleItemAvailability: (id: string) => void;
  toggleItemFlag: (id: string, flag: 'isRecommended' | 'isMustTry') => void;

  // Admin tables & QR
  tables: RestaurantTable[];
  addTable: (tableNumber: string, capacity: number) => void;
  deleteTable: (tableId: string) => void;
  regenerateTableQr: (tableId: string) => void;
  updateTableNumber: (tableId: string, newNumber: string) => void;
  authorizeTable: (tableIdentifier: string) => RestaurantTable;
  isTableAuthorized: boolean;
  setIsTableAuthorized: (authorized: boolean) => void;
  isUniversalQrMode: boolean;
  setIsUniversalQrMode: (universal: boolean) => void;

  // Tenant settings
  updateTenantSettings: (updates: Partial<RestaurantTenant>) => void;

  // Super Admin operations
  membershipPlans: MembershipPlan[];
  updateMembershipPlan: (planId: '3_months' | '6_months' | '12_months', updates: Partial<MembershipPlan>) => void;
  updateTenantSubscription: (
    tenantId: string,
    planId: '3_months' | '6_months' | '12_months',
    status?: 'active' | 'suspended' | 'expired'
  ) => void;
  toggleTenantSuspension: (tenantId: string) => void;
  onboardTenant: (tenantData: {
    name: string;
    cuisine: string;
    tagline: string;
    address: string;
    phone: string;
    planId: '3_months' | '6_months' | '12_months';
    taxRatePercent?: number;
    serviceChargePercent?: number;
  }) => RestaurantTenant;
  archiveTenant: (tenantId: string) => void;

  billingInvoices: BillingInvoice[];
  auditLogs: AuditLogEvent[];
  logAuditEvent: (action: string, details: string, tenantName?: string, severity?: 'info' | 'warning' | 'critical') => void;
  platformSettings: PlatformGlobalSettings;
  updatePlatformSettings: (updates: Partial<PlatformGlobalSettings>) => void;

  // Utilities
  resetDemoData: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'auradine_v1_';

export const RestaurantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Tenants
  const [tenants, setTenants] = useState<RestaurantTenant[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}tenants`);
    return saved ? JSON.parse(saved) : INITIAL_TENANTS;
  });

  const [currentTenantId, setCurrentTenantId] = useState<string>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}currentTenantId`);
    return saved && INITIAL_TENANTS.some(t => t.id === saved) ? saved : 'tenant-green-table';
  });

  // Current tenant resolved
  const currentTenant = useMemo(() => {
    return tenants.find((t) => t.id === currentTenantId) || tenants[0];
  }, [tenants, currentTenantId]);

  // 2. Roles
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');

  // 3. Tables
  const [tables, setTables] = useState<RestaurantTable[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}tables`);
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [currentTableId, setCurrentTableId] = useState<string>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}currentTableId`);
    return saved || 'tbl-gt-4'; // Table 4 as default customer table
  });

  // Table Authorization & Universal QR state
  const [isTableAuthorized, setIsTableAuthorized] = useState<boolean>(true);
  const [isUniversalQrMode, setIsUniversalQrMode] = useState<boolean>(false);

  const currentTable = useMemo(() => {
    return tables.find((tbl) => tbl.id === currentTableId && tbl.tenantId === currentTenantId);
  }, [tables, currentTableId, currentTenantId]);

  // 4. Categories & Menu Items
  const [categories] = useState<MenuCategory[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}categories`);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}menuItems`);
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  // 5. Dietary filter & Conflict modal state
  const [dietaryFilter, setDietaryFilter] = useState<DietaryFilterValue>('all');
  const [pendingDietaryFilter, setPendingDietaryFilter] = useState<DietaryFilterValue | null>(null);
  const [conflictingCartItems, setConflictingCartItems] = useState<CartItem[]>([]);

  // 6. Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}cart_${currentTenantId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // 7. Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}orders`);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [activeCustomerOrderId, setActiveCustomerOrderId] = useState<string | null>(null);

  // 8. Service Requests
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}serviceRequests`);
    return saved ? JSON.parse(saved) : INITIAL_SERVICE_REQUESTS;
  });

  // 9. Membership Plans
  const [plans, setPlans] = useState<MembershipPlan[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}plans`);
    return saved ? JSON.parse(saved) : MEMBERSHIP_PLANS;
  });

  // 10. Billing Invoices
  const [billingInvoices, setBillingInvoices] = useState<BillingInvoice[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}invoices`);
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  // 11. Platform Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEvent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}auditLogs`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // 12. Global Platform Settings
  const [platformSettings, setPlatformSettings] = useState<PlatformGlobalSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}platformSettings`);
    return saved ? JSON.parse(saved) : INITIAL_PLATFORM_SETTINGS;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}tenants`, JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}currentTenantId`, currentTenantId);
  }, [currentTenantId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}tables`, JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}currentTableId`, currentTableId);
  }, [currentTableId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}menuItems`, JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}orders`, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}serviceRequests`, JSON.stringify(serviceRequests));
  }, [serviceRequests]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}plans`, JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}invoices`, JSON.stringify(billingInvoices));
  }, [billingInvoices]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}auditLogs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}platformSettings`, JSON.stringify(platformSettings));
  }, [platformSettings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}cart_${currentTenantId}`, JSON.stringify(cart));
  }, [cart, currentTenantId]);

  // Dietary switch with conflict check
  const setDietaryFilterWithConflictCheck = (target: DietaryFilterValue) => {
    if (target === dietaryFilter) return;

    const conflicts = getConflictingCartItems(cart, target);
    if (conflicts.length > 0) {
      setConflictingCartItems(conflicts);
      setPendingDietaryFilter(target);
    } else {
      setDietaryFilter(target);
    }
  };

  const directSetDietaryFilter = (filter: DietaryFilterValue) => {
    setDietaryFilter(filter);
  };

  const handleResolveConflict = (action: 'remove_and_continue' | 'keep_cart' | 'cancel') => {
    if (action === 'cancel') {
      setPendingDietaryFilter(null);
      setConflictingCartItems([]);
      return;
    }

    if (action === 'remove_and_continue' && pendingDietaryFilter) {
      // Remove conflicting items from cart
      const conflictingIds = new Set(conflictingCartItems.map((ci) => ci.cartItemId));
      setCart((prev) => prev.filter((ci) => !conflictingIds.has(ci.cartItemId)));
      setDietaryFilter(pendingDietaryFilter);
    } else if (action === 'keep_cart' && pendingDietaryFilter) {
      // Keep cart intact and apply filter
      setDietaryFilter(pendingDietaryFilter);
    }

    setPendingDietaryFilter(null);
    setConflictingCartItems([]);
  };

  // Cart operations
  const addToCart = (
    item: MenuItem,
    variant?: MenuItemVariant,
    addons: MenuItemAddon[] = [],
    quantity: number = 1,
    instructions?: string
  ) => {
    const variantPrice = variant ? variant.priceDelta : 0;
    const addonsPrice = addons.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = item.basePrice + variantPrice + addonsPrice;

    // Check if identical instance exists in cart
    const existingIndex = cart.findIndex((ci) => {
      const sameItem = ci.menuItem.id === item.id;
      const sameVariant = ci.selectedVariant?.id === variant?.id;
      const sameInstructions = (ci.specialInstructions || '') === (instructions || '');
      const sameAddons =
        ci.selectedAddons.length === addons.length &&
        ci.selectedAddons.every((a) => addons.some((na) => na.id === a.id));
      return sameItem && sameVariant && sameInstructions && sameAddons;
    });

    if (existingIndex > -1) {
      setCart((prev) => {
        const next = [...prev];
        const existing = next[existingIndex];
        const newQty = existing.quantity + quantity;
        next[existingIndex] = {
          ...existing,
          quantity: newQty,
          itemTotal: existing.unitPrice * newQty,
        };
        return next;
      });
    } else {
      const newItem: CartItem = {
        cartItemId: `ci-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        menuItem: item,
        selectedVariant: variant,
        selectedAddons: addons,
        quantity,
        specialInstructions: instructions,
        unitPrice,
        itemTotal: unitPrice * quantity,
      };
      setCart((prev) => [...prev, newItem]);
    }
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            return {
              ...item,
              quantity: nextQty,
              itemTotal: item.unitPrice * nextQty,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Cart financial figures
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.itemTotal, 0);
  }, [cart]);

  const cartTax = useMemo(() => {
    return Number(((cartSubtotal * currentTenant.taxRatePercent) / 100).toFixed(2));
  }, [cartSubtotal, currentTenant.taxRatePercent]);

  const cartServiceCharge = useMemo(() => {
    return Number(((cartSubtotal * currentTenant.serviceChargePercent) / 100).toFixed(2));
  }, [cartSubtotal, currentTenant.serviceChargePercent]);

  const cartTotal = useMemo(() => {
    return Number((cartSubtotal + cartTax + cartServiceCharge).toFixed(2));
  }, [cartSubtotal, cartTax, cartServiceCharge]);

  const cartCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  // Order submission (server-authoritative emulation)
  const createOrder = async (customerName: string = 'Diner Guest', specialNotes?: string): Promise<Order> => {
    // Re-verify prices authoritative against current menuItems
    const orderItems = cart.map((ci) => {
      const authoritativeItem = menuItems.find((mi) => mi.id === ci.menuItem.id);
      const base = authoritativeItem ? authoritativeItem.basePrice : ci.menuItem.basePrice;
      const vDelta = ci.selectedVariant ? ci.selectedVariant.priceDelta : 0;
      const aPrice = ci.selectedAddons.reduce((sum, a) => sum + a.price, 0);
      const singlePrice = base + vDelta + aPrice;

      return {
        id: `oi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        menuItemId: ci.menuItem.id,
        itemName: ci.menuItem.name,
        foodType: ci.menuItem.foodType,
        basePrice: base,
        variantName: ci.selectedVariant?.name,
        variantPriceDelta: vDelta,
        addons: ci.selectedAddons.map((a) => ({ name: a.name, price: a.price })),
        quantity: ci.quantity,
        specialInstructions: ci.specialInstructions,
        totalPrice: Number((singlePrice * ci.quantity).toFixed(2)),
      };
    });

    const calculatedSubtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const calculatedTax = Number(((calculatedSubtotal * currentTenant.taxRatePercent) / 100).toFixed(2));
    const calculatedService = Number(((calculatedSubtotal * currentTenant.serviceChargePercent) / 100).toFixed(2));
    const grandTotal = Number((calculatedSubtotal + calculatedTax + calculatedService).toFixed(2));

    const prefix = currentTenant.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase();
    const orderNumber = `#${prefix}-${Math.floor(100 + Math.random() * 900)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      tenantId: currentTenantId,
      tableId: currentTable?.id || 'tbl-walk-in',
      tableNumber: currentTable?.tableNumber || 'Takeaway / Walk-in',
      customerName,
      items: orderItems,
      subtotal: calculatedSubtotal,
      taxAmount: calculatedTax,
      serviceChargeAmount: calculatedService,
      discountAmount: 0,
      grandTotal,
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          note: `Order submitted by customer at ${currentTable?.tableNumber || 'Table'}`,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paymentStatus: 'pending',
      specialNotes,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setActiveCustomerOrderId(newOrder.id);
    clearCart();
    setIsCartDrawerOpen(false);

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, note?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status,
            updatedAt: new Date().toISOString(),
            statusHistory: [
              ...ord.statusHistory,
              {
                status,
                timestamp: new Date().toISOString(),
                note: note || `Status updated to ${status}`,
              },
            ],
          };
        }
        return ord;
      })
    );
  };

  // Service Requests
  const createServiceRequest = (type: ServiceRequestType, note?: string) => {
    const newRequest: ServiceRequest = {
      id: `req-${Date.now()}`,
      tenantId: currentTenantId,
      tableId: currentTable?.id || 'tbl-walk-in',
      tableNumber: currentTable?.tableNumber || 'Table',
      type,
      status: 'open',
      createdAt: new Date().toISOString(),
      note,
    };
    setServiceRequests((prev) => [newRequest, ...prev]);
  };

  const claimServiceRequest = (requestId: string, staffName: string) => {
    setServiceRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: 'in_progress', claimedByStaff: staffName } : req))
    );
  };

  const resolveServiceRequest = (requestId: string) => {
    setServiceRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? { ...req, status: 'resolved', resolvedAt: new Date().toISOString() }
          : req
      )
    );
  };

  // Menu items CRUD
  const addMenuItem = (itemData: Omit<MenuItem, 'id' | 'tenantId'>) => {
    const newItem: MenuItem = {
      ...itemData,
      id: `item-${Date.now()}`,
      tenantId: currentTenantId,
    };
    setMenuItems((prev) => [...prev, newItem]);
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems((prev) => prev.map((mi) => (mi.id === id ? { ...mi, ...updates } : mi)));
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((mi) => mi.id !== id));
  };

  const toggleItemAvailability = (id: string) => {
    setMenuItems((prev) =>
      prev.map((mi) => (mi.id === id ? { ...mi, isAvailable: !mi.isAvailable } : mi))
    );
  };

  const toggleItemFlag = (id: string, flag: 'isRecommended' | 'isMustTry') => {
    setMenuItems((prev) =>
      prev.map((mi) => (mi.id === id ? { ...mi, [flag]: !mi[flag] } : mi))
    );
  };

  // Table operations
  const addTable = (tableNumber: string, capacity: number) => {
    const newTable: RestaurantTable = {
      id: `tbl-${Date.now()}`,
      tenantId: currentTenantId,
      tableNumber,
      capacity,
      qrToken: `qr-${Math.random().toString(36).slice(2, 9)}`,
      isActive: true,
    };
    setTables((prev) => [...prev, newTable]);
  };

  const deleteTable = (tableId: string) => {
    setTables((prev) => prev.filter((tbl) => tbl.id !== tableId));
  };

  const regenerateTableQr = (tableId: string) => {
    setTables((prev) =>
      prev.map((tbl) =>
        tbl.id === tableId ? { ...tbl, qrToken: `qr-${Math.random().toString(36).slice(2, 10)}` } : tbl
      )
    );
  };

  const updateTableNumber = (tableId: string, newNumber: string) => {
    setTables((prev) =>
      prev.map((tbl) => (tbl.id === tableId ? { ...tbl, tableNumber: newNumber } : tbl))
    );
  };

  const authorizeTable = (tableIdentifier: string): RestaurantTable => {
    const clean = tableIdentifier.trim();
    const normalized = clean.toLowerCase();

    // Check existing tables for this tenant
    const existing = tables.filter((t) => t.tenantId === currentTenantId);
    let match = existing.find(
      (t) =>
        t.tableNumber.toLowerCase() === normalized ||
        t.tableNumber.toLowerCase() === `table ${normalized}` ||
        t.id.toLowerCase() === normalized
    );

    if (!match) {
      // Create and register new table
      const formatted = clean.toLowerCase().startsWith('table')
        ? clean
        : isNaN(Number(clean))
        ? clean
        : `Table ${clean}`;

      const newTable: RestaurantTable = {
        id: `tbl-${Date.now()}`,
        tenantId: currentTenantId,
        tableNumber: formatted,
        capacity: 4,
        qrToken: `qr-${Math.random().toString(36).slice(2, 9)}`,
        isActive: true,
      };
      setTables((prev) => [...prev, newTable]);
      match = newTable;
    }

    setCurrentTableId(match.id);
    setIsTableAuthorized(true);
    return match;
  };

  // Tenant settings update
  const updateTenantSettings = (updates: Partial<RestaurantTenant>) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === currentTenantId ? { ...t, ...updates } : t))
    );
  };

  const logAuditEvent = (
    action: string,
    details: string,
    tenantName?: string,
    severity: 'info' | 'warning' | 'critical' = 'info'
  ) => {
    const newLog: AuditLogEvent = {
      id: `log-${Date.now()}`,
      actor: 'Super Admin (system)',
      action,
      tenantName,
      details,
      timestamp: new Date().toISOString(),
      severity,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Super Admin: membership & tenant status
  const updateTenantSubscription = (
    tenantId: string,
    planId: '3_months' | '6_months' | '12_months',
    status: 'active' | 'suspended' | 'expired' = 'active'
  ) => {
    const plan = plans.find((p) => p.id === planId) || plans[0];
    const now = new Date();
    const expiry = new Date();
    expiry.setMonth(now.getMonth() + plan.durationMonths);

    const targetTenant = tenants.find((t) => t.id === tenantId);
    const tenantName = targetTenant ? targetTenant.name : 'Unknown Tenant';

    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          return {
            ...t,
            subscription: {
              ...t.subscription,
              planId,
              planName: plan.name,
              status,
              startDate: now.toISOString(),
              expiryDate: expiry.toISOString(),
              lastPaymentAmount: plan.price,
              lastPaymentDate: now.toISOString(),
            },
          };
        }
        return t;
      })
    );

    // Generate new billing invoice
    const newInvoice: BillingInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      tenantId,
      tenantName,
      planId,
      planName: plan.name,
      amount: plan.price,
      date: now.toISOString(),
      status: 'paid',
      paymentMethod: 'Stripe Automated Recurring (•••• 8821)',
      billingPeriod: `${now.toLocaleDateString([], { month: 'short', year: 'numeric' })} – ${expiry.toLocaleDateString([], { month: 'short', year: 'numeric' })}`,
    };
    setBillingInvoices((prev) => [newInvoice, ...prev]);

    logAuditEvent(
      'PLAN_RENEWED',
      `Renewed to ${plan.name} ($${plan.price}.00). Expiry set to ${expiry.toLocaleDateString()}.`,
      tenantName
    );
  };

  const toggleTenantSuspension = (tenantId: string) => {
    const targetTenant = tenants.find((t) => t.id === tenantId);
    const tenantName = targetTenant ? targetTenant.name : 'Unknown';

    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          const newStatus = t.subscription.status === 'suspended' ? 'active' : 'suspended';
          logAuditEvent(
            newStatus === 'suspended' ? 'TENANT_SUSPENDED' : 'TENANT_REACTIVATED',
            `Operational access ${newStatus === 'suspended' ? 'temporarily halted' : 'restored'}.`,
            tenantName,
            newStatus === 'suspended' ? 'warning' : 'info'
          );
          return {
            ...t,
            subscription: {
              ...t.subscription,
              status: newStatus,
            },
          };
        }
        return t;
      })
    );
  };

  const onboardTenant = (tenantData: {
    name: string;
    cuisine: string;
    tagline: string;
    address: string;
    phone: string;
    planId: '3_months' | '6_months' | '12_months';
    taxRatePercent?: number;
    serviceChargePercent?: number;
  }): RestaurantTenant => {
    const newId = `tenant-${tenantData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
    const plan = plans.find((p) => p.id === tenantData.planId) || plans[0];
    const now = new Date();
    const expiry = new Date();
    expiry.setMonth(now.getMonth() + plan.durationMonths);

    const newTenant: RestaurantTenant = {
      id: newId,
      name: tenantData.name,
      slug: tenantData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      tagline: tenantData.tagline || 'Artisanal dining & authentic hospitality',
      cuisine: tenantData.cuisine || 'Modern Contemporary',
      description: `${tenantData.name} offers handcrafted specialties and seasonal dining.`,
      primaryColor: '#30673A',
      accentColor: '#E3792F',
      secondaryColor: '#E9E9C7',
      currency: 'USD',
      currencySymbol: '$',
      taxRatePercent: tenantData.taxRatePercent ?? 6,
      serviceChargePercent: tenantData.serviceChargePercent ?? 5,
      isOpen: true,
      address: tenantData.address || '123 Boulevard Way',
      phone: tenantData.phone || '+1 (555) 000-1234',
      subscription: {
        planId: tenantData.planId,
        planName: plan.name,
        startDate: now.toISOString(),
        expiryDate: expiry.toISOString(),
        status: 'active',
        lastPaymentAmount: plan.price,
        lastPaymentDate: now.toISOString(),
        autoRenew: true,
      },
    };

    setTenants((prev) => [...prev, newTenant]);

    // Provision 3 initial physical tables
    const table1: RestaurantTable = {
      id: `tbl-${newId}-1`,
      tenantId: newId,
      tableNumber: 'Table 1',
      capacity: 2,
      qrToken: `qr-${Math.random().toString(36).slice(2, 9)}`,
      isActive: true,
    };
    const table2: RestaurantTable = {
      id: `tbl-${newId}-2`,
      tenantId: newId,
      tableNumber: 'Table 2',
      capacity: 4,
      qrToken: `qr-${Math.random().toString(36).slice(2, 9)}`,
      isActive: true,
    };
    const table3: RestaurantTable = {
      id: `tbl-${newId}-3`,
      tenantId: newId,
      tableNumber: 'Patio VIP',
      capacity: 6,
      qrToken: `qr-${Math.random().toString(36).slice(2, 9)}`,
      isActive: true,
    };
    setTables((prev) => [...prev, table1, table2, table3]);

    // Seed 2 default sample menu items
    const sampleCategory: MenuCategory = {
      id: `cat-${newId}-1`,
      tenantId: newId,
      name: 'Chef House Specialties',
      slug: 'house-specialties',
      description: 'Signature preparations',
      displayOrder: 1,
    };
    categories.push(sampleCategory);

    const sampleItem: MenuItem = {
      id: `item-${newId}-1`,
      tenantId: newId,
      categoryId: sampleCategory.id,
      name: `${tenantData.name} Signature Platter`,
      slug: 'signature-platter',
      description: 'House-made artisanal creation prepared with locally sourced farm ingredients.',
      basePrice: 16.0,
      foodType: 'veg',
      isAvailable: true,
      isRecommended: true,
      isMustTry: true,
      displayOrder: 1,
      prepTimeMinutes: 15,
      calories: 420,
    };
    setMenuItems((prev) => [...prev, sampleItem]);

    // Add initial invoice
    const newInvoice: BillingInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      tenantId: newId,
      tenantName: newTenant.name,
      planId: plan.id,
      planName: plan.name,
      amount: plan.price,
      date: now.toISOString(),
      status: 'paid',
      paymentMethod: 'Corporate Setup Card',
      billingPeriod: `${now.toLocaleDateString([], { month: 'short', year: 'numeric' })} – ${expiry.toLocaleDateString([], { month: 'short', year: 'numeric' })}`,
    };
    setBillingInvoices((prev) => [newInvoice, ...prev]);

    logAuditEvent(
      'TENANT_ONBOARDED',
      `Onboarded on ${plan.name} ($${plan.price}.00). 3 QR tables created.`,
      newTenant.name
    );

    return newTenant;
  };

  const archiveTenant = (tenantId: string) => {
    const target = tenants.find((t) => t.id === tenantId);
    if (!target) return;
    setTenants((prev) => prev.filter((t) => t.id !== tenantId));
    logAuditEvent('TENANT_ARCHIVED', `Tenant and data records removed.`, target.name, 'warning');
    if (currentTenantId === tenantId) {
      setCurrentTenantId('tenant-green-table');
    }
  };

  const updateMembershipPlan = (
    planId: '3_months' | '6_months' | '12_months',
    updates: Partial<MembershipPlan>
  ) => {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id === planId) {
          const updated = { ...p, ...updates };
          logAuditEvent('PRICING_UPDATED', `Tier '${p.name}' price adjusted to $${updated.price}.`);
          return updated;
        }
        return p;
      })
    );
  };

  const updatePlatformSettings = (updates: Partial<PlatformGlobalSettings>) => {
    setPlatformSettings((prev) => {
      const updated = { ...prev, ...updates };
      logAuditEvent('PLATFORM_SETTINGS_CHANGED', 'Global platform configuration updated.');
      return updated;
    });
  };

  const simulateQrScan = (qrToken: string): boolean => {
    const table = tables.find((t) => t.qrToken === qrToken);
    if (table) {
      setCurrentTenantId(table.tenantId);
      setCurrentTableId(table.id);
      setCurrentRole('customer');
      return true;
    }
    return false;
  };

  const resetDemoData = () => {
    localStorage.clear();
    setTenants(INITIAL_TENANTS);
    setCurrentTenantId('tenant-green-table');
    setTables(INITIAL_TABLES);
    setCurrentTableId('tbl-gt-4');
    setMenuItems(INITIAL_MENU_ITEMS);
    setOrders(INITIAL_ORDERS);
    setServiceRequests(INITIAL_SERVICE_REQUESTS);
    setPlans(MEMBERSHIP_PLANS);
    setBillingInvoices(INITIAL_INVOICES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setPlatformSettings(INITIAL_PLATFORM_SETTINGS);
    setCart([]);
    setDietaryFilter('all');
  };

  const scopedCategories = useMemo(() => {
    return categories
      .filter((c) => c.tenantId === currentTenantId)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [categories, currentTenantId]);

  const scopedMenuItems = useMemo(() => {
    return menuItems.filter((mi) => mi.tenantId === currentTenantId);
  }, [menuItems, currentTenantId]);

  const scopedTables = useMemo(() => {
    return tables.filter((t) => t.tenantId === currentTenantId);
  }, [tables, currentTenantId]);

  return (
    <RestaurantContext.Provider
      value={{
        tenants,
        currentTenantId,
        currentTenant,
        setCurrentTenantId,
        currentRole,
        setCurrentRole,
        currentTableId,
        currentTable,
        setCurrentTableId,
        simulateQrScan,
        categories: scopedCategories,
        menuItems: scopedMenuItems,
        dietaryFilter,
        setDietaryFilterWithConflictCheck,
        directSetDietaryFilter,
        pendingDietaryFilter,
        conflictingCartItems,
        handleResolveConflict,
        cart,
        cartCount,
        cartSubtotal,
        cartTax,
        cartServiceCharge,
        cartTotal,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        orders,
        activeCustomerOrderId,
        setActiveCustomerOrderId,
        createOrder,
        updateOrderStatus,
        serviceRequests,
        createServiceRequest,
        claimServiceRequest,
        resolveServiceRequest,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleItemAvailability,
        toggleItemFlag,
        tables: scopedTables,
        addTable,
        deleteTable,
        regenerateTableQr,
        updateTableNumber,
        authorizeTable,
        isTableAuthorized,
        setIsTableAuthorized,
        isUniversalQrMode,
        setIsUniversalQrMode,
        updateTenantSettings,
        membershipPlans: plans,
        updateMembershipPlan,
        updateTenantSubscription,
        toggleTenantSuspension,
        onboardTenant,
        archiveTenant,
        billingInvoices,
        auditLogs,
        logAuditEvent,
        platformSettings,
        updatePlatformSettings,
        resetDemoData,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
