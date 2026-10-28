import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  PhoneCall,
  Store,
  Clock,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { aiService } from '../../services/aiService';
import { storage } from '../../services/storageService';
import { useLanguage } from '../../context/LanguageContext';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  suggestedActions?: { label: string; action: string; data?: any }[];
}

export const AIReceptionistWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { t, language } = useLanguage();

  const primaryShop = storage.getShopById('shop-1') || storage.getShops()[0];

  const getGreeting = () => {
    if (language === 'te') {
      return `నమస్కారం! మీ దగ్గర్లోని కిరాణా షాపుల్లో సరుకుల లభ్యత, ఆర్డర్ లేదా షాపుతో మాట్లాడటానికి సహాయం కావాలా? క్రింద ఉన్న బటన్లు నొక్కండి.`;
    }
    if (language === 'hi') {
      return `नमस्ते! अपनी पास की दुकान से सामान, ऑर्डर का स्टेटस या दुकानदार से सीधे बात करने के लिए नीचे दिए गए विकल्प चुनें।`;
    }
    return `Hello! How can we help you today with local stores, product availability, or your order?`;
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init',
      sender: 'bot',
      text: getGreeting(),
      time: 'Just now',
      suggestedActions: [
        { label: language === 'te' ? '📞 దుకాణదారుడితో మాట్లాడండి' : language === 'hi' ? '📞 दुकानदार को कॉल करें' : '📞 Call Store Owner', action: 'talk_shopkeeper' },
        { label: language === 'te' ? '📦 నా ఆర్డర్ ఎక్కడుంది?' : language === 'hi' ? '📦 मेरा ऑर्डर कहाँ है?' : "📦 Where is my order?", action: 'ask', data: "What's my order status?" },
        { label: language === 'te' ? '💡 చౌకైన సబ్బు ఎక్కడ దొరుకుతుంది?' : language === 'hi' ? '💡 सबसे सस्ता साबुन कहाँ मिलेगा?' : '💡 Cheapest soap nearby', action: 'ask', data: 'Which shop has the cheapest soap?' },
      ],
    },
  ]);

  const [showShopkeeperModal, setShowShopkeeperModal] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const response = aiService.answerCustomerQuestion(query);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.answer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: response.suggestedActions,
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 350);
  };

  const handleActionClick = (action: { label: string; action: string; data?: any }) => {
    if (action.action === 'ask') {
      handleSend(action.data);
    } else if (action.action === 'view_shop') {
      navigate(`/shop/${action.data}`);
      setIsOpen(false);
    } else if (action.action === 'search') {
      navigate(`/search?q=${encodeURIComponent(action.data || '')}`);
      setIsOpen(false);
    } else if (action.action === 'track_order') {
      navigate(`/order-status/${action.data}`);
      setIsOpen(false);
    } else if (action.action === 'talk_shopkeeper') {
      setShowShopkeeperModal(true);
    }
  };

  return (
    <>
      {/* Floating Support Button - Clean, friendly, no robot emojis */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-slate-900 text-white px-4 py-3 rounded-full shadow-xl hover:bg-slate-800 transition-all flex items-center gap-2.5 border-2 border-slate-700 group"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
            ?
          </div>
          <span className="font-bold text-xs sm:text-sm">
            {language === 'te' ? 'సహాయం' : language === 'hi' ? 'मदद' : 'Help & Support'}
          </span>
        </button>
      )}

      {/* Expanded Support Drawer */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-full sm:w-[400px] h-[540px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-slideUp">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">
                  {language === 'te' ? 'దుకాణ సహాయం' : language === 'hi' ? 'दुकान सहायता' : 'Store Customer Desk'}
                </h3>
                <p className="text-[11px] text-slate-300">
                  {primaryShop.name} ({primaryShop.locality})
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-sm'
                      : 'bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-line font-medium">{msg.text}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>

                {/* Suggested Action Buttons if present */}
                {msg.suggestedActions && (
                  <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                    {msg.suggestedActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleActionClick(action)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 ${
                          action.action === 'talk_shopkeeper'
                            ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                            : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Direct Call Button */}
          <div className="p-2.5 bg-amber-50 border-t border-amber-200 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900">
              {language === 'te' ? 'నేరుగా మాట్లాడండి:' : language === 'hi' ? 'सीधे बात करें:' : 'Direct Phone:'}
            </span>
            <a
              href={`tel:${primaryShop.phone}`}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{primaryShop.phone}</span>
            </a>
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={language === 'te' ? 'ఏదైనా అడగండి...' : language === 'hi' ? 'कुछ भी पूछें...' : 'Ask a question or type...'}
              className="flex-1 bg-slate-100 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center transition shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Talk to Human Shopkeeper Modal */}
      {showShopkeeperModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
              <PhoneCall className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">
              {language === 'te' ? 'దుకాణ యజమానికి కాల్' : language === 'hi' ? 'दुकानदार से संपर्क' : 'Call Store Owner'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              {primaryShop.name} ({primaryShop.ownerName})
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left mb-5 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>{language === 'te' ? 'దుకాణదారుడు:' : language === 'hi' ? 'दुकानदार:' : 'Shopkeeper:'}</span>
                <span className="font-bold text-slate-900">{primaryShop.ownerName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{language === 'te' ? 'ఫోన్ నంబర్:' : language === 'hi' ? 'फोन નંબર:' : 'Phone:'}</span>
                <span className="font-bold text-emerald-700">{primaryShop.phone}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{language === 'te' ? 'పని వేళలు:' : language === 'hi' ? 'समय:' : 'Hours:'}</span>
                <span className="font-medium text-slate-800">{primaryShop.openingHours}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowShopkeeperModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
              >
                {language === 'te' ? 'మూసివేయి' : language === 'hi' ? 'बंद करें' : 'Close'}
              </button>
              <a
                href={`tel:${primaryShop.phone}`}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{language === 'te' ? 'ఇప్పుడే కాల్ చేయండి' : language === 'hi' ? 'कॉल करें' : 'Call Now'}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
