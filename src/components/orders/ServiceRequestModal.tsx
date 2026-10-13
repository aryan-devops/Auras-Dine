import React, { useState } from 'react';
import { Bell, Droplets, Receipt, Sparkles, AlertCircle, X, CheckCircle } from 'lucide-react';
import { ServiceRequestType } from '../../types';
import { useRestaurant } from '../../context/RestaurantContext';

interface ServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceRequested?: (purpose: string) => void;
}

const REQUEST_TYPES: {
  type: ServiceRequestType;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}[] = [
  {
    type: 'waiter',
    label: 'Call Waiter',
    description: 'Ask for table assistance or menu questions',
    icon: Bell,
    color: 'bg-[#07543a] text-white',
  },
  {
    type: 'water',
    label: 'Water Refill',
    description: 'Request fresh chilled or sparkling water',
    icon: Droplets,
    color: 'bg-[#0a7350] text-white',
  },
  {
    type: 'bill',
    label: 'Request the Bill',
    description: 'Ready to settle payment via card or cash',
    icon: Receipt,
    color: 'bg-[#07543a] text-white',
  },
  {
    type: 'clean',
    label: 'Clear Table / Cutlery',
    description: 'Request table tidying or extra forks/spoons',
    icon: Sparkles,
    color: 'bg-[#041c14] text-white',
  },
  {
    type: 'urgent',
    label: 'Urgent Staff Attention',
    description: 'Immediate dietary concern or spill cleanup',
    icon: AlertCircle,
    color: 'bg-[#DC2626] text-white',
  },
];

export const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({
  isOpen,
  onClose,
  onServiceRequested,
}) => {
  const { currentTenant, currentTable, requestService } = useRestaurant();
  const [selectedType, setSelectedType] = useState<ServiceRequestType>('waiter');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await requestService(selectedType, note.trim() || undefined);
      setSubmitted(true);
      if (onServiceRequested) {
        onServiceRequested(selectedMeta?.label || 'Table Assistance');
      }
      setTimeout(() => {
        setSubmitted(false);
        setNote('');
        onClose();
      }, 1800);
    } catch {
      // Handled
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectType = (type: ServiceRequestType) => {
    setSelectedType(type);
  };

  const selectedMeta = REQUEST_TYPES.find((r) => r.type === selectedType);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-request-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 pb-8 sm:pb-6 shadow-2xl border border-[#07543a]/15 overflow-hidden max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-[#E6F2ED] text-[#07543a] flex items-center justify-center mx-auto animate-bounce border border-[#C2DFD4]">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#0D1914] glinster-font">
              Waiter Alerted Instantly!
            </h3>
            <p className="text-xs text-neutral-600 font-medium">
              Your calling bell for <strong className="text-[#07543a]">{selectedMeta?.label}</strong> has been transmitted directly to the floor server terminal for <strong className="text-[#07543a]">{currentTable?.tableNumber || 'your table'}</strong>.
            </p>
            {note.trim() && (
              <p className="text-[11px] text-neutral-500 italic bg-[#F4F8F6] p-2 rounded-xl border border-neutral-200">
                &quot;{note.trim()}&quot;
              </p>
            )}
            <p className="text-[10.5px] text-neutral-400">
              A staff member is on their way to assist you shortly.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <span className="text-[11px] font-bold text-[#07543a] uppercase tracking-wider">
                Tableside Service
              </span>
              <h2
                id="service-request-title"
                className="text-lg font-bold text-[#0D1914] glinster-font"
              >
                Request Staff Assistance
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Paging floor team at {currentTenant.name} ({currentTable?.tableNumber || 'Table Session'})
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                {REQUEST_TYPES.map((req) => {
                  const Icon = req.icon;
                  const isSelected = selectedType === req.type;
                  return (
                    <button
                      key={req.type}
                      type="button"
                      onClick={() => handleSelectType(req.type)}
                      className={`w-full p-3 rounded-xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#07543a] bg-[#E6F2ED]/60 shadow-xs ring-1 ring-[#07543a]'
                          : 'border-neutral-200 hover:border-neutral-300 bg-[#F4F8F6]'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? req.color : 'bg-neutral-200 text-neutral-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0D1914]">{req.label}</div>
                        <div className="text-[11px] text-neutral-500 leading-tight">
                          {req.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0D1914] mb-1">
                  Optional Note for Server
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    selectedType === 'bill'
                      ? 'e.g. Card machine, cash, or split bill'
                      : selectedType === 'water'
                      ? 'e.g. Chilled water or sparkling refill'
                      : selectedType === 'waiter'
                      ? 'e.g. Extra napkins, cutlery, or questions'
                      : selectedType === 'clean'
                      ? 'e.g. Clear empty plates or fresh spoons'
                      : 'e.g. Urgent assistance required'
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-[#F4F8F6] focus:outline-none focus:ring-1 focus:ring-[#07543a]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-full bg-[#07543a] hover:bg-[#053d2a] text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Bell className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-bounce' : ''}`} />
                <span>{isSubmitting ? 'Paging Floor Waiter...' : 'Ring Waiter Bell'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
