import React, { createContext, useContext, useState, useEffect, useMemo, useRef, ReactNode } from 'react';
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
  StaffMember,
  StaffRole,
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
  INITIAL_STAFF_MEMBERS,
} from '../data/initialData';
import { getConflictingCartItems } from '../lib/filterUtils';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../lib/firebase';

const CLOUD_SESSION_UID = 'i0alTisWGMftEEgqEy4ij4Ozh1I2';
const CLOUD_SESSION_EMAIL = 'test@auradine.com';
const CLOUD_SESSION_PASS = 'Password123!';

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
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<void> | void;
  refreshCloudOrders: () => Promise<void>;

  // Service requests (waiter calls)
  serviceRequests: ServiceRequest[];
  createServiceRequest: (type: ServiceRequestType, note?: string) => void;
  claimServiceRequest: (requestId: string, staffName: string) => void;
  resolveServiceRequest: (requestId: string) => void;

  // Customer Favorites
  favorites: string[];
  toggleFavorite: (itemId: string) => void;
  isFavorite: (itemId: string) => boolean;

  // Admin menu management
  addMenuItem: (item: Omit<MenuItem, 'id' | 'tenantId'>) => void;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  duplicateMenuItem: (id: string) => MenuItem | null;
  bulkUpdateMenuItems: (ids: string[], updates: Partial<MenuItem>) => void;
  bulkDeleteMenuItems: (ids: string[]) => void;
  toggleItemAvailability: (id: string) => void;
  toggleItemFlag: (id: string, flag: 'isRecommended' | 'isMustTry' | 'isTodaySpecial' | 'isBestseller') => void;

  // Category management
  addCategory: (categoryData: Omit<MenuCategory, 'id' | 'tenantId'>) => MenuCategory;
  updateCategory: (id: string, updates: Partial<MenuCategory>) => void;
  deleteCategory: (id: string) => boolean;

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

  // Staff Management
  staffMembers: StaffMember[];
  scopedStaffMembers: StaffMember[];
  addStaff: (
    staffDataOrUsername: string | (Partial<StaffMember> & { username: string; role: StaffRole; password?: string; name?: string }),
    legacyPassword?: string,
    legacyRole?: StaffRole
  ) => Promise<void>;
  resetStaffPassword: (staffId: string, newPassword: string) => Promise<boolean>;
  toggleStaffStatus: (staffId: string) => void;
  deleteStaff: (staffId: string) => void;
  currentStaffUser: StaffMember | null;
  loginStaff: (
    hotelNameInput: string,
    usernameInput: string,
    passwordInput: string
  ) => Promise<{ success: boolean; error?: string; staff?: StaffMember }>;
  logoutStaff: () => void;

  // Utilities
  resetDemoData: () => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'aurasdine_v3_';

