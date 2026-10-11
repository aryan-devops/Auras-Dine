import React, { useState, useEffect } from 'react';
import { Utensils, CheckCircle2, X, Hash, MapPin } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';

interface TableAuthorizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthorized?: (tableNumber: string) => void;
}

export const TableAuthorizationModal: React.FC<TableAuthorizationModalProps> = ({
  isOpen,
  onClose,
  onAuthorized,
}) => {
  const {
    currentTenant,
    tables,
    currentTable,
    authorizeTable,
  } = useRestaurant();

  const [inputTableNumber, setInputTableNumber] = useState(
    currentTable?.tableNumber || 'Table 4'
  );
  const [errorMsg, setErrorMsg] = useState('');

  // Update input when table changes
  useEffect(() => {
    if (currentTable) {
      setInputTableNumber(currentTable.tableNumber);
    }
  }, [currentTable]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputTableNumber.trim();
    if (!trimmed) {
      setErrorMsg('Please enter your table or seating number.');
      return;
    }

    const authorized = authorizeTable(trimmed);
    setErrorMsg('');
    onAuthorized?.(authorized.tableNumber);
    onClose();
  };

  const handleSelectPreset = (tableNumber: string) => {
    setInputTableNumber(tableNumber);
    setErrorMsg('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="table-auth-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#FAF8F2] rounded-3xl p-6 shadow-2xl border border-[#30673A]/20 overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/50 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Monogram Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#30673A] text-white flex items-center justify-center mb-4 shadow-md border border-[#E9E9C7]/30">
          <Utensils className="w-7 h-7 text-[#E9E9C7]" />
        </div>

        {/* Heading */}
        <h2 id="table-auth-title" className="text-xl sm:text-2xl font-bold text-[#1E231F] glinster-font">
          Table Authorization
        </h2>
        <p className="text-xs text-neutral-600 mt-1 mb-5 leading-relaxed">
          Welcome to <span className="font-bold text-[#30673A]">{currentTenant.name}</span>. Enter or select your seated table number to authorize digital ordering and kitchen delivery.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Custom Table Input */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-[#E3792F]" />
              Write Your Table Number
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                value={inputTableNumber}
                onChange={(e) => {
                  setInputTableNumber(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="e.g. Table 4, 12, Patio 2, Bar 1..."
                className="w-full px-4 py-3 rounded-xl bg-white border border-[#30673A]/25 text-[#1E231F] font-bold text-base focus:outline-none focus:ring-2 focus:ring-[#30673A] focus:border-transparent shadow-inner"
              />
            </div>
            {errorMsg && (
              <p className="text-xs text-red-600 mt-1.5 font-medium">{errorMsg}</p>
            )}
          </div>

          {/* Quick Select Preset Tables */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#30673A]" />
              Quick Select Available Tables
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {tables.map((t) => {
                const isSelected =
                  inputTableNumber.toLowerCase().trim() === t.tableNumber.toLowerCase().trim();
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectPreset(t.tableNumber)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#30673A] text-white shadow-xs scale-102'
                        : 'bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200/80'
                    }`}
                  >
                    {t.tableNumber}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-5 rounded-xl bg-[#30673A] hover:bg-[#204828] text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Authorize & Start Dining</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
