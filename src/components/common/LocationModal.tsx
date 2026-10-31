import React, { useState } from 'react';
import { MapPin, X, Check, Navigation } from 'lucide-react';
import { storage } from '../../services/storageService';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LOCALITIES = [
  { name: 'Tara Nagar, Lingampally', landmark: 'Near Rythu Bazaar & Main Road', shopsCount: 6 },
  { name: 'BHEL Township (MIG Colony)', landmark: 'MIG Phase-1 Commercial Complex', shopsCount: 5 },
  { name: 'Lingampally Station Road', landmark: 'Opp. Lingampally MMTS Station', shopsCount: 7 },
  { name: 'BHEL Main Road', landmark: 'Shop #14, BHEL - Lingampally Road', shopsCount: 4 },
  { name: 'Gulmohar Park Colony', landmark: 'Plot 24, Near Gulmohar Park Arch', shopsCount: 5 },
  { name: 'HUDA Colony, Chanda Nagar', landmark: 'Near Vijetha Supermarket', shopsCount: 6 },
  { name: 'BHEL MIG-2', landmark: 'Commercial Complex, Ramachandrapuram', shopsCount: 4 },
  { name: 'Lingampally Market', landmark: 'Opp. Lingampally Bus Stand Road', shopsCount: 5 },
];

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const currentLocation = storage.getLocation();
  const [selected, setSelected] = useState(currentLocation.locality);

  if (!isOpen) return null;

  const handleSelect = (loc: typeof LOCALITIES[0]) => {
    setSelected(loc.name);
    storage.setLocation({
      city: 'Hyderabad',
      locality: loc.name,
      landmark: loc.landmark,
    });
    setTimeout(() => {
      onClose();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Select Your Location</h3>
              <p className="text-xs text-slate-500">Find shops & prices nearest to you</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Area Pill */}
        <div className="p-4 bg-emerald-50/60 border-b border-emerald-100/60 flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Active City: <strong>Hyderabad (Lingampally & BHEL)</strong></span>
          </div>
          <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px] font-medium">
            Active Hub
          </span>
        </div>

        {/* Locality List */}
        <div className="p-4 max-h-[360px] overflow-y-auto space-y-2">
          {LOCALITIES.map((loc) => {
            const isSelected = selected === loc.name;
            return (
              <button
                key={loc.name}
                onClick={() => handleSelect(loc)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950 font-medium shadow-sm'
                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{loc.name}</span>
                    <span className="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {loc.shopsCount} shops
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{loc.landmark}</p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500">
          GPS Geolocation & more cities coming in next release
        </div>
      </div>
    </div>
  );
};

