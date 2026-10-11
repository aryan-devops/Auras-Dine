import React, { useState } from 'react';
import { Bell, Droplets, Receipt, Sparkles, AlertCircle, X, CheckCircle } from 'lucide-react';
import { ServiceRequestType } from '../../types';
import { useRestaurant } from '../../context/RestaurantContext';

interface ServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
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
    color: 'bg-[#30673A] text-white',
  },
  {
    type: 'water',
    label: 'Water Refill',
    description: 'Request fresh chilled or sparkling water',
    icon: Droplets,
    color: 'bg-[#0284C7] text-white',
  },
  {
    type: 'bill',
    label: 'Request the Bill',
    description: 'Ready to settle payment via card or cash',
    icon: Receipt,
    color: 'bg-[#E3792F] text-white',
  },
  {
    type: 'clean',
    label: 'Clear Table / Cutlery',
    description: 'Request table tidying or extra forks/spoons',
    icon: Sparkles,
    color: 'bg-[#8B5CF6] text-white',
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
}) => {
  const { currentTable, currentTenant, createServiceRequest } = useRestaurant();
  const [selectedType, setSelectedType] = useState<ServiceRequestType>('waiter');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createServiceRequest(selectedType, note.trim() || undefined);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-request-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-[#30673A]/15 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#30673A]/10 text-[#30673A] flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#1E231F] glinster-font">
              Staff Alerted!
            </h3>
            <p className="text-xs text-neutral-500">
              A server has been paged to <strong className="text-[#30673A]">{currentTable?.tableNumber || 'your table'}</strong>.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <span className="text-[11px] font-bold text-[#E3792F] uppercase tracking-wider">
                Tableside Service
              </span>
              <h2
                id="service-request-title"
                className="text-lg font-bold text-[#1E231F] glinster-font"
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
                      onClick={() => setSelectedType(req.type)}
                      className={`w-full p-3 rounded-xl border flex items-center gap-3 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#30673A] bg-[#30673A]/5 shadow-xs'
                          : 'border-neutral-200 hover:border-neutral-300 bg-[#FAF8F2]'
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
                        <div className="text-xs font-bold text-[#1E231F]">{req.label}</div>
                        <div className="text-[11px] text-neutral-500 leading-tight">
                          {req.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E231F] mb-1">
                  Optional Note for Server
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. 2 sparkling waters please"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-[#FAF8F2] focus:outline-none focus:ring-1 focus:ring-[#30673A]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-full bg-[#30673A] hover:bg-[#204828] text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                Ring Waiter Bell
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
