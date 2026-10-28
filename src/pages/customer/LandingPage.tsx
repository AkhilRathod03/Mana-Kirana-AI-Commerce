import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mic,
  Search,
  ArrowRight,
  Store,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  Users,
  Package,
} from 'lucide-react';
import { VoiceInputModal } from '../../components/common/VoiceInputModal';
import { storage } from '../../services/storageService';
import { useLanguage } from '../../context/LanguageContext';

export const LandingPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const locationState = storage.getLocation();
  const shops = storage.getShops().slice(0, 4);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    navigate(`/search?q=${encodeURIComponent(promptText)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white pt-12 pb-16 sm:pt-16 sm:pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Location Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-slate-200 text-xs font-semibold mb-6">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>{locationState.locality}, {locationState.city}</span>
          </div>

          {/* Simple Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight sm:leading-[1.15]">
            {t('heroTitle')}{' '}
            <span className="text-emerald-400">
              {t('heroTitleHighlight')}
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-4 text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            {t('heroSubtitle')}
          </p>

          {/* Prominent Search Box with Voice Button */}
          <div className="mt-8 max-w-2xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center bg-white rounded-2xl p-2 sm:p-2.5 shadow-xl text-slate-900 border-2 border-emerald-500/40"
            >
              <div className="pl-3 pr-2 text-slate-400">
                <Search className="w-5 h-5 text-emerald-600" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full text-sm sm:text-base bg-transparent border-none focus:outline-none placeholder-slate-400 text-slate-900 py-1.5"
              />

              {/* Voice Button */}
              <button
                type="button"
                onClick={() => setIsVoiceOpen(true)}
                title={t('speakButton')}
                className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition flex items-center gap-1.5 shrink-0 mr-1 font-bold text-xs sm:text-sm"
              >
                <Mic className="w-4 h-4 sm:w-4 sm:h-4 text-emerald-600" />
                <span className="hidden sm:inline">{t('speakButton')}</span>
              </button>

              {/* Search submit button */}
              <button
                type="submit"
                className="p-2 sm:px-5 sm:py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition flex items-center gap-1.5 shrink-0 shadow-md"
              >
                <span className="hidden sm:inline">{t('findButton')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick sample chips in local languages */}
            <div className="mt-4 flex items-center justify-center flex-wrap gap-2 text-xs">
              <span className="text-slate-400 font-semibold">{t('popularQueries')}</span>
              <button
                onClick={() => handleQuickPrompt('నాకు ఒక ఆయిల్ ప్యాకెట్, రెండు ట్యూబ్ లైట్లు, ఐదు సబ్బులు కావాలి')}
                className="px-3 py-1.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 transition font-medium"
              >
                తెలుగు: "1 ఆయిల్, 2 ట్యూబ్ లైట్లు, 5 సబ్బులు"
              </button>
              <button
                onClick={() => handleQuickPrompt('1 तेल पैकेट, 2 ट्यूब लाइट और 5 साबुन चाहिए')}
                className="px-3 py-1.5 rounded-full bg-slate-800 text-teal-300 border border-slate-700 hover:bg-slate-700 transition font-medium"
              >
                हिंदी: "1 तेल, 2 ट्यूब लाइट, 5 साबुन"
              </button>
              <button
                onClick={() => handleQuickPrompt('1 oil packet, 2 tube lights and 5 soaps')}
                className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition"
              >
                English: "1 oil, 2 tube lights, 5 soaps"
              </button>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/search"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-lg flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>{t('findProducts')}</span>
            </Link>
            <Link
              to="/shopkeeper"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm transition flex items-center justify-center gap-2"
            >
              <Store className="w-4 h-4 text-emerald-400" />
              <span>{t('shopkeeperMode')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3 SIMPLE STEPS */}
      <section className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-black text-slate-900">
              {t('howItWorksTitle')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-lg flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="font-extrabold text-slate-900 text-base mb-1.5">
                {t('step1Title')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t('step1Desc')}
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-lg flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="font-extrabold text-slate-900 text-base mb-1.5">
                {t('step2Title')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t('step2Desc')}
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-lg flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="font-extrabold text-slate-900 text-base mb-1.5">
                {t('step3Title')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t('step3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TWO SIDES: CUSTOMER & SHOPKEEPER */}
      <section className="py-14 bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Customer Box */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {language === 'te' ? 'కస్టమర్ల కోసం' : language === 'hi' ? 'ग्राहकों के लिए' : 'For Customers'}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-3 mb-2">
                  {language === 'te' ? 'షాపుల వెంట తిరగకుండా సరుకులు కనుక్కోండి' : language === 'hi' ? 'दुकानों के चक्कर लगाए बिना सामान ढूंढें' : 'No more running from shop to shop'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {language === 'te'
                    ? 'మొత్తం సరుకుల లిస్ట్ ఏ షాపులో దొరుకుతుందో, మొత్తం ఖరీదు ఎంతో ముందే తెలుసుకోండి.'
                    : language === 'hi'
                    ? 'पता करें कि पूरा सामान किस दुकान में मिलेगा और कुल कितना खर्च आएगा।'
                    : 'Search your whole basket in one go and see total prices across neighborhood shops.'}
                </p>
              </div>

              <Link
                to="/search"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm hover:bg-emerald-700 transition w-fit"
              >
                <span>{t('findProducts')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Shopkeeper Box */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {language === 'te' ? 'దుకాణదారుల కోసం' : language === 'hi' ? 'दुकानदारों के लिए' : 'For Local Shopkeepers'}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-3 mb-2">
                  {language === 'te' ? 'కష్టమైన సాఫ్ట్‌వేర్ లేకుండా మీ దుకాణం నడపండి' : language === 'hi' ? 'बिना कंप्यूटर सीखे दुकान का हिसाब रखें' : 'Manage your shop without complicated software'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {language === 'te'
                    ? 'ఫోన్ లో చెప్పండి — సరుకులు రావడం, కస్టమర్ల ఖాతా ఉధార్ లెక్కలు మరియు ఖర్చులు ఆటోమేటిక్ గా రికార్డు అవుతాయి.'
                    : language === 'hi'
                    ? 'बोलकर दर्ज करें — सामान आना, ग्राहकों का उधार खाता और दैनिक खर्च तुरंत सेव होगा।'
                    : 'Speak to restock, log customer credit (Khata), and view simple daily reports.'}
                </p>
              </div>

              <Link
                to="/shopkeeper"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs sm:text-sm hover:bg-slate-800 transition w-fit"
              >
                <span>{t('shopkeeperMode')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* LOCAL STORES LIST */}
      <section className="py-14 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {t('nearbyShops')} ({locationState.locality})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'te' ? 'మీ పరిసరాల్లోని నమ్మకమైన కిరాణా దుకాణాలు' : language === 'hi' ? 'आपके इलाके की भरोसेमंद दुकानें' : 'Verified local neighborhood stores'}
              </p>
            </div>
            <Link
              to="/shops"
              className="text-emerald-700 hover:text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-1"
            >
              <span>View all ({storage.getShops().length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{shop.name}</h4>
                    <span className="text-xs font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                      ★ {shop.rating}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{shop.locality} • <strong>{shop.distanceKm} km</strong></span>
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    {shop.isDeliveryAvailable ? '🛵 Delivery' : '🏪 Pickup'}
                  </span>
                  <Link
                    to={`/shop/${shop.id}`}
                    className="font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    {t('viewShopButton')} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Voice Input Modal */}
      <VoiceInputModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSelectVoiceQuery={(text) => {
          navigate(`/search?q=${encodeURIComponent(text)}`);
        }}
      />
    </div>
  );
};
