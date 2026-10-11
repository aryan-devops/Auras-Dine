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
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { MembershipPlan } from '../../types';

export const SuperAdminView: React.FC = () => {
  const {
    tenants,
    setCurrentTenantId,
    membershipPlans,
    updateMembershipPlan,
    updateTenantSubscription,
    toggleTenantSuspension,
    onboardTenant,
    archiveTenant,
    billingInvoices,
    auditLogs,
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
    });

    setIsOnboardModalOpen(false);
    // Reset form
    setNewTenantName('');
    setNewTenantCuisine('');
    setNewTenantTagline('');
    setNewTenantAddress('');
    setNewTenantPhone('');
  };

  const handleRenewSubmit = () => {
    if (!selectedTenantForRenew) return;
    updateTenantSubscription(selectedTenantForRenew, selectedPlanForRenew, 'active');
    setIsRenewModalOpen(false);
    setSelectedTenantForRenew(null);
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
    a.download = `auradine-invoices-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#1E231F] text-[#FAF8F2] p-4 sm:p-6 pb-28">
      {/* Viewport restriction (< 1024px): Desktop-Only Experience Guard (Requirement 5.C) */}
      <div className="lg:hidden flex flex-col items-center justify-center min-h-[75vh] p-6 text-center max-w-md mx-auto my-auto animate-in fade-in">
        <div className="w-16 h-16 rounded-3xl bg-[#E3792F]/20 border border-[#E3792F]/40 flex items-center justify-center text-[#E3792F] mb-6 shadow-xl">
          <Monitor className="w-8 h-8" />
        </div>
        <span className="text-[11px] uppercase tracking-widest font-mono font-bold text-[#E3792F] bg-[#E3792F]/10 px-3 py-1 rounded-full border border-[#E3792F]/30 mb-3">
          1024px+ Viewport Required
        </span>
        <h2 className="text-2xl font-bold font-heading glinster-font text-white mb-2">
          Desktop Screen Required
        </h2>
        <p className="text-xs text-neutral-400 leading-relaxed mb-6">
          The AuraDine Platform Super Admin portal is designed exclusively for desktop workstations and laptops (1024px and wider) to display multi-tenant matrix tables, real-time telemetry, and financial audit logs.
        </p>
        <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 space-y-2 w-full mb-6 text-left">
          <div className="flex justify-between items-center">
            <span>Minimum Screen Width:</span>
            <span className="font-mono text-white font-bold">1024px (Desktop)</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Access Security:</span>
            <span className="text-[#30673A] font-bold">Enforced by Server-Side RLS</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Mobile Management:</span>
            <span className="text-[#FAF8F2] font-semibold">Restaurant Admin Available</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <button
            type="button"
            onClick={() => setCurrentRole('restaurant_admin')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#30673A] hover:bg-[#204828] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E3792F] to-[#d9661b] text-white flex items-center justify-center font-bold text-xl shadow-lg">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold glinster-font text-white">
                  AuraDine · Platform Super Admin
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E3792F]/20 text-[#E3792F] border border-[#E3792F]/40 font-mono">
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
              className="py-2 px-3.5 rounded-xl bg-[#30673A] hover:bg-[#204828] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
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
            <TrendingUp className="w-3.5 h-3.5 text-[#30673A]" />
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
            <Building2 className="w-3.5 h-3.5 text-[#E3792F]" />
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
                  <DollarSign className="w-4 h-4 text-[#30673A]" />
                </div>
                <div className="text-2xl font-black font-mono text-white mt-2">
                  ₹{estimatedMRR.toFixed(2)}
                </div>
                <div className="text-[11px] text-[#30673A] font-semibold mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>ARR run-rate: ₹{estimatedARR.toFixed(0)}</span>
                </div>
              </div>

              <div className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-xs font-semibold">Active SaaS Tenants</span>
                  <Building2 className="w-4 h-4 text-[#E3792F]" />
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
                    <Building2 className="w-4 h-4 text-[#30673A]" />
                    Restaurant Tenant Roster
                  </h3>
                  <button
                    onClick={() => setActiveTab('tenants')}
                    className="text-xs text-[#E3792F] hover:underline font-semibold"
                  >
                    View All →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {tenants.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 bg-neutral-800/60 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{t.name}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                              t.subscription.status === 'active'
                                ? 'bg-emerald-900/60 text-emerald-400'
                                : 'bg-red-900/60 text-red-400'
                            }`}
                          >
                            {t.subscription.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          {t.cuisine} · {t.subscription.planName}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
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
                    <Clock className="w-4 h-4 text-[#E3792F]" />
                    Recent Platform Audit Events
                  </h3>
                  <button
                    onClick={() => setActiveTab('audit')}
                    className="text-xs text-[#E3792F] hover:underline font-semibold"
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
                        <span className="font-bold font-mono text-[11px] text-[#E9E9C7]">
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
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#30673A]"
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
                            <div className="font-bold text-white text-sm">
                              {t.name}
                            </div>
                            <div className="text-[11px] font-mono text-neutral-500">
                              Slug: {t.slug}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-neutral-300">
                            {t.cuisine}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-[#E9E9C7]">
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
                                className="px-2 py-1 rounded-lg bg-[#30673A] hover:bg-[#204828] text-white text-[11px] font-semibold flex items-center gap-1"
                              >
                                <Calendar className="w-3 h-3" />
                                Renew
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
                      ? 'border-[#30673A] ring-1 ring-[#30673A]'
                      : 'border-neutral-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                        {plan.name}
                      </h3>
                      {plan.recommended && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#30673A] text-white font-bold">
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

                    <div className="text-xs text-[#E9E9C7] font-semibold mt-1">
                      Up to {plan.maxTables >= 999 ? 'Unlimited' : plan.maxTables} Dining Tables
                    </div>

                    <div className="my-4 pt-4 border-t border-neutral-800 space-y-2">
                      {plan.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-neutral-300">
                          <CheckCircle className="w-3.5 h-3.5 text-[#30673A] shrink-0" />
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
                        <td className="py-3 px-4 font-mono font-bold text-[#E9E9C7]">
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
                            : 'bg-[#30673A]'
                        }`}
                      />
                      <span className="font-mono font-bold text-xs text-white">
                        {log.action}
                      </span>
                      {log.tenantName && (
                        <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-[#E9E9C7] font-semibold">
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
                  <Radio className="w-4 h-4 text-[#30673A]" />
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
                  <Activity className="w-4 h-4 text-[#E3792F]" />
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
                <Radio className="w-4 h-4 text-[#E3792F]" />
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
                    className="w-4 h-4 rounded text-[#30673A]"
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
                    className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#30673A]"
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
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white focus:outline-none focus:ring-1 focus:ring-[#30673A]"
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
                  className="py-2 px-5 rounded-xl bg-[#30673A] hover:bg-[#204828] text-white font-bold"
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
                      ? 'border-[#30673A] bg-[#30673A]/20'
                      : 'border-neutral-800 bg-neutral-800/40 hover:bg-neutral-800'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-white">{p.name}</div>
                    <div className="text-[11px] text-neutral-400">
                      {p.durationMonths} months duration
                    </div>
                  </div>
                  <span className="font-mono font-bold text-[#E9E9C7]">
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
                className="py-2 px-5 rounded-xl bg-[#30673A] hover:bg-[#204828] text-white text-xs font-bold"
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
                  className="py-2 px-4 rounded-xl bg-[#30673A] text-white font-bold"
                >
                  Save Tier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
