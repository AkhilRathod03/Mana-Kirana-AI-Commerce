import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Mic,
  MapPin,
  CheckCircle2,
  XCircle,
  PhoneCall,
  ShoppingBag,
  Store,
  ArrowRight,
  Split,
  SlidersHorizontal,
  Check,
  Plus,
  Minus,
} from 'lucide-react';
import { aiService } from '../../services/aiService';
import { storage } from '../../services/storageService';
import {
  ParsedProductRequest,
  ShopSearchResult,
  SplitOrderOption,
  Shop,
} from '../../types';
import { VoiceInputModal } from '../../components/common/VoiceInputModal';
import { useLanguage } from '../../context/LanguageContext';

export const AISearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '1 oil packet, 2 tube lights and 5 soaps';
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const { t, language } = useLanguage();

  // Parsed Items
  const [parsedProducts, setParsedProducts] = useState<ParsedProductRequest[]>([]);

  // Search Results
  const [completeMatches, setCompleteMatches] = useState<ShopSearchResult[]>([]);
  const [partialMatches, setPartialMatches] = useState<ShopSearchResult[]>([]);
  const [splitOrder, setSplitOrder] = useState<SplitOrderOption | null>(null);

  // Filters & Sorting
  const [filterType, setFilterType] = useState<'all' | 'delivery' | 'pickup'>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price' | 'distance'>('recommended');
  const [callModalShop, setCallModalShop] = useState<Shop | null>(null);

  const navigate = useNavigate();
  const locationState = storage.getLocation();

  const executeSearch = (text: string) => {
    setIsSearching(true);
    const parsed = aiService.parseCustomerRequest(text);
    setParsedProducts(parsed);

    setTimeout(() => {
      const results = aiService.searchAndRankShops(parsed);
      setCompleteMatches(results.completeMatches);
      setPartialMatches(results.partialMatches);
      setSplitOrder(results.splitOrderOption);
      setIsSearching(false);
    }, 300);
  };

  useEffect(() => {
    if (initialQuery) {
      executeSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput });
      executeSearch(searchInput);
    }
  };

  const handleQuantityChange = (canonicalName: string, delta: number) => {
    const updated = parsedProducts.map((p) => {
      if (p.canonicalName === canonicalName) {
        return { ...p, quantity: Math.max(1, p.quantity + delta) };
      }
      return p;
    });
    setParsedProducts(updated);
    const results = aiService.searchAndRankShops(updated);
    setCompleteMatches(results.completeMatches);
    setPartialMatches(results.partialMatches);
    setSplitOrder(results.splitOrderOption);
  };

  const handleOrderFromShop = (shopResult: ShopSearchResult) => {
    navigate(`/checkout/${shopResult.shop.id}`, {
      state: {
        shop: shopResult.shop,
        items: shopResult.availableItems,
        totalBasketPrice: shopResult.totalBasketPrice,
      },
    });
  };

  const filterList = (list: ShopSearchResult[]) => {
    let filtered = [...list];
    if (filterType === 'delivery') filtered = filtered.filter((r) => r.deliveryAvailable);
    if (filterType === 'pickup') filtered = filtered.filter((r) => r.pickupAvailable);

    if (sortBy === 'price') filtered.sort((a, b) => a.totalBasketPrice - b.totalBasketPrice);
    if (sortBy === 'distance') filtered.sort((a, b) => a.distanceKm - b.distanceKm);
    if (sortBy === 'recommended') filtered.sort((a, b) => a.matchScore - b.matchScore);

    return filtered;
  };

  const filteredComplete = filterList(completeMatches);
  const filteredPartial = filterList(partialMatches);

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Search Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-emerald-600 absolute left-3.5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-11 pr-12 py-3 rounded-2xl bg-slate-100 border border-transparent focus:border-emerald-500 focus:bg-white text-sm sm:text-base text-slate-900 focus:outline-none transition"
              />
              <button
                type="button"
                onClick={() => setIsVoiceOpen(true)}
                title={t('speakButton')}
                className="absolute right-2 p-2 rounded-xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <span>{t('findButton')}</span>
            </button>
          </form>

          {/* Quick preset chips */}
          <div className="mt-3 flex items-center gap-2 flex-wrap text-xs text-slate-500">
            <span className="font-semibold text-slate-400">{t('popularQueries')}</span>
            <button
              onClick={() => {
                const q = '1 oil packet, 2 tube lights and 5 soaps';
                setSearchInput(q);
                executeSearch(q);
              }}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
            >
              1 oil, 2 tube lights, 5 soaps
            </button>
            <button
              onClick={() => {
                const q = 'నాకు ఒక ఆయిల్ ప్యాకెట్, రెండు ట్యూబ్ లైట్లు, ఐదు సబ్బులు కావాలి';
                setSearchInput(q);
                executeSearch(q);
              }}
              className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold transition"
            >
              తెలుగు: "1 ఆయిల్, 2 ట్యూబ్ లైట్లు, 5 సబ్బులు"
            </button>
            <button
              onClick={() => {
                const q = '1 तेल पैकेट, 2 ट्यूब लाइट और 5 साबुन चाहिए';
                setSearchInput(q);
                executeSearch(q);
              }}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
            >
              हिंदी: "1 तेल, 2 ट्यूब लाइट, 5 साबुन"
            </button>
          </div>
        </div>

        {/* REQUESTED ITEMS LIST (Simple, no AI buzzwords) */}
        {parsedProducts.length > 0 && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <span>{t('yourItems')}</span>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {parsedProducts.length} {t('itemsParsed')}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{t('adjustQuantity')}</p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{locationState.locality}</span>
              </div>
            </div>

            {/* Item chips with + - buttons */}
            <div className="mt-4 flex flex-wrap gap-2.5">
              {parsedProducts.map((prod) => (
                <div
                  key={prod.canonicalName}
                  className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs"
                >
                  <div className="font-bold text-slate-800 text-sm">
                    {prod.quantity} × <span className="text-emerald-900">{prod.canonicalName}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
                    <button
                      onClick={() => handleQuantityChange(prod.canonicalName, -1)}
                      className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded font-bold"
                      title="Decrease"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center font-extrabold text-xs">{prod.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(prod.canonicalName, 1)}
                      className="w-5 h-5 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded font-bold"
                      title="Increase"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-2 text-xs text-slate-500">
              {isSearching ? t('searchingStatus') : `Found ${completeMatches.length + partialMatches.length} nearby stores with matching stock.`}
            </div>
          </div>
        )}

        {/* Filter and Sort Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-slate-700">Filter:</span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('filterAll')}
            </button>
            <button
              onClick={() => setFilterType('delivery')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                filterType === 'delivery'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('filterDelivery')}
            </button>
            <button
              onClick={() => setFilterType('pickup')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                filterType === 'pickup'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('filterPickup')}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-100 border-none rounded-xl px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none"
            >
              <option value="recommended">{t('sortByRecommended')}</option>
              <option value="price">{t('sortByPrice')}</option>
              <option value="distance">{t('sortByDistance')}</option>
            </select>
          </div>
        </div>

        {/* STORES WITH ALL ITEMS IN STOCK */}
        {filteredComplete.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-black text-slate-900 text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{t('allInStock')}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredComplete.map((res) => (
                <div
                  key={res.shop.id}
                  className="bg-white rounded-3xl border-2 border-emerald-500/50 p-5 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">{res.shop.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{res.shop.locality} • <strong>{res.distanceKm} km</strong></span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          {t('totalBasket')}
                        </span>
                        <span className="text-2xl font-black text-emerald-700">₹{res.totalBasketPrice}</span>
                      </div>
                    </div>

                    {/* Available items */}
                    <div className="my-3 p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-1.5 text-xs">
                      <span className="font-bold text-emerald-900 block">{t('available')}</span>
                      {res.availableItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-slate-700">
                          <span className="font-medium text-slate-900">
                            ✓ {item.product.productName} ({item.requestedQuantity}x)
                          </span>
                          <span className="font-bold text-slate-900">₹{item.itemTotal}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] text-slate-500 mb-4">
                      {res.deliveryAvailable ? t('deliveryAvailable') : t('pickupOnly')}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleOrderFromShop(res)}
                      className="w-full sm:flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-sm"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{t('orderButton')} (₹{res.totalBasketPrice})</span>
                    </button>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Link
                        to={`/shop/${res.shop.id}`}
                        className="flex-1 sm:flex-none text-center px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
                      >
                        {t('viewShopButton')}
                      </Link>
                      <button
                        onClick={() => setCallModalShop(res.shop)}
                        className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                        title={t('callButton')}
                      >
                        <PhoneCall className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMBINED / SPLIT ORDER OPTION */}
        {splitOrder && (
          <div className="bg-slate-100/80 rounded-3xl border border-slate-300 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Split className="w-5 h-5 text-slate-700" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{t('splitOrderTitle')}</h3>
                <p className="text-xs text-slate-600">{t('splitOrderDesc')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                <div className="flex justify-between font-bold text-slate-900 mb-1">
                  <span>{splitOrder.shopA.name} ({splitOrder.shopA.distanceKm} km)</span>
                  <span className="text-emerald-700 font-black">₹{splitOrder.shopATotal}</span>
                </div>
                <ul className="space-y-0.5 text-slate-600 text-[11px]">
                  {splitOrder.shopAItems.map((it, idx) => (
                    <li key={idx}>✓ {it.product.productName} ({it.requestedQuantity}x)</li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                <div className="flex justify-between font-bold text-slate-900 mb-1">
                  <span>{splitOrder.shopB.name} ({splitOrder.shopB.distanceKm} km)</span>
                  <span className="text-emerald-700 font-black">₹{splitOrder.shopBTotal}</span>
                </div>
                <ul className="space-y-0.5 text-slate-600 text-[11px]">
                  {splitOrder.shopBItems.map((it, idx) => (
                    <li key={idx}>✓ {it.product.productName} ({it.requestedQuantity}x)</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="font-black text-slate-900 text-sm">
                Combined Total: ₹{splitOrder.combinedTotal}
              </span>
              <div className="flex gap-2">
                <Link
                  to={`/shop/${splitOrder.shopA.id}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold"
                >
                  Store 1
                </Link>
                <Link
                  to={`/shop/${splitOrder.shopB.id}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold"
                >
                  Store 2
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* PARTIAL STOCK STORES */}
        {filteredPartial.length > 0 && (
          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-slate-900 text-base">{t('partialInStock')}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPartial.map((res) => (
                <div
                  key={res.shop.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">{res.shop.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{res.shop.locality} • {res.distanceKm} km</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-slate-800">₹{res.totalBasketPrice}</span>
                      </div>
                    </div>

                    {/* Available items */}
                    <div className="my-2 p-2.5 bg-slate-50 rounded-2xl space-y-1 text-xs">
                      <span className="font-bold text-emerald-800 block text-[11px]">{t('available')}</span>
                      {res.availableItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-slate-700">
                          <span>✓ {item.product.productName}</span>
                          <span className="font-semibold">₹{item.itemTotal}</span>
                        </div>
                      ))}
                    </div>

                    {/* Missing items */}
                    {res.missingItems.length > 0 && (
                      <div className="p-2.5 bg-red-50 rounded-2xl border border-red-100 text-xs text-red-700 mb-3 space-y-0.5">
                        <span className="font-bold block text-[11px] text-red-800">{t('unavailable')}</span>
                        {res.missingItems.map((m, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            <span>{m.quantity} × {m.canonicalName}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-3 border-t border-slate-100 text-xs">
                    <button
                      onClick={() => handleOrderFromShop(res)}
                      className="w-full sm:flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition text-center"
                    >
                      {t('orderButton')} ({res.availableItems.length} items)
                    </button>
                    <Link
                      to={`/shop/${res.shop.id}`}
                      className="w-full sm:w-auto text-center px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition"
                    >
                      {t('viewShopButton')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Call Shop Modal */}
      {callModalShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">{callModalShop.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              {callModalShop.ownerName} • {callModalShop.locality}
            </p>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-base font-black text-slate-900 mb-5">
              {callModalShop.phone}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCallModalShop(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
              >
                Close
              </button>
              <a
                href={`tel:${callModalShop.phone}`}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" /> Call Store
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Voice Input Modal */}
      <VoiceInputModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSelectVoiceQuery={(text) => {
          setSearchInput(text);
          setSearchParams({ q: text });
          executeSearch(text);
        }}
      />
    </div>
  );
};
