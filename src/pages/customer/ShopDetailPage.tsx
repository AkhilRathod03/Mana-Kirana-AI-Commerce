import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Store,
  MapPin,
  Clock,
  PhoneCall,
  ShoppingBag,
  Plus,
  Minus,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { storage } from '../../services/storageService';
import { InventoryItem } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const ShopDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const shop = storage.getShopById(id || 'shop-1');
  const inventory = storage.getInventory(shop?.id);
  const { t, language } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [basket, setBasket] = useState<Record<string, number>>({});
  const [showCallModal, setShowCallModal] = useState(false);

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Shop not found.</p>
          <Link to="/shops" className="text-emerald-600 font-bold text-sm">
            ← {t('nearbyShops')}
          </Link>
        </div>
      </div>
    );
  }

  const categories = ['All', ...Array.from(new Set(inventory.map((i) => i.category)))];

  const filteredInventory =
    selectedCategory === 'All'
      ? inventory
      : inventory.filter((item) => item.category === selectedCategory);

  const updateBasketQty = (item: InventoryItem, delta: number) => {
    setBasket((prev) => {
      const current = prev[item.id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      }
      return { ...prev, [item.id]: next };
    });
  };

  const basketItems = Object.entries(basket)
    .map(([itemId, qty]) => {
      const item = inventory.find((i) => i.id === itemId);
      return item
        ? {
            product: item,
            requestedQuantity: qty,
            unitPrice: item.price,
            itemTotal: item.price * qty,
            availableQuantity: item.quantity,
            isSufficient: item.quantity >= qty,
          }
        : null;
    })
    .filter(Boolean);

  const basketSubtotal = basketItems.reduce((acc, it) => acc + (it?.itemTotal || 0), 0);
  const basketItemCount = basketItems.reduce((acc, it) => acc + (it?.requestedQuantity || 0), 0);

  const handleProceedToCheckout = () => {
    if (basketItems.length === 0) return;
    navigate(`/checkout/${shop.id}`, {
      state: {
        shop,
        items: basketItems,
        totalBasketPrice: basketSubtotal,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Local Shop Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-44 sm:h-52 bg-slate-800 relative">
            <img
              src={shop.avatarUrl}
              alt={shop.name}
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-black text-slate-800 flex items-center gap-1">
                ★ {shop.rating} ({shop.reviewCount})
              </span>
              {shop.isVerified && (
                <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>

            <div className="absolute bottom-4 left-4 right-4 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-3xl font-black tracking-tight">{shop.name}</h1>
                <p className="text-xs sm:text-sm text-slate-200 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>{shop.address} • <strong>{shop.distanceKm} km</strong></span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                  ● Open ({shop.openingHours})
                </span>
              </div>
            </div>
          </div>

          {/* Shop Meta Details */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4 text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Shopkeeper</span>
                <span className="font-bold text-slate-900">{shop.ownerName}</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Fulfillment</span>
                <span className="font-bold text-slate-900">
                  {shop.isDeliveryAvailable ? t('deliveryAvailable') : t('pickupOnly')}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowCallModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-slate-200 hover:bg-slate-100 bg-white text-slate-800 text-xs font-bold transition"
            >
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <span>{t('callButton')}</span>
            </button>
          </div>
        </div>

        {/* INVENTORY / CATALOG */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {language === 'te' ? 'దుకాణంలోని సరుకులు & ధరలు' : language === 'hi' ? 'दुकान का सामान और दाम' : 'Store Products & Shelf Stock'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'te' ? 'స్పష్టమైన చిల్లర ధరలు మరియు ప్రస్తుత నిల్వ' : language === 'hi' ? 'दुकान के वास्तविक दाम और उपलब्धता' : 'Transparent retail prices and current shelf stock.'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredInventory.map((item) => {
              const qtyInBasket = basket[item.id] || 0;
              const isOutOfStock = item.status === 'out_of_stock' || item.quantity <= 0;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl p-4 border transition flex flex-col justify-between ${
                    isOutOfStock
                      ? 'border-slate-200 opacity-60'
                      : 'border-slate-200 hover:border-emerald-400 hover:shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {item.category}
                      </span>
                      {isOutOfStock ? (
                        <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                          {t('outOfStock')}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {t('inStock')} ({item.quantity})
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm leading-snug">
                      {item.productName}
                    </h4>
                    {item.brand && (
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.brand}</p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-base font-black text-slate-900">₹{item.price}</span>
                      <span className="text-[11px] text-slate-400 ml-1">/{item.unit}</span>
                    </div>

                    {/* Basket Controls */}
                    {isOutOfStock ? (
                      <span className="text-xs text-slate-400 italic">Unavailable</span>
                    ) : qtyInBasket > 0 ? (
                      <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 rounded-xl p-0.5">
                        <button
                          onClick={() => updateBasketQty(item, -1)}
                          className="w-7 h-7 flex items-center justify-center text-emerald-800 hover:bg-emerald-200/60 rounded-lg transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-black text-xs text-emerald-950">
                          {qtyInBasket}
                        </span>
                        <button
                          onClick={() => updateBasketQty(item, 1)}
                          className="w-7 h-7 flex items-center justify-center text-emerald-800 hover:bg-emerald-200/60 rounded-lg transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => updateBasketQty(item, 1)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Basket Action Bar */}
        {basketItemCount > 0 && (
          <div className="fixed bottom-6 left-4 right-4 z-30 max-w-xl mx-auto bg-slate-900 text-white rounded-3xl p-4 shadow-2xl flex items-center justify-between border border-slate-700 animate-slideUp">
            <div>
              <span className="text-xs text-emerald-400 font-bold block">
                {basketItemCount} items selected
              </span>
              <span className="text-base font-black text-white">Total: ₹{basketSubtotal}</span>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 transition shadow-md"
            >
              <span>{t('orderButton')}</span>
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Call Modal */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">{shop.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              {shop.ownerName} • {shop.locality}
            </p>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-base font-black text-slate-800 mb-5">
              {shop.phone}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCallModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
              >
                Close
              </button>
              <a
                href={`tel:${shop.phone}`}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" /> Call Store
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
