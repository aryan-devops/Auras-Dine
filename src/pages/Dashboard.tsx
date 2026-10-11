import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ChefHat, Bell, Settings, LayoutDashboard } from 'lucide-react';
import { RoleSwitcher } from '../components/common/RoleSwitcher';

export const Dashboard: React.FC = () => {
  const sections = [
    { name: 'Customer View', path: '/customer', icon: LayoutDashboard },
    { name: 'Waiter View', path: '/waiter', icon: Bell },
    { name: 'Kitchen View', path: '/kitchen', icon: ChefHat },
    { name: 'Restaurant Admin', path: '/admin', icon: Settings },
    { name: 'Super Admin', path: '/superadmin', icon: Users },
    { name: 'QR Table Stand', path: '/qr-stand', icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F2] p-8">
      <div className="mb-4">
        <RoleSwitcher />
      </div>
      <h1 className="text-3xl font-bold mb-8 text-[#1E231F]">Aurasdine Production Hub</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section) => (
          <Link
            key={section.path}
            to={section.path}
            className="flex items-center gap-4 p-6 bg-white border border-[#30673A]/20 rounded-lg hover:shadow-md transition-shadow"
          >
            <section.icon className="w-8 h-8 text-[#30673A]" />
            <span className="text-xl font-semibold text-[#1E231F]">{section.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
