import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Building2,
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Clock,
  Sparkles,
  ChefHat,
  UtensilsCrossed,
  KeyRound,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { AuraDineLogo } from '../../components/common/AuraDineLogo';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;
const LOCKOUT_KEY = 'aurasdine_auth_lockout_until';
const ATTEMPTS_KEY = 'aurasdine_auth_failed_attempts';

export const RestaurantAdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tenants, loginStaff, currentStaffUser } = useRestaurant();

  const [restaurantName, setRestaurantName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  // Rate Limiting & Lockout State
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    const saved = localStorage.getItem(ATTEMPTS_KEY);
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  // Check lockout on mount and tick countdown
  useEffect(() => {
    const checkLockout = () => {
      const lockoutUntil = localStorage.getItem(LOCKOUT_KEY);
      if (lockoutUntil) {
        const remaining = Math.ceil((parseInt(lockoutUntil, 10) - Date.now()) / 1000);
        if (remaining > 0) {
          setLockoutRemaining(remaining);
        } else {
          setLockoutRemaining(0);
          localStorage.removeItem(LOCKOUT_KEY);
          localStorage.setItem(ATTEMPTS_KEY, '0');
          setFailedAttempts(0);
        }
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  // Pre-fill hotel name from query params if available (?hotel=... or ?tenant=...)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hotelParam = params.get('hotel') || params.get('tenant') || params.get('restaurant');
    if (hotelParam) {
      const match = tenants.find(
        (t) =>
          t.name.toLowerCase() === hotelParam.toLowerCase() ||
          t.slug.toLowerCase() === hotelParam.toLowerCase()
      );
      if (match) {
        setRestaurantName(match.name);
      } else {
        setRestaurantName(hotelParam);
      }
    }
  }, [location.search, tenants]);

  // Detected hotel match indicator
  const matchedTenantPreview = tenants.find((t) => {
    const q = restaurantName.trim().toLowerCase();
    if (!q) return false;
    const name = t.name.toLowerCase();
    const slug = t.slug.toLowerCase();
    const normName = name.replace(/[^a-z0-9]/g, '');
    const normSlug = slug.replace(/[^a-z0-9]/g, '');
    const normQuery = q.replace(/[^a-z0-9]/g, '');
    return name === q || slug === q || normName === normQuery || normSlug === normQuery;
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemaining > 0) return;

    setErrorMessage('');
    setIsLoading(true);

    try {
      const result = await loginStaff(restaurantName, username, password);

      if (!result.success) {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        localStorage.setItem(ATTEMPTS_KEY, String(newAttempts));

        if (newAttempts >= MAX_FAILED_ATTEMPTS) {
          const lockoutUntil = Date.now() + LOCKOUT_SECONDS * 1000;
          localStorage.setItem(LOCKOUT_KEY, String(lockoutUntil));
          setLockoutRemaining(LOCKOUT_SECONDS);
          setErrorMessage(
            `Security Lockout: Too many failed login attempts (${MAX_FAILED_ATTEMPTS}). For system safety, access is locked for ${LOCKOUT_SECONDS} seconds.`
          );
        } else {
          setErrorMessage(
            `${result.error || 'Login failed.'} (${MAX_FAILED_ATTEMPTS - newAttempts} attempt${
              MAX_FAILED_ATTEMPTS - newAttempts === 1 ? '' : 's'
            } remaining before security lockout)`
          );
        }
        setIsLoading(false);
        return;
      }

      // Reset failed attempts on success
      setFailedAttempts(0);
      localStorage.setItem(ATTEMPTS_KEY, '0');
      localStorage.removeItem(LOCKOUT_KEY);

      // Route based on authenticated role
      const staff = result.staff;
      if (staff?.role === 'waiter') {
        navigate('/waiter');
      } else if (staff?.role === 'kitchen') {
        navigate('/kitchen');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      console.error('Authentication Error:', err);
      setErrorMessage('A network or server error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (hotel: string, user: string, pass: string) => {
    setRestaurantName(hotel);
    setUsername(user);
    setPassword(pass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#F4F8F6] flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-[#07543a] selection:text-white">
      <div className="w-full max-w-md space-y-4">
        {/* Branding Header with AuraDine Brand POV */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <AuraDineLogo size="lg" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#07543a] text-xs font-bold tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-[#07543a]" />
            <span>High-Security Staff Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#151815] glinster-font tracking-tight">
            Hospitality Staff Portal
          </h1>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Authorized access for Floor Waiters, Kitchen Chefs, and Restaurant Managers.
          </p>
        </div>

        {/* Lockout Warning Banner */}
        {lockoutRemaining > 0 && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 animate-in fade-in">
            <Clock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-spin" />
            <div>
              <p className="font-bold text-rose-900">Security Cooldown Active</p>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Maximum attempt threshold exceeded. Gateway locked for{' '}
                <span className="font-mono font-bold text-rose-900">{lockoutRemaining}s</span> to
                prevent unauthorized access.
              </p>
            </div>
          </div>
        )}

        {/* Error Alert Banner */}
        {errorMessage && lockoutRemaining === 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="flex-1 text-[11px] font-medium leading-relaxed">
              {errorMessage}
            </div>
          </div>
        )}

        {/* Main Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 shadow-xl shadow-black/5 space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Input 1: Hotel Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#151815] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#07543a]" />
                  <span>Hotel / Restaurant Name *</span>
                </label>
                {matchedTenantPreview && (
                  <span className="text-[10px] font-bold text-[#07543a] bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#07543a]" />
                    Verified
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. The Green Table or Urban Grill House"
                  value={restaurantName}
                  onChange={(e) => {
                    setRestaurantName(e.target.value);
                    setErrorMessage('');
                  }}
                  disabled={lockoutRemaining > 0}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#F4F8F6] border border-[#C2DFD4] text-[#151815] placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#07543a]/20 focus:border-[#07543a] disabled:opacity-50 transition-all font-medium"
                  required
                />
              </div>
              <p className="text-[10px] text-neutral-400 mt-1">
                Enter your assigned hotel name. Staff accounts are isolated per restaurant.
              </p>
            </div>

            {/* Input 2: Staff User ID */}
            <div>
              <label className="text-xs font-bold text-[#151815] flex items-center gap-1.5 mb-1.5">
                <User className="w-3.5 h-3.5 text-[#07543a]" />
                <span>Staff User ID / Username *</span>
              </label>
              <input
                type="text"
                placeholder="e.g. david.server or marco.chef"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrorMessage('');
                }}
                disabled={lockoutRemaining > 0}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-[#F4F8F6] border border-[#C2DFD4] text-[#151815] placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#07543a]/20 focus:border-[#07543a] disabled:opacity-50 transition-all"
                required
              />
            </div>

            {/* Input 3: Security Password */}
            <div>
              <label className="text-xs font-bold text-[#151815] flex items-center gap-1.5 mb-1.5">
                <Lock className="w-3.5 h-3.5 text-[#07543a]" />
                <span>Security Password *</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your security password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage('');
                  }}
                  disabled={lockoutRemaining > 0}
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl bg-[#F4F8F6] border border-[#C2DFD4] text-[#151815] placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#07543a]/20 focus:border-[#07543a] disabled:opacity-50 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer p-0.5"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Security Notice badge */}
            <div className="pt-1 flex items-center justify-between text-[11px] text-neutral-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0a7350]" />
                Cross-hotel isolated
              </span>
              <span>Rate limit protected</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || lockoutRemaining > 0}
              className="w-full py-3 px-4 bg-[#07543a] hover:bg-[#053d2a] active:scale-98 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : lockoutRemaining > 0 ? (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Locked ({lockoutRemaining}s)</span>
                </>
              ) : (
                <>
                  <span>Sign In to Restaurant Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div className="pt-2 border-t border-neutral-100 space-y-2">
            <button
              type="button"
              onClick={() => setShowDemoCredentials(!showDemoCredentials)}
              className="w-full flex items-center justify-between text-[11px] font-bold text-neutral-500 hover:text-[#07543a] transition-colors cursor-pointer py-1"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0a7350]" />
                <span>Quick Demo Accounts (Click to Fill)</span>
              </span>
              <span className="text-[10px] text-neutral-400">
                {showDemoCredentials ? 'Hide' : 'Show Demo Staff'}
              </span>
            </button>

            {showDemoCredentials && (
              <div className="space-y-2 animate-in fade-in pt-1">
                <p className="text-[10px] text-neutral-400 leading-tight">
                  Click any demo account to test hotel isolation and role-based routing:
                </p>

                {/* Hotel 1: The Green Table */}
                <div className="p-2.5 rounded-xl bg-[#E6F2ED] border border-[#C2DFD4] space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#07543a]">
                    The Green Table
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        fillCredentials('The Green Table', 'david.server', 'password123')
                      }
                      className="p-1.5 bg-white rounded-lg border border-neutral-200/60 hover:border-[#07543a] text-left text-[11px] cursor-pointer transition-all hover:shadow-2xs"
                    >
                      <div className="font-bold text-[#151815] flex items-center gap-1">
                        <UtensilsCrossed className="w-2.5 h-2.5 text-[#07543a]" />
                        <span>David Miller</span>
                      </div>
                      <div className="text-[9px] text-neutral-400 font-mono">
                        david.server (Waiter)
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        fillCredentials('The Green Table', 'marco.chef', 'password123')
                      }
                      className="p-1.5 bg-white rounded-lg border border-neutral-200/60 hover:border-[#07543a] text-left text-[11px] cursor-pointer transition-all hover:shadow-2xs"
                    >
                      <div className="font-bold text-[#151815] flex items-center gap-1">
                        <ChefHat className="w-2.5 h-2.5 text-[#07543a]" />
                        <span>Marco Rossi</span>
                      </div>
                      <div className="text-[9px] text-neutral-400 font-mono">
                        marco.chef (Kitchen)
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        fillCredentials('The Green Table', 'priya.waiter', 'password123')
                      }
                      className="p-1.5 bg-white rounded-lg border border-neutral-200/60 hover:border-[#07543a] text-left text-[11px] cursor-pointer transition-all hover:shadow-2xs"
                    >
                      <div className="font-bold text-[#151815] flex items-center gap-1">
                        <UtensilsCrossed className="w-2.5 h-2.5 text-[#07543a]" />
                        <span>Priya Sharma</span>
                      </div>
                      <div className="text-[9px] text-neutral-400 font-mono">
                        priya.waiter (Waiter)
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        fillCredentials('The Green Table', 'admin.greentable', 'password123')
                      }
                      className="p-1.5 bg-white rounded-lg border border-neutral-200/60 hover:border-[#07543a] text-left text-[11px] cursor-pointer transition-all hover:shadow-2xs"
                    >
                      <div className="font-bold text-[#151815] flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5 text-[#07543a]" />
                        <span>Julian Hayes</span>
                      </div>
                      <div className="text-[9px] text-neutral-400 font-mono">
                        admin.greentable (Admin)
                      </div>
                    </button>
                  </div>
                </div>

                {/* Hotel 2: Urban Grill House */}
                <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-neutral-200/80 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    Urban Grill House
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        fillCredentials('Urban Grill House', 'sam.server', 'password123')
                      }
                      className="p-1.5 bg-white rounded-lg border border-neutral-200/60 hover:border-amber-700 text-left text-[11px] cursor-pointer transition-all hover:shadow-2xs"
                    >
                      <div className="font-bold text-[#151815] flex items-center gap-1">
                        <UtensilsCrossed className="w-2.5 h-2.5 text-amber-700" />
                        <span>Sam Cooper</span>
                      </div>
                      <div className="text-[9px] text-neutral-400 font-mono">
                        sam.server (Waiter)
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        fillCredentials('Urban Grill House', 'jack.pitmaster', 'password123')
                      }
                      className="p-1.5 bg-white rounded-lg border border-neutral-200/60 hover:border-amber-700 text-left text-[11px] cursor-pointer transition-all hover:shadow-2xs"
                    >
                      <div className="font-bold text-[#151815] flex items-center gap-1">
                        <ChefHat className="w-2.5 h-2.5 text-amber-700" />
                        <span>Jack Daniels</span>
                      </div>
                      <div className="text-[9px] text-neutral-400 font-mono">
                        jack.pitmaster (Kitchen)
                      </div>
                    </button>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-neutral-100 text-[10px] text-neutral-500 leading-normal">
                  <span className="font-bold">Test Isolation:</span> Select "Urban Grill House" as
                  hotel, but enter "david.server" (who belongs to The Green Table). The system will
                  strictly reject the login with <em>"User ID or password is incorrect."</em>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <button
            onClick={() => navigate('/customer')}
            className="text-xs text-neutral-500 hover:text-neutral-900 underline transition-colors cursor-pointer"
          >
            ← Return to Customer Menu
          </button>
        </div>
      </div>
    </div>
  );
};
