import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ChefHat,
  Bell,
  Settings,
  LayoutDashboard,
  KeyRound,
  Sparkles,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import { RoleSwitcher } from '../components/common/RoleSwitcher';
import { AuraDineLogo } from '../components/common/AuraDineLogo';

export const Dashboard: React.FC = () => {
  const sections = [
    {
      name: 'Customer Digital Menu',
      description: 'Mobile QR ordering experience for seated diners',
      path: '/customer',
      icon: LayoutDashboard,
      badge: 'Guest View',
      color: 'bg-[#E6F2ED] text-[#07543a] border-[#C2DFD4]',
    },
    {
      name: 'Waiter Calling Bell Terminal',
      description: 'Live table paging, bill requests & food delivery pass',
      path: '/waiter',
      icon: Bell,
      badge: 'Floor Staff',
      color: 'bg-[#E6F2ED] text-[#0a7350] border-[#C2DFD4]',
    },
    {
      name: 'Kitchen Display System (KDS)',
      description: 'Chef ticket queue, cooking timers & dish plating',
      path: '/kitchen',
      icon: ChefHat,
      badge: 'Kitchen Staff',
      color: 'bg-orange-50 text-orange-700 border-orange-200',
    },
    {
      name: 'Staff & Waiter Login Gateway',
      description: 'Secure hotel-scoped credential verification',
      path: '/staff-login',
      icon: KeyRound,
      badge: 'Auth Portal',
      color: 'bg-emerald-50 text-[#07543a] border-emerald-200',
    },
    {
      name: 'Restaurant Admin Dashboard',
      description: 'Menu engineering, live analytics, tables & operations',
      path: '/admin',
      icon: Settings,
      badge: 'Restaurant Manager',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      name: 'Super Admin Multi-Tenant Hub',
      description: 'Tenant billing, SaaS subscriptions & platform governance',
      path: '/superadmin',
      icon: Users,
      badge: 'Platform Owner',
      color: 'bg-neutral-100 text-neutral-800 border-neutral-300',
    },
    {
      name: 'QR Table Stand Studio',
      description: 'Printable acrylic table tents & dedicated table QR codes',
      path: '/qr-stand',
      icon: QrCode,
      badge: 'Print & Setup',
      color: 'bg-teal-50 text-teal-700 border-teal-200',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F8F6] w-full max-w-full overflow-x-hidden">
      <div className="w-full">
        <RoleSwitcher />
      </div>

      <div className="max-w-5xl mx-auto p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/80 shadow-2xs">
          <div>
            <AuraDineLogo size="lg" className="mb-2.5" />
            <h1 className="text-2xl sm:text-3xl font-black text-[#0D1914] glinster-font tracking-tight">
              Operations & Role Launchpad
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              Select a live terminal view or management console to launch.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-[#E6F2ED] text-[#07543a] border border-[#C2DFD4] text-xs font-bold flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#07543a]" />
              Production Suite Ready
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link
                key={section.path}
                to={section.path}
                className="group p-4 sm:p-5 bg-white border border-[#07543a]/15 hover:border-[#07543a]/40 rounded-2xl sm:rounded-3xl shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3 active:scale-[0.99] cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${section.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                      {section.badge}
                    </span>
                  </div>

                  <h2 className="text-sm sm:text-base font-extrabold text-[#151815] group-hover:text-[#07543a] transition-colors leading-snug">
                    {section.name}
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                    {section.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-[#07543a]">
                  <span>Launch Portal</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
