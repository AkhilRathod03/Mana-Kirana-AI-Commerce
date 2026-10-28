import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Package,
  Store,
  PhoneCall,
  MapPin,
  Truck,
  Building,
  RotateCw,
  LayoutDashboard,
} from 'lucide-react';
import { storage } from '../../services/storageService';
import { Order, OrderStatus } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const OrderStatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | undefined>(() => storage.getOrderById(id || ''));
  const { t, language } = useLanguage();

  useEffect(() => {
    const refresh = () => {
      setOrder(storage.getOrderById(id || ''));
    };
    refresh();
    const unsub = storage.subscribe(refresh);
    return () => unsub();
  }, [id]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-3xl border border-slate-200 max-w-sm">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-base">Order Not Found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Could not locate order #{id}.
          </p>
          <Link
            to="/orders"
            className="inline-flex px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
          >
            {t('myOrders')}
          </Link>
        </div>
      </div>
    );
  }

  const shop = storage.getShopById(order.shopId);

  const statusSteps: { key: OrderStatus; label: string; desc: string }[] = [
    {
      key: 'request_sent',
      label: t('stepSent'),
      desc: language === 'te' ? 'షాపుకి చేరింది' : language === 'hi' ? 'दुकानदार के पास गया' : 'Notified to store',
    },
    {
      key: 'shop_accepted',
      label: t('stepAccepted'),
      desc: language === 'te' ? 'సరుకు ఉంది' : language === 'hi' ? 'सामान उपलब्ध है' : 'Store confirmed',
    },
    {
      key: 'preparing',
      label: t('stepPreparing'),
      desc: language === 'te' ? 'సంచిలో సర్దుతున్నారు' : language === 'hi' ? 'थैले में पैक हो रहा है' : 'Packaging',
    },
    {
      key: 'ready',
      label: t('stepReady'),
      desc: language === 'te' ? 'తీసుకోవచ్చు' : language === 'hi' ? 'लेने आएं / रवाना' : 'Ready',
    },
    {
      key: 'completed',
      label: t('stepCompleted'),
      desc: language === 'te' ? 'సరుకు ముట్టింది' : language === 'hi' ? 'मिल गया' : 'Delivered',
    },
  ];

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'rejected') return -1;
    return statusSteps.findIndex((s) => s.key === status);
  };

  const currentStepIndex = getStepIndex(order.status);

  const handleSimulateNextStatus = () => {
    const nextStatuses: OrderStatus[] = [
      'request_sent',
      'shop_accepted',
      'preparing',
      'ready',
      'completed',
    ];
    const currentIndex = nextStatuses.indexOf(order.status);
    if (currentIndex < nextStatuses.length - 1) {
      const next = nextStatuses[currentIndex + 1];
      storage.updateOrderStatus(order.id, next);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                {t('orderTracking')}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                Order #{order.orderNumber}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {order.shopName} • {order.createdAt}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                Time Estimate
              </span>
              <span className="text-base font-black text-emerald-700">
                {order.estimatedTime}
              </span>
            </div>
          </div>

          {/* ORDER STATUS PROGRESSION */}
          <div className="py-8">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {statusSteps.map((step, idx) => {
                const isDone = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div
                    key={step.key}
                    className="flex sm:flex-col items-center sm:items-center text-left sm:text-center gap-3 sm:gap-2 relative"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isDone
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : isCurrent
                          ? 'bg-emerald-500 text-white ring-4 ring-emerald-100 shadow-md animate-pulse'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>

                    <div>
                      <div
                        className={`text-xs font-bold ${
                          isCurrent
                            ? 'text-emerald-950 font-black'
                            : isDone
                            ? 'text-slate-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </div>
                      <p className="text-[10px] text-slate-400 sm:max-w-[100px] leading-tight mt-0.5">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Progression Helper */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-600 font-medium">
              {t('advanceStatusSim')}:
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {order.status !== 'completed' && (
                <button
                  onClick={handleSimulateNextStatus}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-sm"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Update Next Status</span>
                </button>
              )}

              <Link
                to="/shopkeeper/orders"
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 transition"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('shopkeeperMode')}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Order Items & Store Contact Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">{t('yourItems')}</h3>
            <div className="space-y-2 text-xs divide-y divide-slate-100">
              {order.items.map((it, idx) => (
                <div key={idx} className="pt-2 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-800">{it.productName}</span>
                    <span className="text-slate-400 block text-[11px]">
                      {it.quantity} {it.unit || 'unit'} × ₹{it.unitPrice}
                    </span>
                  </div>
                  <span className="font-black text-slate-900">₹{it.totalPrice}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{order.deliveryFee > 0 ? `₹${order.deliveryFee}` : 'Free'}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-black text-slate-900">
                <span>Total Amount Due</span>
                <span className="text-emerald-700 font-black">₹{order.total}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Store & Delivery Details</h3>

            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <Store className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">{order.shopName}</span>
                  <p className="text-slate-500 mt-0.5">{shop?.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                {order.orderType === 'delivery' ? (
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <Building className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold text-slate-800">
                    {order.orderType === 'delivery' ? t('homeDelivery') : t('storePickup')}
                  </span>
                  {order.deliveryAddress && (
                    <p className="text-slate-500 mt-0.5">{order.deliveryAddress}</p>
                  )}
                </div>
              </div>
            </div>

            {shop?.phone && (
              <a
                href={`tel:${shop.phone}`}
                className="w-full py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span>Call Store ({shop.phone})</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
