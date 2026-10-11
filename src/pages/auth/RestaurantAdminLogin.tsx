import React from 'react';
import { useNavigate } from 'react-router-dom';

export const RestaurantAdminLogin: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF8F2] p-4">
      <div className="w-full max-w-sm p-8 bg-white rounded-2xl border border-neutral-200 shadow-xl space-y-6">
        <h1 className="text-2xl font-bold text-center text-[#1E231F]">Login to Restaurant Admin</h1>
        <p className="text-sm text-neutral-500 text-center">
          Please authenticate to manage your restaurant portal.
        </p>
        <button
          onClick={() => navigate('/onboarding')}
          className="w-full py-3 px-4 bg-[#30673A] text-white rounded-xl font-bold hover:bg-[#204828] transition-colors"
        >
          Go to Authentication
        </button>
      </div>
    </div>
  );
};
