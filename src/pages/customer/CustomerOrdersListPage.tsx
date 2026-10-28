import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PackageCheck, Clock, Store, ArrowRight, ShoppingBag } from 'lucide-react';
import { storage } from '../../services/storageService';
import { Order } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const CustomerOrdersListPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(storage.getOrders());
  const { t, language } = useLanguage();

  useEffect(() => {
    const refresh = () => setOrders(storage.getOrders());
    const unsub = storage.subscribe(refresh);
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">{t('myOrders')}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'te'
                ? 'మీరు ఆర్డర్ చేసిన సరుకులు మరియు డెలివరీ స్థితి.'
                : language === 'hi'
                ? 'आपके ऑर्डर और डिलीवरी का स्टेटस।'
                : 'Track active requests and past orders from nearby local shops.'}
            </p>
          </div>
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition shadow-sm"
          >
            <span>{t('findProducts')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-base">
              {language === 'te' ? 'ఇంకా ఎలాంటి ఆర్డర్లు లేవు' : language === 'hi' ? 'अभी कोई ऑर्डर नहीं है' : 'No Orders Yet'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              {language === 'te'
                ? 'మీకు కావాల్సిన సరుకులు చెప్పి సమీప దుకాణం నుండి ఆర్డర్ చేయండి!'
                : language === 'hi'
                ? 'सामान बोलकर खोजें और पास की दुकान से ऑर्डर करें!'
                : 'Find what you need and place your first local store order!'}
            </p>
            <Link
              to="/search"
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs"
            >
              {t('findProducts')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isCompleted = order.status === 'completed';
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-base">
                        #{order.orderNumber}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                          order.status === 'completed'
                            ? 'bg-slate-100 text-slate-700'
                            : order.status === 'ready'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        ● {order.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400">• {order.createdAt}</span>
                    </div>

                    <div className="text-xs text-slate-600 flex items-center gap-2">
                      <Store className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-slate-800">{order.shopName}</span>
                      <span>({order.orderType === 'delivery' ? t('homeDelivery') : t('storePickup')})</span>
                    </div>

                    <p className="text-xs text-slate-500 pt-1">
                      {order.items.map((i) => `${i.productName} (${i.quantity}x)`).join(', ')}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Total</span>
                      <span className="text-base font-black text-emerald-700">₹{order.total}</span>
                    </div>
                    <Link
                      to={`/order-status/${order.id}`}
                      className="px-4 py-2 rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs transition"
                    >
                      {t('orderTracking')} →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
