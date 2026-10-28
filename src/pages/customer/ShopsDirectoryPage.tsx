import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, MapPin, ShieldCheck, ArrowRight, Search } from 'lucide-react';
import { storage } from '../../services/storageService';
import { useLanguage } from '../../context/LanguageContext';

export const ShopsDirectoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('All');
  const shops = storage.getShops();
  const { t, language } = useLanguage();

  const localities = ['All', ...Array.from(new Set(shops.map((s) => s.locality)))];

  const filteredShops = shops.filter((shop) => {
    const matchesSearch =
      shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
      shop.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocality = selectedLocality === 'All' || shop.locality === selectedLocality;
    return matchesSearch && matchesLocality;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {t('nearbyShops')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {language === 'te'
                ? 'మీ పరిసరాల్లోని నమ్మకమైన కిరాణా, జనరల్ మరియు ఎలక్ట్రికల్ దుకాణాలు.'
                : language === 'hi'
                ? 'आपके इलाके की भरोसेमंद किराना और जनरल स्टोर्स।'
                : 'Trusted neighborhood kirana, provision, and hardware stores.'}
            </p>
          </div>

          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-600 text-white font-bold text-xs sm:text-sm hover:bg-emerald-700 transition shadow-sm"
          >
            <span>{t('findProducts')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Search & Locality Filter */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3 shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search store name, item, or owner..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {localities.map((loc) => (
              <button
                key={loc}
                onClick={() => setSelectedLocality(loc)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                  selectedLocality === loc
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Stores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredShops.map((shop) => (
            <div
              key={shop.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="h-36 bg-slate-100 relative">
                  <img
                    src={shop.avatarUrl}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[11px] font-black text-slate-800 flex items-center gap-1 shadow-sm">
                    ★ {shop.rating} ({shop.reviewCount})
                  </div>
                  {shop.isVerified && (
                    <div className="absolute bottom-2.5 left-2.5 bg-emerald-600 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-black text-slate-900 text-base">{shop.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{shop.locality} • <strong>{shop.distanceKm} km</strong></span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">{shop.address}</p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {shop.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/50">
                <span className="text-[11px] text-slate-500 font-bold">
                  {shop.isDeliveryAvailable ? t('deliveryAvailable') : t('pickupOnly')}
                </span>
                <Link
                  to={`/shop/${shop.id}`}
                  className="px-4 py-2 rounded-2xl bg-slate-900 text-white font-bold hover:bg-emerald-600 transition flex items-center gap-1"
                >
                  <span>{t('viewShopButton')}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
