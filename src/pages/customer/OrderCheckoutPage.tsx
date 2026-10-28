import React, { useState } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Store,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Info,
  ArrowLeft,
  Truck,
  Building,
} from 'lucide-react';
import { storage } from '../../services/storageService';
import { Shop, OrderItem, MatchedItem } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const OrderCheckoutPage: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const stateData = location.state as {
    shop?: Shop;
    items?: MatchedItem[];
    totalBasketPrice?: number;
  } | undefined;

  const shop = stateData?.shop || storage.getShopById(shopId || 'shop-1');
  const items: MatchedItem[] = stateData?.items || [];

  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>(
    shop?.isDeliveryAvailable ? 'delivery' : 'pickup'
  );
  const [customerName, setCustomerName] = useState('Akhil Kumar');
  const [customerPhone, setCustomerPhone] = useState('+91 98765 43210');
  const [deliveryAddress, setDeliveryAddress] = useState(
    'Flat 302, Sai Residency, Moghalrajpuram, Vijayawada'
  );
  const [notes, setNotes] = useState('Please pack carefully. Pay on pickup/delivery.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!shop || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-3xl border border-slate-200 max-w-md shadow-sm">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-base mb-1">
            {language === 'te' ? 'సరుకులు ఎంపిక చేయలేదు' : language === 'hi' ? 'कोई सामान नहीं चुना' : 'No Items Selected'}
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            {language === 'te' ? 'దయచేసి సరుకులు వెతకండి లేదా దుకాణం నుండి ఎంచుకోండి.' : language === 'hi' ? 'कृपया पहले सामान खोजें या चुनें।' : 'Please search for products first.'}
          </p>
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
          >
            <span>{t('findProducts')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = items.reduce((acc, it) => acc + it.itemTotal, 0);
  const deliveryFee = orderType === 'delivery' && shop.isDeliveryAvailable ? shop.deliveryFee : 0;
  const finalTotal = subtotal + deliveryFee;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Please provide your name and phone number.');
      return;
    }

    setIsSubmitting(true);

    const orderItems: OrderItem[] = items.map((it) => ({
      productName: it.product.productName,
      quantity: it.requestedQuantity,
      unitPrice: it.unitPrice,
      totalPrice: it.itemTotal,
      isAvailable: true,
      unit: it.product.unit,
    }));

    const newOrder = storage.addOrder({
      shopId: shop.id,
      shopName: shop.name,
      customerName,
      customerPhone,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      orderType,
      items: orderItems,
      subtotal,
      deliveryFee,
      total: finalTotal,
      status: 'request_sent',
      estimatedTime: orderType === 'delivery' ? '20-30 mins' : 'Ready in 10-15 mins',
      notes,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      navigate(`/order-status/${newOrder.id}`);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900">{t('reviewOrder')}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {shop.name} ({shop.locality})
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details Form */}
          <div className="lg:col-span-2 space-y-5">
            {/* Fulfillment Type Toggle */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                {t('fulfillmentType')}
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrderType('pickup')}
                  className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                    orderType === 'pickup'
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Building
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      orderType === 'pickup' ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  />
                  <div>
                    <div className="font-bold text-slate-900 text-xs sm:text-sm">
                      {t('storePickup')}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {t('storePickupDesc')}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={!shop.isDeliveryAvailable}
                  onClick={() => setOrderType('delivery')}
                  className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                    !shop.isDeliveryAvailable
                      ? 'border-slate-200 opacity-50 cursor-not-allowed bg-slate-50'
                      : orderType === 'delivery'
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Truck
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      orderType === 'delivery' ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  />
                  <div>
                    <div className="font-bold text-slate-900 text-xs sm:text-sm">
                      {t('homeDelivery')}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {shop.isDeliveryAvailable ? `+₹${shop.deliveryFee} • ${t('homeDeliveryDesc')}` : 'Not available'}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Customer Contact Details */}
            <form onSubmit={handleSubmitOrder} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">
                {language === 'te' ? 'మీ వివరాలు' : language === 'hi' ? 'आपकी जानकारी' : 'Customer Details'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">{t('fullName')}</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">{t('phoneNumber')}</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {orderType === 'delivery' && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">{t('deliveryAddress')}</label>
                  <textarea
                    rows={2}
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">{t('specialNotes')}</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* PAYMENT NOTICE */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>{t('paymentNotice')}</div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-sm transition shadow-md flex items-center justify-center gap-2"
              >
                <span>
                  {isSubmitting
                    ? '...'
                    : `${t('submitOrderButton')} (₹${finalTotal})`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Basket Summary Card */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">{t('yourItems')}</h3>
                <span className="text-xs text-slate-500">{items.length} items</span>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-800">
                        {it.product.productName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {it.requestedQuantity} × ₹{it.unitPrice}
                      </div>
                    </div>
                    <span className="font-black text-slate-900">₹{it.itemTotal}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="font-bold text-slate-900">
                    {deliveryFee > 0 ? `₹${deliveryFee}` : 'FREE'}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between text-base font-black text-slate-900">
                  <span>Total Due</span>
                  <span className="text-emerald-700">₹{finalTotal}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 p-4 rounded-3xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">{shop.name}</div>
              <p className="text-slate-500">{shop.address}</p>
              <p className="text-slate-600 font-semibold">{shop.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
