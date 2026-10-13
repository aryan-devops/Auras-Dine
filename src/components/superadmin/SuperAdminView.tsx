import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Plus,
  CheckCircle,
  PauseCircle,
  PlayCircle,
  Search,
  Download,
  AlertTriangle,
  Server,
  Activity,
  FileText,
  Sliders,
  Radio,
  Trash2,
  X,
  CreditCard,
  Layers,
  ArrowUpRight,
  Clock,
  Sparkles,
  Monitor,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { MembershipPlan } from '../../types';

export const SuperAdminView: React.FC = () => {
  const {
    tenants,
    setCurrentTenantId,
    updateTenantById,
    membershipPlans,
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
    orders,
    setCurrentRole,
  } = useRestaurant();

  // Active view tab in super admin console
  const [activeTab, setActiveTab] = useState<
    'overview' | 'tenants' | 'plans' | 'billing' | 'audit' | 'health'
  >('overview');

  // Search and filters
  const [searchTenant, setSearchTenant] = useState('');
  const [tenantStatusFilter, setTenantStatusFilter] = useState<'all' | 'active' | 'suspended' | 'expiring_soon'>('all');
  const [auditFilter, setAuditFilter] = useState<'all' | 'info' | 'warning' | 'critical'>('all');

  // Modals
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [selectedTenantForRenew, setSelectedTenantForRenew] = useState<string | null>(null);
  const [selectedPlanForRenew, setSelectedPlanForRenew] = useState<'3_months' | '6_months' | '12_months'>('6_months');
  
  const [isPlanEditModalOpen, setIsPlanEditModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [planFormPrice, setPlanFormPrice] = useState('');
  const [planFormTables, setPlanFormTables] = useState('');

  // Onboarding Form State
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantCuisine, setNewTenantCuisine] = useState('');
  const [newTenantTagline, setNewTenantTagline] = useState('');
  const [newTenantAddress, setNewTenantAddress] = useState('');
  const [newTenantPhone, setNewTenantPhone] = useState('');
  const [newTenantPlan, setNewTenantPlan] = useState<'3_months' | '6_months' | '12_months'>('6_months');
  const [newTenantTax, setNewTenantTax] = useState('6');
  const [newTenantService, setNewTenantService] = useState('5');
  const [newPrimaryColor, setNewPrimaryColor] = useState('#07543a');
  const [newAccentColor, setNewAccentColor] = useState('#0a7350');
  const [newSecondaryColor, setNewSecondaryColor] = useState('#E6F2ED');
  const [newTenantLogoUrl, setNewTenantLogoUrl] = useState('');

  // Logo Management Modal State
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [logoModalTenantId, setLogoModalTenantId] = useState<string | null>(null);
  const [editingLogoUrl, setEditingLogoUrl] = useState('');

  // Password Management State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordTenantId, setPasswordTenantId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [roleToReset, setRoleToReset] = useState<'admin' | 'waiter' | 'kitchen'>('admin');

  // Health check simulation
  const [healthStatus, setHealthStatus] = useState<{
    databaseLatencyMs: number;
    realtimeConnections: number;
    storageBandwidthMB: number;
    lastPing: string;
  }>({
    databaseLatencyMs: 14,
    realtimeConnections: 48,
    storageBandwidthMB: 124.8,
    lastPing: new Date().toLocaleTimeString(),
  });
  const [isPinging, setIsPinging] = useState(false);

  // Platform Metrics
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.subscription.status === 'active').length;
  const suspendedTenants = tenants.filter((t) => t.subscription.status === 'suspended').length;
  
  // Total platform SaaS billing collected
  const totalSubscriptionRevenue = billingInvoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  // Monthly Recurring Revenue estimate (MRR)
  const estimatedMRR = tenants.reduce((sum, t) => {
    if (t.subscription.status !== 'active') return sum;
    const plan = membershipPlans.find((p) => p.id === t.subscription.planId) || membershipPlans[0];
    return sum + (plan.price / plan.durationMonths);
  }, 0);

  const estimatedARR = estimatedMRR * 12;

  // Filtered tenants
  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(searchTenant.toLowerCase()) ||
        t.slug.toLowerCase().includes(searchTenant.toLowerCase()) ||
        t.cuisine.toLowerCase().includes(searchTenant.toLowerCase());
      
      if (!matchSearch) return false;

      if (tenantStatusFilter === 'all') return true;
      if (tenantStatusFilter === 'active') return t.subscription.status === 'active';
      if (tenantStatusFilter === 'suspended') return t.subscription.status === 'suspended';
      if (tenantStatusFilter === 'expiring_soon') {
        const expiry = new Date(t.subscription.expiryDate).getTime();
        const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;
        return expiry - Date.now() < sixtyDaysMs;
      }
      return true;
    });
  }, [tenants, searchTenant, tenantStatusFilter]);

  // Filtered audit logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((l) => {
      if (auditFilter === 'all') return true;
      return l.severity === auditFilter;
    });
  }, [auditLogs, auditFilter]);

  const LOGO_PRESETS = [
    { label: 'AurasDine Emerald Crest', url: '/aurasdine-emblem-green.png' },
    { label: 'AurasDine Monogram', url: '/aurasdine-emblem-transparent.png' },
    { label: 'AurasDine Dark Emblem', url: '/aurasdine-emblem-dark.png' },
    { label: 'AurasDine Full Brand Mark', url: '/aurasdine-logo.png' },
  ];

  // Handlers
  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName.trim()) return;

    onboardTenant({
      name: newTenantName.trim(),
      cuisine: newTenantCuisine.trim() || 'Modern Cuisine',
      tagline: newTenantTagline.trim() || 'Artisanal culinary dining',
      address: newTenantAddress.trim() || 'Downtown District',
      phone: newTenantPhone.trim() || '+1 (555) 300-8800',
      planId: newTenantPlan,
      taxRatePercent: parseFloat(newTenantTax) || 6,
      serviceChargePercent: parseFloat(newTenantService) || 5,
      logoUrl: newTenantLogoUrl.trim() || undefined,
    });

    setIsOnboardModalOpen(false);
    // Reset form
    setNewTenantName('');
    setNewTenantCuisine('');
    setNewTenantTagline('');
    setNewTenantAddress('');
    setNewTenantPhone('');
    setNewTenantLogoUrl('');
  };

  const handleOpenLogoModal = (tenantId: string) => {
    const target = tenants.find((t) => t.id === tenantId);
    setLogoModalTenantId(tenantId);
    setEditingLogoUrl(target?.logoUrl || '');
    setIsLogoModalOpen(true);
  };

  const handleSaveTenantLogo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!logoModalTenantId) return;
    const target = tenants.find((t) => t.id === logoModalTenantId);
    updateTenantById(logoModalTenantId, {
      logoUrl: editingLogoUrl.trim() || undefined,
    });
    logAuditEvent(
      'Update Restaurant Logo',
      `Updated logo asset for ${target?.name || logoModalTenantId}`,
      target?.name,
      'info'
    );
    setIsLogoModalOpen(false);
    setLogoModalTenantId(null);
  };

  const handleFileLogoChange = (
    file: File | null,
    callback: (dataUrl: string) => void
  ) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Logo file must be under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        callback(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRenewSubmit = () => {
    if (!selectedTenantForRenew) return;
    updateTenantSubscription(selectedTenantForRenew, selectedPlanForRenew, 'active');
    setIsRenewModalOpen(false);
    setSelectedTenantForRenew(null);
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTenantId || !newPassword) return;
    // In a real app, this would call a backend function to update Firebase Auth
    alert(`Password reset for ${roleToReset} in tenant ${passwordTenantId} to: ${newPassword}`);
    setIsPasswordModalOpen(false);
    setNewPassword('');
  };

  const handlePlanEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    updateMembershipPlan(editingPlan.id, {
      price: parseFloat(planFormPrice) || editingPlan.price,
      maxTables: parseInt(planFormTables) || editingPlan.maxTables,
    });
    setIsPlanEditModalOpen(false);
    setEditingPlan(null);
  };

  const handlePingHealth = () => {
    setIsPinging(true);
    setTimeout(() => {
      setHealthStatus({
        databaseLatencyMs: Math.floor(10 + Math.random() * 10),
        realtimeConnections: 45 + Math.floor(Math.random() * 8),
        storageBandwidthMB: Number((120 + Math.random() * 15).toFixed(1)),
        lastPing: new Date().toLocaleTimeString(),
      });
      setIsPinging(false);
    }, 600);
  };

  const handleExportInvoicesCsv = () => {
    const headers = 'Invoice ID,Restaurant,Plan,Amount,Date,Status,Payment Method,Billing Period\n';
    const rows = billingInvoices
      .map(
        (inv) =>
          `"${inv.invoiceNumber}","${inv.tenantName}","${inv.planName}",${inv.amount},"${inv.date}","${inv.status}","${inv.paymentMethod}","${inv.billingPeriod}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aurasdine-invoices-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#151815] text-[#FAF8F5] p-4 sm:p-6 pb-28">
      {/* Viewport restriction (< 1024px): Desktop-Only Experience Guard (Requirement 5.C) */}
      <div className="lg:hidden flex flex-col items-center justify-center min-h-[75vh] p-6 text-center max-w-md mx-auto my-auto animate-in fade-in">
        <div className="w-16 h-16 rounded-3xl bg-[#0a7350]/20 border border-[#0a7350]/40 flex items-center justify-center text-[#0a7350] mb-6 shadow-xl">
          <Monitor className="w-8 h-8" />
        </div>
        <span className="text-[11px] uppercase tracking-widest font-mono font-bold text-[#0a7350] bg-[#0a7350]/10 px-3 py-1 rounded-full border border-[#0a7350]/30 mb-3">
          1024px+ Viewport Required
        </span>
        <h2 className="text-2xl font-bold font-heading glinster-font text-white mb-2">
          Desktop Screen Required
        </h2>
        <p className="text-xs text-neutral-400 leading-relaxed mb-6">
          The Aurasdine Platform Super Admin portal is designed exclusively for desktop workstations and laptops (1024px and wider) to display multi-tenant matrix tables, real-time telemetry, and financial audit logs.
        </p>
        <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 space-y-2 w-full mb-6 text-left">
          <div className="flex justify-between items-center">
            <span>Minimum Screen Width:</span>
            <span className="font-mono text-white font-bold">1024px (Desktop)</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Access Security:</span>
            <span className="text-[#07543a] font-bold">Enforced by Server-Side RLS</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Mobile Management:</span>
            <span className="text-[#FAF8F5] font-semibold">Restaurant Admin Available</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            type="button"
            onClick={() => setCurrentRole('restaurant_admin')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#07543a] hover:bg-[#053d2a] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            Open Restaurant Admin
          </button>
          <button
            type="button"
            onClick={() => setCurrentRole('customer')}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-all cursor-pointer"
          >
            View Customer Menu
          </button>
        </div>
      </div>

      {/* Full Desktop Super Admin Console (>= 1024px) */}
      <div className="hidden lg:block max-w-7xl mx-auto space-y-6">
        
        {/* 1. Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#07543a] to-[#0a7350] text-white flex items-center justify-center font-bold text-xl shadow-lg">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold glinster-font text-white">
                  Aurasdine · Platform Super Admin
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#0a7350]/20 text-[#0a7350] border border-[#0a7350]/40 font-mono">
                  Multi-Tenant Root
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Centralized SaaS Architecture, Subscriptions Ledger & Platform Governance
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsOnboardModalOpen(true)}
              className="py-2 px-3.5 rounded-xl bg-[#07543a] hover:bg-[#053d2a] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard Restaurant</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Reset demo state back to clean factory initial data?')) {
                  resetDemoData();
                }
              }}
              className="py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset Demo Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>
          </div>
        </div>

        {/* 2. Super Admin Navigation Sub-Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`min-h-[36px] px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#07543a]" />
            <span>Overview & KPIs</span>
          </button>

          <button
            onClick={() => setActiveTab('tenants')}
            className={`min-h-[36px] px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'tenants'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-[#0a7350]" />
            <span>Tenants Directory ({tenants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            className={`min-h-[36px] px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'plans'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Plans & Pricing Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`min-h-[36px] px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'billing'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Invoices Ledger ({billingInvoices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`min-h-[36px] px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`min-h-[36px] px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'health'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>System Health & Config</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & KPIS */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top KPI row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-xs font-semibold">Monthly Recurring Revenue (MRR)</span>
                  <DollarSign className="w-4 h-4 text-[#07543a]" />
                </div>
                <div className="text-2xl font-black font-mono text-white mt-2">
                  ₹{estimatedMRR.toFixed(2)}
                </div>
                <div className="text-[11px] text-[#07543a] font-semibold mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>ARR run-rate: ₹{estimatedARR.toFixed(0)}</span>
                </div>
              </div>

              <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-xs font-semibold">Active SaaS Tenants</span>
                  <Building2 className="w-4 h-4 text-[#0a7350]" />
                </div>
                <div className="text-2xl font-black font-mono text-white mt-2">
                  {activeTenants} / {totalTenants}
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  {suspendedTenants} suspended · 100% data isolated
                </div>
              </div>

              <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-xs font-semibold">Lifetime Billing Volume</span>
                  <CreditCard className="w-4 h-4 text-[#0284C7]" />
                </div>
                <div className="text-2xl font-black font-mono text-white mt-2">
                  ₹{totalSubscriptionRevenue.toFixed(2)}
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  {billingInvoices.length} paid membership cycles
                </div>
              </div>

              <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-xs font-semibold">Platform Orders Processed</span>
                  <Activity className="w-4 h-4 text-[#8B5CF6]" />
                </div>
                <div className="text-2xl font-black font-mono text-white mt-2">
                  {orders.length}
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  Across all active tables
                </div>
              </div>
            </div>

            {/* Platform Distribution & Quick Glance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tenant Overview Card */}
              <div className="p-5 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white glinster-font flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#07543a]" />
                    Restaurant Tenant Roster
                  </h3>
                  <button
                    onClick={() => setActiveTab('tenants')}
                    className="text-xs text-[#0a7350] hover:underline font-semibold"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {tenants.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 bg-neutral-800/60 rounded-xl flex items-center justify-between text-xs gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {t.logoUrl ? (
                          <img
                            src={t.logoUrl}
                            alt={t.name}
                            className="w-9 h-9 rounded-xl object-contain bg-neutral-900 border border-neutral-700/80 p-1 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-[#07543a]/25 border border-[#07543a]/40 text-[#E6F2ED] font-black flex items-center justify-center shrink-0 glinster-font text-xs">
                            {t.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-white flex items-center gap-2 truncate">
                            <span className="truncate">{t.name}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase shrink-0 ${
                                t.subscription.status === 'active'
                                  ? 'bg-emerald-900/60 text-emerald-400'
                                  : 'bg-red-900/60 text-red-400'
                              }`}
                            >
                              {t.subscription.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-neutral-400 truncate">
                            {t.cuisine} · {t.subscription.planName}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleOpenLogoModal(t.id)}
                          className="px-2 py-1 rounded-lg bg-neutral-700/80 hover:bg-[#07543a] text-neutral-200 hover:text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
                          title="Manage Restaurant Logo"
                        >
                          <ImageIcon className="w-3 h-3 text-[#0a7350]" />
                          <span className="hidden sm:inline">Logo</span>
                        </button>
                        <button
                          onClick={() => {
                            setCurrentTenantId(t.id);
                            alert(`Switched active context to ${t.name}!`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white text-[11px] font-medium"
                        >
                          Switch
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent System Activity Card */}
              <div className="p-5 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white glinster-font flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#0a7350]" />
                    Recent Platform Audit Events
                  </h3>
                  <button
                    onClick={() => setActiveTab('audit')}
                    className="text-xs text-[#0a7350] hover:underline font-semibold"
                  >
                    Full Log →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {auditLogs.slice(0, 4).map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 bg-neutral-800/60 rounded-xl text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold font-mono text-[11px] text-[#E6F2ED]">
                          {log.action}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-300">
                        {log.details}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TENANTS DIRECTORY */}
        {activeTab === 'tenants' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold glinster-font text-white">
                  Restaurant Tenant Administration
                </h2>
                <p className="text-xs text-neutral-400">
                  Manage memberships, review seating quota limits, and control tenant lifecycle
                </p>
              </div>

              {/* Search and Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search restaurant..."
                    value={searchTenant}
                    onChange={(e) => setSearchTenant(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#07543a]"
                  />
                </div>

                <select
                  value={tenantStatusFilter}
                  onChange={(e) => setTenantStatusFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended Only</option>
                  <option value="expiring_soon">Expiring Soon (60d)</option>
                </select>
              </div>
            </div>

            {/* Tenants Table */}
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-800/70 text-neutral-400 font-bold uppercase tracking-wider text-[10px] border-b border-neutral-800">
                    <tr>
                      <th className="py-3 px-4">Restaurant</th>
                      <th className="py-3 px-4">Cuisine</th>
                      <th className="py-3 px-4">Plan & Expiry</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Contact & Location</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {filteredTenants.map((t) => {
                      const isSuspended = t.subscription.status === 'suspended';
                      const expiryDate = new Date(t.subscription.expiryDate);

                      return (
                        <tr key={t.id} className="hover:bg-neutral-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {t.logoUrl ? (
                                <img
                                  src={t.logoUrl}
                                  alt={t.name}
                                  className="w-10 h-10 rounded-xl object-contain bg-neutral-950 border border-neutral-700/80 p-1 shrink-0 shadow-xs"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-[#07543a]/25 border border-[#07543a]/40 text-[#E6F2ED] font-black flex items-center justify-center shrink-0 glinster-font text-sm">
                                  {t.name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                                  <span>{t.name}</span>
                                  {t.logoUrl && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Custom Logo Configured" />
                                  )}
                                </div>
                                <div className="text-[11px] font-mono text-neutral-500">
                                  Slug: {t.slug}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-neutral-300">
                            {t.cuisine}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-[#E6F2ED]">
                              {t.subscription.planName}
                            </div>
                            <div className="text-[11px] text-neutral-400">
                              Expires: {expiryDate.toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                isSuspended
                                    ? 'bg-red-900/40 text-red-400 border border-red-800'
                                    : 'bg-emerald-900/40 text-emerald-400 border border-emerald-800'
                              }`}
                            >
                              {t.subscription.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-neutral-400">
                            <div>{t.address}</div>
                            <div className="text-[11px]">{t.phone}</div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenLogoModal(t.id)}
                                className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-[#07543a] text-neutral-200 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                                title="Upload & Manage Restaurant Logo"
                              >
                                <ImageIcon className="w-3 h-3 text-[#0a7350]" />
                                <span>Logo</span>
                              </button>

                              <button
                                onClick={() => {
                                  setCurrentTenantId(t.id);
                                  alert(`Switched active context to ${t.name}!`);
                                }}
                                className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-semibold"
                                title="Switch Context"
                              >
                                Switch
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedTenantForRenew(t.id);
                                  setIsRenewModalOpen(true);
                                }}
                                className="px-2 py-1 rounded-lg bg-[#07543a] hover:bg-[#053d2a] text-white text-[11px] font-semibold flex items-center gap-1"
                              >
                                <Calendar className="w-3 h-3" />
                                Renew
                              </button>

                              <button
                                onClick={() => {
                                  setPasswordTenantId(t.id);
                                  setIsPasswordModalOpen(true);
                                }}
                                className="px-2 py-1 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white text-[11px] font-semibold"
                                title="Reset Staff Password"
                              >
                                Password
                              </button>

                              <button
                                onClick={() => toggleTenantSuspension(t.id)}
                                className={`p-1.5 rounded-lg text-xs ${
                                  isSuspended
                                    ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50'
                                    : 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                                }`}
                                title={isSuspended ? 'Reactivate operational access' : 'Suspend operational access'}
                              >
                                {isSuspended ? (
                                  <PlayCircle className="w-3.5 h-3.5" />
                                ) : (
                                  <PauseCircle className="w-3.5 h-3.5" />
                                )}
                              </button>

                              <button
                                onClick={() => {
                                  if (confirm(`Archive and permanently delete ${t.name}?`)) {
                                    archiveTenant(t.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-950 text-neutral-500 hover:text-red-400 transition-colors"
                                title="Archive Tenant"
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

        {/* TAB 3: PLANS & PRICING ENGINE */}
        {activeTab === 'plans' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold glinster-font text-white">
                SaaS Subscription Tiers Engine
              </h2>
              <p className="text-xs text-neutral-400">
                Database-driven tier terms, table limits, and pricing adjustments
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {membershipPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-6 rounded-2xl bg-neutral-900 border flex flex-col justify-between ${
                    plan.recommended
                      ? 'border-[#07543a] ring-1 ring-[#07543a]'
                      : 'border-neutral-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                        {plan.name}
                      </h3>
                      {plan.recommended && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#07543a] text-white font-bold">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-3xl font-black font-mono text-white">
                        ₹{plan.price}
                      </span>
                      <span className="text-xs text-neutral-400">
                        / {plan.durationMonths} months
                      </span>
                    </div>

                    <div className="text-xs text-[#E6F2ED] font-semibold mt-1">
                      Up to {plan.maxTables >= 999 ? 'Unlimited' : plan.maxTables} Dining Tables
                    </div>

                    <div className="my-4 pt-4 border-t border-neutral-800 space-y-2">
                      {plan.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-neutral-300">
                          <CheckCircle className="w-3.5 h-3.5 text-[#07543a] shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-800">
                    <button
                      onClick={() => {
                        setEditingPlan(plan);
                        setPlanFormPrice(String(plan.price));
                        setPlanFormTables(String(plan.maxTables));
                        setIsPlanEditModalOpen(true);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Adjust Tier Pricing & Quota</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: INVOICES & BILLING LEDGER */}
        {activeTab === 'billing' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold glinster-font text-white">
                  SaaS Revenue & Billing Invoices Ledger
                </h2>
                <p className="text-xs text-neutral-400">
                  Historical receipts and membership renewal transactions
                </p>
              </div>

              <button
                onClick={handleExportInvoicesCsv}
                className="py-2 px-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Ledger CSV</span>
              </button>
            </div>

            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-800/70 text-neutral-400 font-bold uppercase tracking-wider text-[10px] border-b border-neutral-800">
                    <tr>
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Restaurant</th>
                      <th className="py-3 px-4">Plan & Period</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Payment Method</th>
                      <th className="py-3 px-4 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {billingInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-neutral-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-white">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3 px-4 font-semibold text-neutral-200">
                          {inv.tenantName}
                        </td>
                        <td className="py-3 px-4 text-neutral-300">
                          <div>{inv.planName}</div>
                          <div className="text-[10px] text-neutral-500">{inv.billingPeriod}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#E6F2ED]">
                          ₹{inv.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-900/50 text-emerald-400 border border-emerald-800">
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-neutral-400 text-[11px]">
                          {inv.paymentMethod}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-neutral-500">
                          {new Date(inv.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AUDIT LOG TRAIL */}
        {activeTab === 'audit' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold glinster-font text-white">
                  Security & Administrative Audit Trail
                </h2>
                <p className="text-xs text-neutral-400">
                  Immutable security actions, tenant lifecycle updates, and pricing modifications
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Severity:</span>
                <select
                  value={auditFilter}
                  onChange={(e) => setAuditFilter(e.target.value as any)}
                  className="px-2.5 py-1 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
                >
                  <option value="all">All Events</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 divide-y divide-neutral-800 overflow-hidden">
              {filteredAuditLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-neutral-800/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          log.severity === 'critical'
                            ? 'bg-red-500'
                            : log.severity === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-[#07543a]'
                        }`}
                      />
                      <span className="font-mono font-bold text-xs text-white">
                        {log.action}
                      </span>
                      {log.tenantName && (
                        <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-[#E6F2ED] font-semibold">
                          {log.tenantName}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-neutral-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 mt-1 pl-4">
                    {log.details}
                  </p>
                  <div className="text-[10px] text-neutral-500 pl-4 mt-0.5">
                    Actor: {log.actor}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: SYSTEM HEALTH & PLATFORM CONFIG */}
        {activeTab === 'health' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold glinster-font text-white">
                Platform Infrastructure & Global Settings
              </h2>
              <p className="text-xs text-neutral-400">
                PostgreSQL database connection pool, storage latency, and network broadcast
              </p>
            </div>

            {/* Health Metrics Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800">
                <div className="flex items-center justify-between text-neutral-400 text-xs">
                  <span>Supabase PostgreSQL Pool</span>
                  <Server className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-mono font-black text-white mt-2">
                  {healthStatus.databaseLatencyMs} ms
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                  Nominal connection latency
                </div>
              </div>

              <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800">
                <div className="flex items-center justify-between text-neutral-400 text-xs">
                  <span>Realtime WebSocket Channels</span>
                  <Radio className="w-4 h-4 text-[#07543a]" />
                </div>
                <div className="text-2xl font-mono font-black text-white mt-2">
                  {healthStatus.realtimeConnections}
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  Active KDS & Waiter streams
                </div>
              </div>

              <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800">
                <div className="flex items-center justify-between text-neutral-400 text-xs">
                  <span>Storage Egress Bandwidth</span>
                  <Activity className="w-4 h-4 text-[#0a7350]" />
                </div>
                <div className="text-2xl font-mono font-black text-white mt-2">
                  {healthStatus.storageBandwidthMB} MB
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  Food photos & menu caching
                </div>
              </div>

              <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-neutral-400">Last Telemetry Ping</div>
                  <div className="text-sm font-mono font-bold text-white mt-1">
                    {healthStatus.lastPing}
                  </div>
                </div>
                <button
                  onClick={handlePingHealth}
                  disabled={isPinging}
                  className="mt-3 w-full py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition-colors"
                >
                  {isPinging ? 'Pinging Node...' : 'Test Connection Ping'}
                </button>
              </div>
            </div>

            {/* Global Broadcast Announcement Setting */}
            <div className="p-5 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-4">
              <h3 className="text-sm font-bold text-white glinster-font flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#0a7350]" />
                Platform-Wide Announcement Banner
              </h3>
              <p className="text-xs text-neutral-400">
                Broadcast critical maintenance windows or platform updates to all restaurant tenants and diners
              </p>

              <div className="space-y-3 max-w-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={platformSettings.announcement.enabled}
                    onChange={(e) =>
                      updatePlatformSettings({
                        announcement: {
                          ...platformSettings.announcement,
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded text-[#07543a]"
                  />
                  <span className="text-xs font-bold text-white">
                    Enable Live Broadcast Announcement
                  </span>
                </label>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">
                    Banner Announcement Message
                  </label>
                  <input
                    type="text"
                    value={platformSettings.announcement.message}
                    onChange={(e) =>
                      updatePlatformSettings({
                        announcement: {
                          ...platformSettings.announcement,
                          message: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#07543a]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODAL 1: ONBOARD RESTAURANT WIZARD */}
      {isOnboardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-neutral-900 rounded-2xl p-6 border border-neutral-700 text-white shadow-2xl">
            <button
              onClick={() => setIsOnboardModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold glinster-font text-white mb-1">
              Onboard New Restaurant Tenant
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Provisions database tenant record, assigns subscription tier, and auto-generates 3 initial QR tables
            </p>

            <form onSubmit={handleOnboardSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-300 mb-1">
                  Restaurant Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Botanica Osteria"
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:ring-1 focus:ring-[#07543a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-300 mb-1">
                    Cuisine & Concept
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Artisan Italian"
                    value={newTenantCuisine}
                    onChange={(e) => setNewTenantCuisine(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-300 mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sourdough & Wine"
                    value={newTenantTagline}
                    onChange={(e) => setNewTenantTagline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-300 mb-1">
                  Initial Subscription Tier *
                </label>
                <select
                  value={newTenantPlan}
                  onChange={(e) => setNewTenantPlan(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white font-semibold"
                >
                  {membershipPlans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.price} / {p.durationMonths}m ({p.maxTables >= 999 ? 'Unlimited' : p.maxTables} tables)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="block font-bold text-neutral-300 mb-1">Primary Color</label>
                  <input
                    type="color"
                    value={newPrimaryColor}
                    onChange={(e) => setNewPrimaryColor(e.target.value)}
                    className="w-full h-10 rounded-xl bg-neutral-800 border border-neutral-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-300 mb-1">Accent Color</label>
                  <input
                    type="color"
                    value={newAccentColor}
                    onChange={(e) => setNewAccentColor(e.target.value)}
                    className="w-full h-10 rounded-xl bg-neutral-800 border border-neutral-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-300 mb-1">Secondary Color</label>
                  <input
                    type="color"
                    value={newSecondaryColor}
                    onChange={(e) => setNewSecondaryColor(e.target.value)}
                    className="w-full h-10 rounded-xl bg-neutral-800 border border-neutral-700"
                  />
                </div>
              </div>

              {/* Brand Logo Upload */}
              <div className="p-3 bg-neutral-800/70 rounded-xl border border-neutral-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-neutral-300">
                    Restaurant Brand Logo (Optional)
                  </label>
                  {newTenantLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setNewTenantLogoUrl('')}
                      className="text-[11px] text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center shrink-0 overflow-hidden p-1 shadow-inner">
                    {newTenantLogoUrl ? (
                      <img
                        src={newTenantLogoUrl}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-neutral-500" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#07543a] hover:bg-[#053d2a] text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Logo File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileLogoChange(
                            e.target.files?.[0] || null,
                            setNewTenantLogoUrl
                          )
                        }
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Or paste image URL (https://...)"
                      value={newTenantLogoUrl}
                      onChange={(e) => setNewTenantLogoUrl(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-white text-[11px] focus:outline-none focus:ring-1 focus:ring-[#07543a]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-300 mb-1">
                    Location Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 14 Piazza Square"
                    value={newTenantAddress}
                    onChange={(e) => setNewTenantAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +1 555-432-1100"
                    value={newTenantPhone}
                    onChange={(e) => setNewTenantPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-300 mb-1">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    value={newTenantTax}
                    onChange={(e) => setNewTenantTax(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-300 mb-1">
                    Service Charge (%)
                  </label>
                  <input
                    type="number"
                    value={newTenantService}
                    onChange={(e) => setNewTenantService(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOnboardModalOpen(false)}
                  className="py-2 px-4 rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-[#07543a] hover:bg-[#053d2a] text-white font-bold"
                >
                  Onboard & Provision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RENEW MEMBERSHIP */}
      {isRenewModalOpen && selectedTenantForRenew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-neutral-900 rounded-2xl p-6 border border-neutral-700 text-white space-y-4">
            <h3 className="text-base font-bold glinster-font text-white">
              Extend & Renew Subscription Term
            </h3>
            <p className="text-xs text-neutral-400">
              Select renewal duration for{' '}
              <strong className="text-white">
                {tenants.find((t) => t.id === selectedTenantForRenew)?.name}
              </strong>:
            </p>

            <div className="space-y-2">
              {membershipPlans.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlanForRenew(p.id)}
                  className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-colors ${
                    selectedPlanForRenew === p.id
                      ? 'border-[#07543a] bg-[#07543a]/20'
                      : 'border-neutral-800 bg-neutral-800/40 hover:bg-neutral-800'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-white">{p.name}</div>
                    <div className="text-[11px] text-neutral-400">
                      {p.durationMonths} months duration
                    </div>
                  </div>
                  <span className="font-mono font-bold text-[#E6F2ED]">
                    ₹{p.price}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRenewModalOpen(false)}
                className="py-2 px-4 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRenewSubmit}
                className="py-2 px-5 rounded-xl bg-[#07543a] hover:bg-[#053d2a] text-white text-xs font-bold"
              >
                Execute Renewal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADJUST PLAN PRICING */}
      {isPlanEditModalOpen && editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-neutral-900 rounded-2xl p-6 border border-neutral-700 text-white space-y-4">
            <h3 className="text-base font-bold glinster-font text-white">
              Edit {editingPlan.name}
            </h3>

            <form onSubmit={handlePlanEditSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-300 font-bold mb-1">
                  Subscription Price ($)
                </label>
                <input
                  type="number"
                  required
                  value={planFormPrice}
                  onChange={(e) => setPlanFormPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">
                  Max Dining Table Quota
                </label>
                <input
                  type="number"
                  required
                  value={planFormTables}
                  onChange={(e) => setPlanFormTables(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white font-mono"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  Set to 999 for unlimited tables
                </span>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlanEditModalOpen(false)}
                  className="py-2 px-4 rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-[#07543a] hover:bg-[#053d2a] text-white font-bold"
                >
                  Save Tier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: PASSWORD RESET */}
      {isPasswordModalOpen && passwordTenantId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-neutral-900 rounded-2xl p-6 border border-neutral-700 text-white space-y-4">
            <h3 className="text-base font-bold glinster-font text-white">
              Reset Staff Password
            </h3>
            <p className="text-xs text-neutral-400">
              Reset for{' '}
              <strong className="text-white">
                {tenants.find((t) => t.id === passwordTenantId)?.name}
              </strong>
            </p>

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Target Role</label>
                <select
                  value={roleToReset}
                  onChange={(e) => setRoleToReset(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs"
                >
                  <option value="admin">Restaurant Admin</option>
                  <option value="waiter">Waiter</option>
                  <option value="kitchen">Kitchen/KDS</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">New Password</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-xs"
                  placeholder="Enter new password"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="py-2 px-4 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-[#07543a] hover:bg-[#053d2a] text-white text-xs font-bold"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: RESTAURANT LOGO STUDIO */}
      {isLogoModalOpen && logoModalTenantId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-700 text-white shadow-2xl space-y-5">
            <button
              onClick={() => {
                setIsLogoModalOpen(false);
                setLogoModalTenantId(null);
              }}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#07543a]/25 text-[#E6F2ED] border border-[#07543a]/40 text-[10px] font-bold uppercase tracking-wider mb-2">
                <ImageIcon className="w-3 h-3 text-[#0a7350]" />
                <span>Super Admin · Restaurant Brand Asset</span>
              </div>
              <h3 className="text-xl font-bold glinster-font text-white">
                Restaurant Brand Logo Studio
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Configure official high-resolution logo for{' '}
                <strong className="text-white">
                  {tenants.find((t) => t.id === logoModalTenantId)?.name}
                </strong>
                . Appears on customer digital menus, 3D tabletop stands, and check-in portals.
              </p>
            </div>

            {/* Live Dual Preview: Dark Surface vs Light Surface */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-300">
                Live Brand Previews
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Light Surface / Customer Menu Preview */}
                <div className="p-3.5 bg-white rounded-2xl border border-[#C2DFD4] text-[#0D1914] flex flex-col justify-between shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#07543a] mb-2">
                    Customer Menu Banner (Light)
                  </span>
                  <div className="flex items-center gap-2.5 my-2">
                    <div className="w-12 h-12 rounded-xl bg-white border border-[#07543a]/20 shadow-xs flex items-center justify-center p-1 overflow-hidden shrink-0">
                      {editingLogoUrl ? (
                        <img
                          src={editingLogoUrl}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#07543a] rounded-lg flex items-center justify-center text-white font-black glinster-font text-xs">
                          {tenants.find((t) => t.id === logoModalTenantId)?.name.charAt(0) || 'A'}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black truncate glinster-font text-[#0D1914]">
                        {tenants.find((t) => t.id === logoModalTenantId)?.name}
                      </div>
                      <div className="text-[10px] text-neutral-500 truncate">
                        {tenants.find((t) => t.id === logoModalTenantId)?.tagline}
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] text-[#07543a] font-semibold">
                    ✓ Verified Customer View
                  </span>
                </div>

                {/* Dark Surface / Admin & Stand Studio Preview */}
                <div className="p-3.5 bg-neutral-950 rounded-2xl border border-neutral-800 text-white flex flex-col justify-between shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0a7350] mb-2">
                    Acrylic Stand / Dark UI
                  </span>
                  <div className="flex items-center gap-2.5 my-2">
                    <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-700 shadow-inner flex items-center justify-center p-1 overflow-hidden shrink-0">
                      {editingLogoUrl ? (
                        <img
                          src={editingLogoUrl}
                          alt="Preview"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-800 rounded-lg flex items-center justify-center text-neutral-400 font-black glinster-font text-xs">
                          {tenants.find((t) => t.id === logoModalTenantId)?.name.charAt(0) || 'A'}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black truncate glinster-font text-white">
                        {tenants.find((t) => t.id === logoModalTenantId)?.name}
                      </div>
                      <div className="text-[10px] text-neutral-400 truncate">
                        Table Stand Center Mark
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] text-neutral-400 font-semibold">
                    ✓ High-Contrast Branding
                  </span>
                </div>
              </div>
            </div>

            {/* Upload Options */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-neutral-300">
                Upload New Logo Asset
              </label>

              {/* Local File Upload Button / Dropzone */}
              <label className="flex items-center justify-center gap-2.5 p-4 rounded-2xl border-2 border-dashed border-[#07543a]/60 bg-neutral-800/40 hover:bg-neutral-800/80 hover:border-[#07543a] transition-all cursor-pointer group text-center">
                <Upload className="w-4 h-4 text-[#0a7350] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-neutral-200">
                  Select image file from computer (PNG, JPG, SVG, WebP up to 5MB)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    handleFileLogoChange(e.target.files?.[0] || null, setEditingLogoUrl)
                  }
                />
              </label>

              {/* Remote URL input */}
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">
                  Or enter direct Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://images.example.com/logo.png"
                  value={editingLogoUrl}
                  onChange={(e) => setEditingLogoUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#07543a]"
                />
              </div>

              {/* Curated Brand Presets */}
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1.5">
                  Or choose verified AurasDine brand asset preset:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {LOGO_PRESETS.map((p) => (
                    <button
                      key={p.url}
                      type="button"
                      onClick={() => setEditingLogoUrl(p.url)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        editingLogoUrl === p.url
                          ? 'bg-[#07543a]/30 border-[#07543a] text-white shadow-xs'
                          : 'bg-neutral-800/60 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white'
                      }`}
                    >
                      <img
                        src={p.url}
                        alt={p.label}
                        className="w-8 h-8 object-contain rounded-md bg-neutral-900 p-0.5"
                      />
                      <span className="text-[10px] font-semibold leading-tight line-clamp-1">
                        {p.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setEditingLogoUrl('')}
                className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
              >
                Clear Logo (Use Monogram)
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogoModalOpen(false);
                    setLogoModalTenantId(null);
                  }}
                  className="py-2 px-4 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveTenantLogo()}
                  className="py-2.5 px-6 rounded-xl bg-[#07543a] hover:bg-[#053d2a] text-white text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Save Restaurant Logo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
