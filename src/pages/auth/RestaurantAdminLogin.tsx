import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const RestaurantAdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [restaurantName, setRestaurantName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement credential verification against Firestore staffCredentials
    console.log('Logging in with:', { restaurantName, username, password });
    navigate('/admin');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF8F2] p-4">
      <form onSubmit={handleLogin} className="w-full max-w-sm p-8 bg-white rounded-2xl border border-neutral-200 shadow-xl space-y-4">
        <h1 className="text-2xl font-bold text-center text-[#1E231F]">Restaurant Admin Login</h1>
        <input
          type="text"
          placeholder="Restaurant Name"
          value={restaurantName}
          onChange={(e) => setRestaurantName(e.target.value)}
          className="w-full p-3 rounded-xl border border-neutral-200 bg-[#FAF8F2]"
          required
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 rounded-xl border border-neutral-200 bg-[#FAF8F2]"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-xl border border-neutral-200 bg-[#FAF8F2]"
          required
        />
        <button
          type="submit"
          className="w-full py-3 px-4 bg-[#30673A] text-white rounded-xl font-bold hover:bg-[#204828] transition-colors"
        >
          Login
        </button>
      </form>
    </div>
  );
};
