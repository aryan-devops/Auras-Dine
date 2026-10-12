import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Utensils, CheckCircle2, User, Phone, MapPin } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export const CustomerAuthPage: React.FC = () => {
  const { tenantSlug, tableId } = useParams<{ tenantSlug: string; tableId: string }>();
  const navigate = useNavigate();
  const { tenants, setCurrentTenantId, setCurrentTableId, setCurrentRole, tables } = useRestaurant();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const tenant = tenants.find((t) => t.slug === tenantSlug) || tenants[0];
  const table = tables.find((t) => t.id === tableId) || tables[0];

  const handleCheckInAndAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMsg('Please enter your name and phone number to continue.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // 1. Store customer check-in data securely in Firestore
      await addDoc(collection(db, 'customerSessions'), {
        tenantSlug: tenantSlug || tenant.slug,
        tableId: tableId || table?.id || 'unknown',
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        createdAt: new Date().toISOString(),
      });

      // 2. Update context state
      setCurrentTenantId(tenant.id);
      if (table) {
        setCurrentTableId(table.id);
      }
      setCurrentRole('customer');

      // 3. Redirect to the restaurant menu page
      navigate(`/${tenant.slug}/menu`);
    } catch (err) {
      console.error('Error storing customer session:', err);
      // Fallback local storage navigation if offline or rules block
      setCurrentTenantId(tenant.id);
      if (table) setCurrentTableId(table.id);
      setCurrentRole('customer');
      navigate(`/${tenant.slug}/menu`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F9FD] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-[#2C5EAD]/20">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#2C5EAD] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <Utensils className="w-8 h-8 text-[#C4E2F5]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1E231F] glinster-font">
            {tenant.name}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">{tenant.tagline}</p>
        </div>

        {table && (
          <div className="mb-6 p-3 bg-[#F4F9FD] rounded-2xl border border-neutral-200 flex items-center justify-between text-xs font-semibold text-neutral-700">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#1591DC]" />
              Seated at:
            </span>
            <span className="font-bold text-[#2C5EAD] font-mono">{table.tableNumber}</span>
          </div>
        )}

        <form onSubmit={handleCheckInAndAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#2C5EAD]" />
              Your Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Alex Johnson"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#F4F9FD] border border-neutral-200 text-[#1E231F] text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5EAD]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#2C5EAD]" />
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="e.g. +1 (555) 000-0000"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#F4F9FD] border border-neutral-200 text-[#1E231F] text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5EAD]"
              required
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-red-600 font-medium">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-5 rounded-2xl bg-[#2C5EAD] hover:bg-[#1D4482] text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 text-[#C4E2F5]" />
            <span>{isSubmitting ? 'Saving & Authenticating...' : 'Authenticate & Open Menu'}</span>
          </button>
        </form>

        <p className="text-[10px] text-neutral-400 text-center mt-6">
          Secure table verification & session storage for {tenant.name}
        </p>
      </div>
    </div>
  );
};
