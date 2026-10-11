import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';

export const LogoutButton: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin-login');
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold cursor-pointer"
    >
      Logout
    </button>
  );
};
