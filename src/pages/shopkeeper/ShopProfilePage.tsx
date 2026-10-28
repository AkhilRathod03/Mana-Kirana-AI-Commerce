import React, { useState } from 'react';
import { Store, MapPin, PhoneCall, Clock, Truck, Building, ShieldCheck, Check } from 'lucide-react';
import { storage } from '../../services/storageService';
import { Shop } from '../../types';

export const ShopProfilePage: React.FC = () => {
  const [shop, setShop] = useState<Shop>(
    () => storage.getShopById('shop-1') || storage.getShops()[0]
  );
  const [isSaved, setIsSaved] = useState(false);

  // Form states
  const [name, setName] = useState(shop.name);
  const [ownerName, setOwnerName] = useState(shop.ownerName);
  const [phone, setPhone] = useState(shop.phone);
  const [address, setAddress] = useState(shop.address);
  const [locality, setLocality] = useState(shop.locality);
  const [openingHours, setOpeningHours] = useState(shop.openingHours);
  const [isDeliveryAvailable, setIsDeliveryAvailable] = useState(shop.isDeliveryAvailable);
  const [isPickupAvailable, setIsPickupAvailable] = useState(shop.isPickupAvailable);
  const [deliveryFee, setDeliveryFee] = useState(shop.deliveryFee);
  const [deliveryMinOrder, setDeliveryMinOrder] = useState(shop.deliveryMinOrder);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Shop = {
      ...shop,
      name,
      ownerName,
      phone,
      address,
      locality,
      openingHours,
      isDeliveryAvailable,
      isPickupAvailable,
      deliveryFee: Number(deliveryFee),
      deliveryMinOrder: Number(deliveryMinOrder),
    };

    storage.updateShop(updated);
    setShop(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          Store Profile & Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure how your shop appears to nearby customers and delivery rules.
        </p>
      </div>

      {isSaved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Shop settings successfully saved and updated across local discovery!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 text-xs">
        <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
          Basic Store Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Store Trade Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Owner / Operator Name</label>
            <input
              type="text"
              required
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Store Contact Phone</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Operating Hours</label>
            <input
              type="text"
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Locality / Neighborhood</label>
            <input
              type="text"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Complete Street Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>
        </div>

        <h3 className="font-bold text-slate-900 text-sm pt-4 pb-2 border-b border-slate-100">
          Customer Fulfillment & Delivery Capabilities
        </h3>

        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={isPickupAvailable}
              onChange={(e) => setIsPickupAvailable(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <div>
              <span className="font-bold text-slate-900 block">Allow In-Store Customer Pickup</span>
              <span className="text-slate-400 text-[11px]">
                Customers can order on AI app and pick up ready parcels at your store counter.
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={isDeliveryAvailable}
              onChange={(e) => setIsDeliveryAvailable(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <div>
              <span className="font-bold text-slate-900 block">Enable Local Home Delivery</span>
              <span className="text-slate-400 text-[11px]">
                Your shop boys deliver parcels to nearby neighborhood homes.
              </span>
            </div>
          </label>
        </div>

        {isDeliveryAvailable && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Delivery Charge (₹)</label>
              <input
                type="number"
                min="0"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Minimum Order for Delivery (₹)</label>
              <input
                type="number"
                min="0"
                value={deliveryMinOrder}
                onChange={(e) => setDeliveryMinOrder(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition shadow-sm"
          >
            Save Store Settings
          </button>
        </div>
      </form>
    </div>
  );
};

