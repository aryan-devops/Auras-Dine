import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { auth, db } from '../../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export const OnboardingFlow: React.FC = () => {
  const { setCurrentRole, currentTenantId, setCurrentTableId } = useRestaurant();
  const [step, setStep] = useState<'auth' | 'otp' | 'profile' | 'table'>('auth');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [tableNumber, setTableNumber] = useState('');

  useEffect(() => {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
    });
  }, []);

  const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setStep('profile');
    } catch (error) {
      console.error('Google Auth Error:', error);
    }
  };

  const handleSendOtp = async () => {
    try {
      const result = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      setConfirmationResult(result);
      setStep('otp');
    } catch (error) {
      console.error('Phone Auth Error:', error);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await confirmationResult?.confirm(otp);
      alert('Verified!');
      setStep('profile');
    } catch (error) {
      console.error('OTP Verification Error:', error);
    }
  };

  const handleSubmitTable = async () => {
    if (!currentTenantId) return;
    const tableRef = doc(db, 'restaurants', currentTenantId, 'tables', tableNumber);
    const tableSnap = await getDoc(tableRef);
    
    if (tableSnap.exists() && tableSnap.data().status === 'available') {
      await updateDoc(tableRef, { status: 'occupied', occupiedBy: auth.currentUser?.uid });
      // NEW: Set table in context
      setCurrentTableId(tableNumber); 
      setCurrentRole('customer');
    } else {
      alert('Table not available or does not exist');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#FAF8F2]">
      <div id="recaptcha-container"></div>
      
      {step === 'auth' && (
        <div className="w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-center">Welcome</h1>
          <button className="w-full py-2 px-4 border border-neutral-300 rounded-lg hover:bg-neutral-100" onClick={handleGoogleAuth}>Authenticate with Google</button>
          <input 
            className="w-full p-2 border border-neutral-300 rounded-lg"
            placeholder="Phone Number (+1...)" 
            value={phoneNumber} 
            onChange={(e) => setPhoneNumber(e.target.value)} 
          />
          <button className="w-full py-2 px-4 bg-neutral-900 text-white rounded-lg hover:bg-neutral-700" onClick={handleSendOtp}>Get OTP</button>
        </div>
      )}

      {step === 'otp' && (
        <div className="w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-center">Enter OTP</h1>
          <input 
            className="w-full p-2 border border-neutral-300 rounded-lg"
            placeholder="OTP" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value)} 
          />
          <button className="w-full py-2 px-4 bg-neutral-900 text-white rounded-lg hover:bg-neutral-700" onClick={handleVerifyOtp}>Verify OTP</button>
        </div>
      )}
      
      {step === 'profile' && (
        <div className="w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-center">Profile</h1>
          <input className="w-full p-2 border border-neutral-300 rounded-lg" placeholder="Name" />
          <input className="w-full p-2 border border-neutral-300 rounded-lg" defaultValue={phoneNumber} disabled />
          <button className="w-full py-2 px-4 bg-neutral-900 text-white rounded-lg hover:bg-neutral-700" onClick={() => setStep('table')}>Next</button>
        </div>
      )}

      {step === 'table' && (
        <div className="w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-center">Table Selection</h1>
          <input 
            className="w-full p-2 border border-neutral-300 rounded-lg" 
            placeholder="Table Number" 
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
          />
          <button className="w-full py-2 px-4 bg-neutral-900 text-white rounded-lg hover:bg-neutral-700" onClick={handleSubmitTable}>Submit & Enter Menu</button>
        </div>
      )}
    </div>
  );
};
