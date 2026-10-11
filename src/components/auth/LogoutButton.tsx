import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { useRestaurant } from '../../context/RestaurantContext';

interface LogoutButtonProps {
  className?: string;
  label?: string;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ className, label = 'Sign Out' }) => {
  const navigate = useNavigate();
  const { logoutStaff } = useRestaurant();

  const handleLogout = async () => {
    try {
      logoutStaff();
      try {
        await signOut(auth);
      } catch (authErr) {
        // Firebase auth might not be signed in during demo mode
      }
      navigate('/staff-login');
    } catch (error) {
      console.error('Logout Error:', error);
      navigate('/staff-login');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={
        className ||
        'py-1.5 px-3 bg-neutral-100 hover:bg-rose-50 text-neutral-700 hover:text-rose-600 border border-neutral-200/80 hover:border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0'
      }
      title="Secure sign out from staff portal"
    >
      <LogOut className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
};
