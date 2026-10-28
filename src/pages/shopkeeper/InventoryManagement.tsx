import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  Check,
  RefreshCw,
  Mic,
} from 'lucide-react';
import { storage } from '../../services/storageService';
import { InventoryItem, ProductCategory } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const InventoryManagement: React.FC = () => {
  const shop = storage.getShopById('shop-1') || storage.getShops()[0];
  const { t, language } = useLanguage();

  const [inventory, setInventory] = useState<InventoryItem[]>(storage.getInventory(shop.id));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Add Product State
  const [addMethod, setAddMethod] = useState<'manual' | 'ai'>('ai');
  const [aiInput, setAiInput] = useState('10 Lux soaps at 20 rupees each');
  const [aiParsedPreview, setAiParsedPreview] = useState<any | null>(null);

  // Manual Form State
  const [manualName, setManualName] = useState('');
  const [manualCategory, setManualCategory] = useState<ProductCategory>('Groceries');
  const [manualPrice, setManualPrice] = useState<number>(30);
  const [manualQuantity, setManualQuantity] = useState<number>(10);
  const [manualUnit, setManualUnit] = useState('piece');
  const [manualMinStock, setManualMinStock] = useState<number>(5);

  useEffect(() => {
    const update = () => setInventory(storage.getInventory(shop.id));
    const unsub = storage.subscribe(update);
    return () => unsub();
  }, [shop.id]);

  const categories: (ProductCategory | 'All')[] = [
    'All',
    'Groceries',
    'Dairy & Bread',
    'Personal Care',
    'Electrical & Hardware',
    'Snacks & Beverages',
    'Cleaning & Household',
  ];

  const filteredItems = inventory.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStockDelta = (itemId: string, delta: number) => {
    storage.adjustStock(itemId, delta);
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}" from store inventory?`)) {
      storage.deleteInventoryItem(id);
    }
  };

  const handleParseAIInput = () => {
    if (!aiInput.trim()) return;
    const text = aiInput.toLowerCase();

    const qtyMatch = text.match(/\b(\d+)\b/);
    const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 10;

    const priceMatch = text.match(/(?:at|for|rate|rs|rs\.|\/-|each)?\s*(\d+)\s*(?:rupees|rs|rs\.|\/-|each)/i);
    const price = priceMatch ? parseInt(priceMatch[1], 10) : 20;

    let cleanName = aiInput
      .replace(/\b(\d+)\b/g, '')
      .replace(/(?:at|for|rate|rs|rupees|each|pieces|packet|packets)\b/gi, '')
      .trim();
    if (!cleanName) cleanName = 'Lux Soap';

    let unit = 'piece';
    if (text.includes('oil') || text.includes('packet')) unit = 'packet';
    if (text.includes('rice') || text.includes('sugar') || text.includes('kg')) unit = 'kg';

    setAiParsedPreview({
      productName: cleanName.replace(/\b\w/g, (c) => c.toUpperCase()),
      category: 'Personal Care' as ProductCategory,
      price,
      quantity,
      unit,
      minStockLevel: 5,
    });
  };

  const handleConfirmAiAdd = () => {
    if (!aiParsedPreview) return;
    storage.addInventoryItem({
      shopId: shop.id,
      productName: aiParsedPreview.productName,
      category: aiParsedPreview.category,
      price: aiParsedPreview.price,
      quantity: aiParsedPreview.quantity,
      unit: aiParsedPreview.unit,
      minStockLevel: aiParsedPreview.minStockLevel,
      status: 'in_stock',
    });
    setAiParsedPreview(null);
    setShowAddModal(false);
  };

  const handleManualAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;
    storage.addInventoryItem({
      shopId: shop.id,
      productName: manualName,
      category: manualCategory,
      price: Number(manualPrice),
      quantity: Number(manualQuantity),
      unit: manualUnit,
      minStockLevel: Number(manualMinStock),
      status: Number(manualQuantity) > Number(manualMinStock) ? 'in_stock' : 'low_stock',
    });
    setManualName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            {t('inventoryTitle')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('inventorySubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setAddMethod('ai');
              setShowAddModal(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{t('actionAddProduct')}</span>
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition"
          >
            {t('bulkRestock')}
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items or brands..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* INVENTORY TABLE / CARDS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-[10px] text-slate-400 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">{t('productName')}</th>
                <th className="py-3.5 px-4">{t('category')}</th>
                <th className="py-3.5 px-4">{t('quantity')}</th>
                <th className="py-3.5 px-4">{t('price')}</th>
                <th className="py-3.5 px-4">{t('status')}</th>
                <th className="py-3.5 px-4 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const isOut = item.quantity <= 0;
                const isLow = item.quantity > 0 && item.quantity <= item.minStockLevel;

                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.productName}</div>
                      {item.brand && <div className="text-[11px] text-slate-400">{item.brand}</div>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium text-[11px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStockDelta(item.id, -1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm flex items-center justify-center transition"
                          title="Decrease 1"
                        >
                          -
                        </button>
                        <span className="font-black text-slate-900 w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleStockDelta(item.id, 1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm flex items-center justify-center transition"
                          title="Increase 1"
                        >
                          +
                        </button>
                        <span className="text-[11px] text-slate-400 ml-1">{item.unit}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 text-sm">₹{item.price}</td>
                    <td className="py-3.5 px-4">
                      {isOut ? (
                        <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                          ● {t('outOfStock')}
                        </span>
                      ) : isLow ? (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          ● {t('lowStockBadge')}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          ● {t('inStock')}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteItem(item.id, item.productName)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredItems.map((item) => (
            <div key={item.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{item.productName}</h4>
                  <span className="text-[10px] text-slate-400">{item.category}</span>
                </div>
                <span className="font-black text-slate-900 text-sm">₹{item.price}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStockDelta(item.id, -1)}
                    className="w-8 h-8 rounded-xl bg-slate-100 font-black text-sm"
                  >
                    -
                  </button>
                  <span className="font-black text-slate-900 text-xs px-2">
                    {item.quantity} {item.unit}
                  </span>
                  <button
                    onClick={() => handleStockDelta(item.id, 1)}
                    className="w-8 h-8 rounded-xl bg-slate-100 font-black text-sm"
                  >
                    +
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.quantity <= 0
                        ? 'bg-red-100 text-red-700'
                        : item.quantity <= item.minStockLevel
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.quantity <= 0 ? t('outOfStock') : item.quantity <= item.minStockLevel ? t('lowStockBadge') : t('inStock')}
                  </span>
                  <button
                    onClick={() => handleDeleteItem(item.id, item.productName)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-base">{t('actionAddProduct')}</h3>
                <p className="text-xs text-slate-500">
                  {language === 'te' ? 'రాయండి లేదా ఫారమ్ నింపండి' : language === 'hi' ? 'बोलकर या फॉर्म भरकर जोड़ें' : 'Easy input or manual form'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAiParsedPreview(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border-b border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => setAddMethod('ai')}
                className={`flex-1 py-2 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  addMethod === 'ai'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{t('methodVoice')}</span>
              </button>
              <button
                type="button"
                onClick={() => setAddMethod('manual')}
                className={`flex-1 py-2 rounded-2xl text-xs font-bold transition ${
                  addMethod === 'manual'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{t('methodManual')}</span>
              </button>
            </div>

            <div className="p-6">
              {addMethod === 'ai' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'te' ? 'సరుకు వివరాలు టైప్ చేయండి:' : language === 'hi' ? 'सामान का विवरण लिखें:' : 'Type product details naturally:'}
                    </label>
                    <textarea
                      rows={3}
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder='e.g. "10 Lux soaps at 20 rupees each"'
                      className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleParseAIInput}
                    className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
                  >
                    {language === 'te' ? 'సరుకు వివరాలు సరిచూడండి' : language === 'hi' ? 'विवरण जांचें' : 'Check Item Details'}
                  </button>

                  {aiParsedPreview && (
                    <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2 text-xs text-emerald-950 animate-fadeIn">
                      <span className="font-bold text-[11px] uppercase tracking-wider block text-emerald-800">
                        {language === 'te' ? 'సరిచూసి నిర్ధారించండి:' : language === 'hi' ? 'पुष्टि करें:' : 'Preview Details:'}
                      </span>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-emerald-700">Product:</span>
                          <span className="font-bold">{aiParsedPreview.productName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-emerald-700">Quantity:</span>
                          <span className="font-bold">{aiParsedPreview.quantity} {aiParsedPreview.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-emerald-700">Price:</span>
                          <span className="font-bold">₹{aiParsedPreview.price}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleConfirmAiAdd}
                        className="mt-3 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition shadow-sm"
                      >
                        <Check className="w-4 h-4" />
                        <span>{t('confirmRecord')}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleManualAddSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">{t('productName')}</label>
                    <input
                      type="text"
                      required
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      placeholder="e.g. Rice 25kg"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">{t('category')}</label>
                      <select
                        value={manualCategory}
                        onChange={(e: any) => setManualCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      >
                        {categories.filter((c) => c !== 'All').map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">Unit</label>
                      <input
                        type="text"
                        value={manualUnit}
                        onChange={(e) => setManualUnit(e.target.value)}
                        placeholder="packet / piece / kg"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">{t('price')} (₹)</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={manualPrice}
                        onChange={(e) => setManualPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">{t('quantity')}</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={manualQuantity}
                        onChange={(e) => setManualQuantity(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">Min Alert</label>
                      <input
                        type="number"
                        min="1"
                        value={manualMinStock}
                        onChange={(e) => setManualMinStock(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                    >
                      {t('confirmRecord')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Restock Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-base">
              {language === 'te' ? 'ఒకేసారి సరుకు పెంచడం' : language === 'hi' ? 'एक साथ स्टॉक जोड़ें' : 'Bulk Shelf Restock'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'te'
                ? 'తక్కువగా ఉన్న అన్ని సరుకులకు +10 పరిమాణం చేరుతుంది.'
                : language === 'hi'
                ? 'कम स्टॉक वाले सभी सामानों में +10 स्टॉक जुड़ जाएगा।'
                : 'Adds +10 stock to all low stock items automatically.'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBulkModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  inventory.forEach((i) => {
                    if (i.quantity <= i.minStockLevel) {
                      storage.adjustStock(i.id, 10);
                    }
                  });
                  setShowBulkModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                Apply (+10)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