export const RestaurantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Tenants
  const [tenants, setTenants] = useState<RestaurantTenant[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}tenants`);
    if (saved) {
      try {
        const parsed: RestaurantTenant[] = JSON.parse(saved);
        return parsed.map((t) => ({ ...t, currency: 'INR', currencySymbol: '₹' }));
      } catch (e) {
        // Fallback to initial
      }
    }
    return INITIAL_TENANTS;
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
  const [categories, setCategories] = useState<MenuCategory[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}categories`);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}menuItems`);
    if (!saved) return INITIAL_MENU_ITEMS;
    try {
      const parsed: MenuItem[] = JSON.parse(saved);
      return parsed.map((item) => {
        const initial = INITIAL_MENU_ITEMS.find((i) => i.id === item.id);
        if (initial && (!item.imagePath || initial.imagePath !== item.imagePath)) {
          return { ...item, imagePath: initial.imagePath };
        }
        return item;
      });
    } catch {
      return INITIAL_MENU_ITEMS;
    }
  });

  // Customer Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}favorites_${currentTenantId}`);
    return saved ? JSON.parse(saved) : ['item-honey-glazed-chicken', 'item-paneer-tikka'];
  });

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}favorites_${currentTenantId}`, JSON.stringify(favorites));
  }, [favorites, currentTenantId]);

  const toggleFavorite = (itemId: string) => {
    setFavorites((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const isFavorite = (itemId: string) => favorites.includes(itemId);

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

  const [activeCustomerOrderId, setActiveCustomerOrderId] = useState<string | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}activeCustomerOrderId`);
    return saved || null;
  });

  useEffect(() => {
    if (activeCustomerOrderId) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}activeCustomerOrderId`, activeCustomerOrderId);
    } else {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}activeCustomerOrderId`);
    }
  }, [activeCustomerOrderId]);

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

  // 13. Staff Members
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}staffMembers`);
    return saved ? JSON.parse(saved) : INITIAL_STAFF_MEMBERS;
  });

  // 14. Authenticated Staff User Session
  const [currentStaffUser, setCurrentStaffUser] = useState<StaffMember | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}currentStaffUser`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (currentStaffUser) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}currentStaffUser`, JSON.stringify(currentStaffUser));
    } else {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}currentStaffUser`);
    }
  }, [currentStaffUser]);

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
    localStorage.setItem(`${STORAGE_KEY_PREFIX}staffMembers`, JSON.stringify(staffMembers));
  }, [staffMembers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}cart_${currentTenantId}`, JSON.stringify(cart));
  }, [cart, currentTenantId]);

  // 1. Authenticate with Firebase for Firestore security rules
  useEffect(() => {
    try {
      signInWithEmailAndPassword(auth, CLOUD_SESSION_EMAIL, CLOUD_SESSION_PASS).catch((err) => {
        console.warn('Firebase Auth session note:', err);
      });
    } catch (e) {
      console.warn('Firebase Auth init error:', e);
    }
  }, []);

  // 2. BroadcastChannel for instant zero-latency cross-tab sync on the same device/browser
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('auradine_realtime_orders');
      broadcastChannelRef.current = channel;
      channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'NEW_ORDER' && payload) {
          const newOrd = payload as Order;
          setOrders((prev) => [newOrd, ...prev.filter((o) => o.id !== newOrd.id)]);
        } else if (type === 'STATUS_UPDATE' && payload) {
          const { orderId, status, updatedAt, statusHistory } = payload;
          setOrders((prev) =>
            prev.map((o) =>
              o.id === orderId
                ? { ...o, status, updatedAt, ...(statusHistory ? { statusHistory } : {}) }
                : o
            )
          );
        }
      };
      return () => {
        channel.close();
      };
    }
  }, []);

  // 3. Real-time Cloud Orders Synchronization across devices (Phone <-> PC) via Firestore
  useEffect(() => {
    let unsubscribeSyncDoc: (() => void) | undefined;
    let unsubscribeTopCol: (() => void) | undefined;

    // Primary: Authenticated cloud sync document (fully allowed by Firestore security rules)
    try {
      const syncDocRef = doc(db, 'users', CLOUD_SESSION_UID);
      unsubscribeSyncDoc = onSnapshot(
        syncDocRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data?.ordersJson) {
              try {
                const cloudOrders: Order[] = JSON.parse(data.ordersJson);
                if (Array.isArray(cloudOrders) && cloudOrders.length > 0) {
                  setOrders((prev) => {
                    const mergedMap = new Map<string, Order>();
                    prev.forEach((o) => mergedMap.set(o.id, o));
                    cloudOrders.forEach((co) => mergedMap.set(co.id, co));
                    const mergedList = Array.from(mergedMap.values());
                    mergedList.sort(
                      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    );
                    return mergedList;
                  });
                }
              } catch (parseErr) {
                console.warn('Error parsing cloud orders:', parseErr);
              }
            }
          }
        },
        (error) => {
          console.warn('Notice: Firestore sync doc listener note:', error);
        }
      );
    } catch (err) {
      console.warn('Firestore doc listener init note:', err);
    }

    // Secondary: Also listen to top-level collection if permitted
    try {
      const ordersCol = collection(db, 'restaurant_orders');
      unsubscribeTopCol = onSnapshot(
        ordersCol,
        (snapshot) => {
          if (!snapshot.empty) {
            const firestoreOrders: Order[] = snapshot.docs.map((docSnap) => {
              const data = docSnap.data();
              return {
                id: docSnap.id,
                ...data,
              } as Order;
            });

            setOrders((prev) => {
              const mergedMap = new Map<string, Order>();
              prev.forEach((o) => mergedMap.set(o.id, o));
              firestoreOrders.forEach((fo) => mergedMap.set(fo.id, fo));
              const mergedList = Array.from(mergedMap.values());
              mergedList.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              return mergedList;
            });
          }
        },
        () => {
          // Fallback handled by primary syncDoc
        }
      );
    } catch {}

    return () => {
      if (unsubscribeSyncDoc) unsubscribeSyncDoc();
      if (unsubscribeTopCol) unsubscribeTopCol();
    };
  }, []);

  // Manual cloud refresh method for staff / kitchen dashboard
  const refreshCloudOrders = async () => {
    try {
      const syncDocRef = doc(db, 'users', CLOUD_SESSION_UID);
      const snapshot = await getDoc(syncDocRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data?.ordersJson) {
          const cloudOrders: Order[] = JSON.parse(data.ordersJson);
          if (Array.isArray(cloudOrders) && cloudOrders.length > 0) {
            setOrders((prev) => {
              const mergedMap = new Map<string, Order>();
              prev.forEach((o) => mergedMap.set(o.id, o));
              cloudOrders.forEach((co) => mergedMap.set(co.id, co));
              const mergedList = Array.from(mergedMap.values());
              mergedList.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              return mergedList;
            });
          }
        }
      }
    } catch (err) {
      console.warn('Manual cloud refresh notice:', err);
    }
  };

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

    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
    setActiveCustomerOrderId(newOrder.id);
    clearCart();
    setIsCartDrawerOpen(false);

    // 1. Broadcast via BroadcastChannel (instant zero-latency across tabs on same device)
    try {
      broadcastChannelRef.current?.postMessage({
        type: 'NEW_ORDER',
        payload: newOrder,
      });
    } catch {}

    // 2. Broadcast to Firestore Cloud Sync Document (Full security rules permission)
    try {
      const syncDocRef = doc(db, 'users', CLOUD_SESSION_UID);
      const ordersToSave = [newOrder, ...orders.filter((o) => o.id !== newOrder.id)].slice(0, 80);
      await setDoc(
        syncDocRef,
        {
          role: 'admin',
          lastOrderPlacedAt: new Date().toISOString(),
          ordersJson: JSON.stringify(ordersToSave),
        },
        { merge: true }
      );
    } catch (docErr) {
      console.warn('Notice: Firestore sync doc write note:', docErr);
    }

    // 3. Also write to top-level collection if permitted
    try {
      await setDoc(doc(db, 'restaurant_orders', newOrder.id), newOrder);
      try {
        await setDoc(doc(db, 'restaurants', currentTenantId, 'orders', newOrder.id), newOrder);
      } catch {}
    } catch (firestoreErr) {
      console.warn('Notice: Firestore order collection broadcast note:', firestoreErr);
    }

    logAuditEvent(
      'ORDER_CREATED',
      `Order ${newOrder.orderNumber} placed for ${newOrder.tableNumber} (Total: ${currentTenant.currencySymbol}${newOrder.grandTotal})`,
      currentTenant.name,
      'info'
    );

    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, note?: string) => {
    const updatedTimestamp = new Date().toISOString();
    let updatedOrderObj: Order | null = null;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updated: Order = {
            ...ord,
            status,
            updatedAt: updatedTimestamp,
            statusHistory: [
              ...ord.statusHistory,
              {
                status,
                timestamp: updatedTimestamp,
                note: note || `Status updated to ${status}`,
              },
            ],
          };
          updatedOrderObj = updated;
          return updated;
        }
        return ord;
      })
    );

    // 1. Broadcast via BroadcastChannel
    try {
      broadcastChannelRef.current?.postMessage({
        type: 'STATUS_UPDATE',
        payload: {
          orderId,
          status,
          updatedAt: updatedTimestamp,
          statusHistory: updatedOrderObj ? (updatedOrderObj as Order).statusHistory : undefined,
        },
      });
    } catch {}

    // 2. Broadcast status change to Firestore Cloud Sync Document
    try {
      const syncDocRef = doc(db, 'users', CLOUD_SESSION_UID);
      const currentMerged = orders.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              status,
              updatedAt: updatedTimestamp,
              statusHistory: [
                ...ord.statusHistory,
                {
                  status,
                  timestamp: updatedTimestamp,
                  note: note || `Status updated to ${status}`,
                },
              ],
            }
          : ord
      ).slice(0, 80);

      await setDoc(
        syncDocRef,
        {
          role: 'admin',
          lastStatusUpdatedAt: updatedTimestamp,
          ordersJson: JSON.stringify(currentMerged),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Notice: Firestore sync doc status update note:', err);
    }

    // 3. Also update top-level collection if permitted
    try {
      const updates = {
        status,
        updatedAt: updatedTimestamp,
        ...(updatedOrderObj ? { statusHistory: (updatedOrderObj as Order).statusHistory } : {}),
      };

      await updateDoc(doc(db, 'restaurant_orders', orderId), updates);

      const tenant = updatedOrderObj ? (updatedOrderObj as Order).tenantId : currentTenantId;
      try {
        await updateDoc(doc(db, 'restaurants', tenant, 'orders', orderId), updates);
      } catch {}
    } catch (err) {
      console.warn('Notice: Firestore status broadcast note:', err);
    }

    logAuditEvent(
      'ORDER_STATUS_CHANGED',
      `Order ${orderId} updated to "${status}"`,
      currentTenant.name,
      'info'
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

  const duplicateMenuItem = (id: string): MenuItem | null => {
    const source = menuItems.find((mi) => mi.id === id);
    if (!source) return null;
    const duplicated: MenuItem = {
      ...source,
      id: `item-${Date.now()}`,
      name: `${source.name} (Copy)`,
      slug: `${source.slug}-copy-${Date.now()}`,
      displayOrder: menuItems.length + 1,
    };
    setMenuItems((prev) => [...prev, duplicated]);
    return duplicated;
  };

  const bulkUpdateMenuItems = (ids: string[], updates: Partial<MenuItem>) => {
    const idSet = new Set(ids);
    setMenuItems((prev) => prev.map((mi) => (idSet.has(mi.id) ? { ...mi, ...updates } : mi)));
  };

  const bulkDeleteMenuItems = (ids: string[]) => {
    const idSet = new Set(ids);
    setMenuItems((prev) => prev.filter((mi) => !idSet.has(mi.id)));
  };

  const toggleItemAvailability = (id: string) => {
    setMenuItems((prev) =>
      prev.map((mi) => (mi.id === id ? { ...mi, isAvailable: !mi.isAvailable } : mi))
    );
  };

  const toggleItemFlag = (
    id: string,
    flag: 'isRecommended' | 'isMustTry' | 'isTodaySpecial' | 'isBestseller'
  ) => {
    setMenuItems((prev) =>
      prev.map((mi) => (mi.id === id ? { ...mi, [flag]: !mi[flag] } : mi))
    );
  };

  // Category management CRUD
  const addCategory = (categoryData: Omit<MenuCategory, 'id' | 'tenantId'>): MenuCategory => {
    const newCat: MenuCategory = {
      ...categoryData,
      id: `cat-${Date.now()}`,
      tenantId: currentTenantId,
      isActive: categoryData.isActive !== false,
      displayOrder: categoryData.displayOrder || categories.length + 1,
    };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = (id: string, updates: Partial<MenuCategory>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCategory = (id: string): boolean => {
    const otherCat = categories.find((c) => c.id !== id && c.tenantId === currentTenantId);
    if (otherCat) {
      setMenuItems((prev) =>
        prev.map((m) => (m.categoryId === id ? { ...m, categoryId: otherCat.id } : m))
      );
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    return true;
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
    primaryColor?: string;
    accentColor?: string;
    secondaryColor?: string;
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
      primaryColor: tenantData.primaryColor || '#30673A',
      accentColor: tenantData.accentColor || '#E3792F',
      secondaryColor: tenantData.secondaryColor || '#E9E9C7',
      currency: 'INR',
      currencySymbol: '₹',
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
      qrToken: `qr-${newId.slice(-6)}-${Math.random().toString(36).slice(2, 6)}`,
      isActive: true,
    };
    const table2: RestaurantTable = {
      id: `tbl-${newId}-2`,
      tenantId: newId,
      tableNumber: 'Table 2',
      capacity: 4,
      qrToken: `qr-${newId.slice(-6)}-${Math.random().toString(36).slice(2, 6)}`,
      isActive: true,
    };
    const table3: RestaurantTable = {
      id: `tbl-${newId}-3`,
      tenantId: newId,
      tableNumber: 'Patio VIP',
      capacity: 6,
      qrToken: `qr-${newId.slice(-6)}-${Math.random().toString(36).slice(2, 6)}`,
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
    setStaffMembers(INITIAL_STAFF_MEMBERS);
    setCurrentStaffUser(null);
    setCart([]);
    setDietaryFilter('all');
  };

  const addStaff = async (
    staffDataOrUsername: string | (Partial<StaffMember> & { username: string; role: StaffRole; password?: string; name?: string }),
    legacyPassword?: string,
    legacyRole?: StaffRole
  ) => {
    let name = '';
    let username = '';
    let password = legacyPassword || 'password123';
    let role: StaffRole = legacyRole || 'waiter';
    let station = '';
    let phone = '';
    let email = '';

    if (typeof staffDataOrUsername === 'string') {
      username = staffDataOrUsername;
      name = staffDataOrUsername;
      password = legacyPassword || 'password123';
      role = legacyRole || 'waiter';
    } else {
      username = staffDataOrUsername.username;
      name = staffDataOrUsername.name || staffDataOrUsername.username;
      password = staffDataOrUsername.password || 'password123';
      role = staffDataOrUsername.role || 'waiter';
      station = staffDataOrUsername.station || '';
      phone = staffDataOrUsername.phone || '';
      email = staffDataOrUsername.email || '';
    }

    const newStaffMember: StaffMember = {
      id: `staff-${Date.now()}`,
      tenantId: currentTenantId,
      name,
      username,
      password,
      role,
      station: station || (role === 'waiter' ? 'Dining Floor' : role === 'kitchen' ? 'Kitchen Line' : 'Admin Operations'),
      status: 'active',
      phone,
      email,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    setStaffMembers((prev) => [newStaffMember, ...prev]);

    try {
      await addDoc(collection(db, 'staffCredentials'), {
        id: newStaffMember.id,
        name,
        username,
        password,
        role,
        station: newStaffMember.station,
        phone,
        email,
        tenantId: currentTenantId,
        restaurantName: currentTenant.name,
        createdAt: newStaffMember.createdAt,
      });
    } catch (error) {
      console.warn('Notice: Firestore staff credential sync (offline or restricted):', error);
    }

    logAuditEvent(
      'STAFF_MEMBER_ADDED',
      `Registered new ${role} team member: ${name} (@${username})`,
      currentTenant.name,
      'info'
    );
  };

  const resetStaffPassword = async (staffId: string, newPassword: string): Promise<boolean> => {
    const staff = staffMembers.find((s) => s.id === staffId);
    if (!staff) return false;

    setStaffMembers((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, password: newPassword } : s))
    );

    try {
      const q = query(
        collection(db, 'staffCredentials'),
        where('username', '==', staff.username),
        where('tenantId', '==', staff.tenantId)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        for (const docSnap of querySnapshot.docs) {
          await updateDoc(docSnap.ref, {
            password: newPassword,
            updatedAt: new Date().toISOString(),
          });
        }
      } else {
        await addDoc(collection(db, 'staffCredentials'), {
          id: staff.id,
          name: staff.name,
          username: staff.username,
          password: newPassword,
          role: staff.role,
          tenantId: staff.tenantId,
          restaurantName: currentTenant.name,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.warn('Notice: Firestore password sync note:', error);
    }

    logAuditEvent(
      'STAFF_PASSWORD_RESET',
      `Password successfully reset for staff member ${staff.name} (@${staff.username})`,
      currentTenant.name,
      'warning'
    );

    return true;
  };

  const toggleStaffStatus = (staffId: string) => {
    const target = staffMembers.find((s) => s.id === staffId);
    if (!target) return;
    const nextStatus = target.status === 'active' ? 'inactive' : 'active';
    setStaffMembers((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, status: nextStatus } : s))
    );
    logAuditEvent(
      'STAFF_STATUS_UPDATED',
      `Status for ${target.name} set to ${nextStatus}`,
      currentTenant.name,
      'info'
    );
  };

  const deleteStaff = (staffId: string) => {
    const target = staffMembers.find((s) => s.id === staffId);
    if (!target) return;
    setStaffMembers((prev) => prev.filter((s) => s.id !== staffId));
    logAuditEvent(
      'STAFF_MEMBER_DELETED',
      `Removed staff member ${target.name} (@${target.username})`,
      currentTenant.name,
      'warning'
    );
  };

  const loginStaff = async (
    hotelNameInput: string,
    usernameInput: string,
    passwordInput: string
  ): Promise<{ success: boolean; error?: string; staff?: StaffMember }> => {
    const rawHotel = hotelNameInput.trim();
    const rawUsername = usernameInput.trim();
    const rawPassword = passwordInput.trim();

    if (!rawHotel) {
      return { success: false, error: 'Please enter the hotel or restaurant name.' };
    }
    if (!rawUsername || !rawPassword) {
      return { success: false, error: 'Please enter both User ID and Password.' };
    }

    const cleanHotelInput = rawHotel.toLowerCase();
    const cleanUsername = rawUsername.toLowerCase();

    // 1. Hotel name lookup: match by full name, slug, or normalized alphanumeric string
    const matchedTenant = tenants.find((t) => {
      const name = t.name.toLowerCase();
      const slug = t.slug.toLowerCase();
      const normName = name.replace(/[^a-z0-9]/g, '');
      const normSlug = slug.replace(/[^a-z0-9]/g, '');
      const normQuery = cleanHotelInput.replace(/[^a-z0-9]/g, '');
      return (
        name === cleanHotelInput ||
        slug === cleanHotelInput ||
        normName === normQuery ||
        normSlug === normQuery
      );
    });

    if (!matchedTenant) {
      return {
        success: false,
        error: 'Hotel not found. Please verify the restaurant name.',
      };
    }

    // 2. Strict tenant-scoped staff lookup:
    // Only search staff members belonging to matchedTenant.id
    let staffFound = staffMembers.find(
      (s) =>
        s.tenantId === matchedTenant.id &&
        s.username.toLowerCase() === cleanUsername
    );

    // If not found in memory, query Firestore for this tenant exclusively
    if (!staffFound) {
      try {
        const q = query(
          collection(db, 'staffCredentials'),
          where('tenantId', '==', matchedTenant.id),
          where('username', '==', cleanUsername)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const docData = snapshot.docs[0].data();
          staffFound = {
            id: docData.id || snapshot.docs[0].id,
            tenantId: matchedTenant.id,
            name: docData.name || cleanUsername,
            username: docData.username,
            password: docData.password,
            role: docData.role || 'waiter',
            station: docData.station || '',
            status: 'active',
            createdAt: docData.createdAt || new Date().toISOString(),
          };
          setStaffMembers((prev) => [staffFound!, ...prev]);
        }
      } catch (err) {
        console.warn('Firestore fallback query notice:', err);
      }
    }

    // 3. User verification: If staff does not exist in this hotel OR password does not match
    if (!staffFound || staffFound.password !== rawPassword) {
      logAuditEvent(
        'STAFF_LOGIN_FAILED',
        `Failed authentication attempt for user "${cleanUsername}" at hotel "${matchedTenant.name}"`,
        matchedTenant.name,
        'warning'
      );
      return {
        success: false,
        error: 'User ID or password is incorrect.',
      };
    }

    // 4. Check active status
    if (staffFound.status === 'inactive') {
      return {
        success: false,
        error: 'This staff account is currently deactivated. Please contact your restaurant manager.',
      };
    }

    // 5. Successful login: update lastLogin, set session, set tenant, set role
    const updatedStaff: StaffMember = {
      ...staffFound,
      lastLogin: new Date().toISOString(),
    };

    setStaffMembers((prev) =>
      prev.map((s) => (s.id === updatedStaff.id ? updatedStaff : s))
    );
    setCurrentStaffUser(updatedStaff);
    setCurrentTenantId(matchedTenant.id);

    if (updatedStaff.role === 'waiter') {
      setCurrentRole('waiter');
    } else if (updatedStaff.role === 'kitchen') {
      setCurrentRole('kitchen');
    } else if (updatedStaff.role === 'admin') {
      setCurrentRole('restaurant_admin');
    }

    logAuditEvent(
      'STAFF_LOGIN_SUCCESS',
      `Staff member ${updatedStaff.name} (@${updatedStaff.username}) logged in as ${updatedStaff.role} at ${matchedTenant.name}`,
      matchedTenant.name,
      'info'
    );

    return { success: true, staff: updatedStaff };
  };

  const logoutStaff = () => {
    if (currentStaffUser) {
      logAuditEvent(
        'STAFF_LOGOUT',
        `Staff member ${currentStaffUser.name} logged out`,
        currentTenant.name,
        'info'
      );
    }
    setCurrentStaffUser(null);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}currentStaffUser`);
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

  const scopedStaffMembers = useMemo(() => {
    return staffMembers.filter((s) => s.tenantId === currentTenantId);
  }, [staffMembers, currentTenantId]);

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
        refreshCloudOrders,
        serviceRequests,
        createServiceRequest,
        claimServiceRequest,
        resolveServiceRequest,
        favorites,
        toggleFavorite,
        isFavorite,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        duplicateMenuItem,
        bulkUpdateMenuItems,
        bulkDeleteMenuItems,
        toggleItemAvailability,
        toggleItemFlag,
        addCategory,
        updateCategory,
        deleteCategory,
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
        staffMembers,
        scopedStaffMembers,
        addStaff,
        resetStaffPassword,
        toggleStaffStatus,
        deleteStaff,
        currentStaffUser,
        loginStaff,
        logoutStaff,
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
