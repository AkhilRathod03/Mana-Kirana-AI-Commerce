import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Bot,
  FileDown,
  Volume2,
  VolumeX,
  Sparkles,
  Settings,
  HelpCircle,
  AlertCircle,
  Database,
  ArrowRight,
  TrendingUp,
  Package,
  BookOpen,
  DollarSign,
  Key,
  Check,
} from 'lucide-react';
import { manaAiService, ManaAIMessage, ManaAIConfig } from '../../services/manaAiService';
import { storage } from '../../services/storageService';
import { useLanguage } from '../../context/LanguageContext';

export const ManaAiPage: React.FC = () => {
  const shop = storage.getShopById('shop-1') || storage.getShops()[0];
  const { t, language } = useLanguage();

  const getWelcomeMessage = (): ManaAIMessage => ({
    id: 'welcome-1',
    sender: 'assistant',
    text:
      language === 'te'
        ? `నమస్కారం! నేను మీ దుకాణం వ్యక్తిగత సలహాదారు **Mana-AI** (మన-AI).
మీ దుకాణం లైవ్ డేటా (సరుకుల నిల్వ, నిన్నటి/నేటి అమ్మకాలు, కస్టమర్ల ఖాతా ఉధార్) నాతో అనుసంధానించబడి ఉంది.

మీరు నన్ను ఏమైనా అడగవచ్చు:
• *"నిన్న ఏ సరుకులు వచ్చాయి లేదా ఏవి అయిపోతున్నాయి? నాకు PDF నివేదిక కావాలి."*
• *"రమేష్ కుమార్ ఈ నెల ఎంత ఖర్చు చేశాడు? స్టేట్‌మెంట్ PDF ఇవ్వు."*
• *"నిన్నటి అమ్మకాలు మరియు ఖర్చుల పూర్తి PDF తయారు చేయి."*`
        : language === 'hi'
        ? `नमस्ते! मैं आपकी दुकान का **Mana-AI** (हमारा-AI) बिजनेस सलाहकार हूँ।
आपकी दुकान का लाइव स्टॉक, कल और आज की बिक्री, और ग्राहकों का खाता बही मेरे पास उपलब्ध है।

आप मुझसे कुछ भी पूछ सकते हैं:
• *"कल कौन सा सामान आया या कौन सा स्टॉक कम है? मुझे PDF रिपोर्ट दो।"*
• *"रमेश कुमार का इस महीने का खर्च कितना है? स्टेटमेंट PDF दो।"*
• *"कल की बिक्री और खर्च का पूरा PDF हिसाब दो।"*`
        : `Namaste! I am **Mana-AI**, your Generative Business Advisor & PDF Engine.
Connected to **${shop.name}** live database (Inventory, yesterday/today sales, customer ledgers, and orders).

Ask me anything about your shop:
• *"What all stock arrived yesterday or is running low? Give me a PDF."*
• *"How much has Ramesh Kumar ordered this month? I need a PDF statement."*
• *"Show yesterday's sales and operating expenses with a PDF report."*`,
    timestamp: 'Just now',
    actionCard: {
      type: 'pdf_download',
      title: 'Store Performance & Stock Audit PDF',
      description: 'Instant overview of current inventory and sales health',
      buttonLabel: 'Download Sample PDF Audit',
      pdfAction: 'stock_audit',
      pdfPayload: {
        inventory: storage.getInventory(shop.id),
        shop,
        title: `${shop.name} Stock Audit & Business Status`,
      },
    },
  });

  const [messages, setMessages] = useState<ManaAIMessage[]>([getWelcomeMessage()]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [config, setConfig] = useState<ManaAIConfig>(manaAiService.getConfig());
  const [savedConfigNotice, setSavedConfigNotice] = useState(false);

  // Speech Recognition & TTS
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [selectedVoiceLang, setSelectedVoiceLang] = useState<'te-IN' | 'hi-IN' | 'en-IN'>(
    language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN'
  );
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedVoiceLang(language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN');
  }, [language]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing, interimTranscript]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSend = async (textToSend?: string) => {
    const raw = (textToSend || input).trim();
    if (!raw) return;

    const userMsg: ManaAIMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: raw,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setInterimTranscript('');
    setIsProcessing(true);

    try {
      const response = await manaAiService.askShopkeeperCopilot(raw, shop.id);
      setMessages((prev) => [...prev, response]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: 'I ran into an issue connecting to the AI brain. Please try again or ask with different wording.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Web Speech API Voice Recognition
  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        language === 'te'
          ? 'మీ బ్రౌజర్ లో వాయిస్ సపోర్ట్ లేదు. దయచేసి Google Chrome వాడండి.'
          : 'Voice input requires Google Chrome or Microsoft Edge.'
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedVoiceLang;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
        setInterimTranscript('');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) setInterimTranscript(interim);
        if (final) {
          setInterimTranscript('');
          setIsListening(false);
          handleSend(final.trim());
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error !== 'no-speech') {
          setSpeechError('Microphone input error. Please try speaking again.');
        }
      };

      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  // Text-To-Speech (TTS)
  const toggleTTS = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeakingId === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeakingId(null);
    } else {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#•-]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = selectedVoiceLang;
      utterance.rate = 0.95;
      setIsSpeakingId(msgId);
      utterance.onend = () => setIsSpeakingId(null);
      utterance.onerror = () => setIsSpeakingId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSaveConfig = () => {
    manaAiService.saveConfig(config);
    setSavedConfigNotice(true);
    setTimeout(() => {
      setSavedConfigNotice(false);
      setShowConfigModal(false);
    }, 1000);
  };

  const samplePrompts = [
    {
      category: 'Stock & Wholesaler',
      icon: Package,
      text: 'What all stock was updated yesterday or is low in stock? Give me a PDF.',
      langText: 'నిన్న ఏ సరుకులు వచ్చాయి? నిల్వల PDF కావాలి',
    },
    {
      category: 'Customer Khata',
      icon: BookOpen,
      text: 'How much has Ramesh Kumar ordered and what is his balance? Give me a statement PDF.',
      langText: 'రమేష్ కుమార్ బాకీ ఎంత? స్టేట్‌మెంట్ PDF ఇవ్వు',
    },
    {
      category: 'Sales & Revenue',
      icon: DollarSign,
      text: "Show yesterday's sales and expenses breakdown with a PDF report.",
      langText: 'నిన్నటి అమ్మకాలు, ఖర్చుల PDF రిపోర్టు ఇవ్వు',
    },
    {
      category: 'Inventory Check',
      icon: TrendingUp,
      text: 'Which products are out of stock or need reordering from wholesaler?',
      langText: 'ఏ సరుకులు అయిపోతున్నాయి?',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 rounded-3xl shadow-md border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black shadow-lg">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">Mana-AI</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                Business Copilot
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Ask questions about stock, customers, or sales & generate instant PDF reports.
            </p>
          </div>
        </div>

        {/* Action Controls & Settings */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-200 text-xs font-semibold">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate max-w-[140px] sm:max-w-none">{shop.name} (Live DB)</span>
          </div>

          <button
            onClick={() => setShowConfigModal(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition"
            title="AI Model & API Key Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* QUICK SUGGESTED PROMPTS */}
      <div className="bg-white p-3 sm:p-4 rounded-3xl border border-slate-200 shadow-sm space-y-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          {language === 'te' ? 'ఇలా అడగండి (క్లిక్ చేయండి):' : language === 'hi' ? 'सुझावित प्रश्न (क्लिक करें):' : 'Suggested Questions (Tap to ask):'}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {samplePrompts.map((p, idx) => {
            const Icon = p.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSend(language === 'te' ? p.langText : p.text)}
                className="p-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      {p.category}
                    </span>
                    <p className="text-xs font-semibold text-slate-800 group-hover:text-emerald-950 truncate">
                      "{language === 'te' ? p.langText : p.text}"
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0 ml-1" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Speech Error Banner */}
      {speechError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-xs text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{speechError}</span>
          </div>
          <button onClick={() => setSpeechError(null)} className="font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* CHAT CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[520px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[85%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none shadow-sm font-semibold'
                    : 'bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-sm font-medium'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="whitespace-pre-line flex-1 space-y-1">
                    {msg.text}
                  </div>
                  {msg.sender === 'assistant' && (
                    <button
                      onClick={() => toggleTTS(msg.id, msg.text)}
                      className="p-1 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-slate-100 transition shrink-0"
                      title={isSpeakingId === msg.id ? 'Stop audio' : 'Listen aloud'}
                    >
                      {isSpeakingId === msg.id ? (
                        <VolumeX className="w-4 h-4 text-emerald-600 animate-pulse" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>

                {/* INTERACTIVE PDF ACTION CARD */}
                {msg.actionCard && (
                  <div className="mt-3.5 p-3.5 bg-gradient-to-r from-emerald-50/90 to-teal-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-900 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <FileDown className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-extrabold text-xs text-slate-900 block">
                          {msg.actionCard.title}
                        </span>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {msg.actionCard.description}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (msg.actionCard?.pdfAction && msg.actionCard?.pdfPayload) {
                          manaAiService.executePDFDownload(
                            msg.actionCard.pdfAction,
                            msg.actionCard.pdfPayload
                          );
                        }
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm shrink-0"
                    >
                      <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{msg.actionCard.buttonLabel}</span>
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {/* Real-time speech transcript feedback */}
          {isListening && (
            <div className="bg-emerald-50 border-2 border-emerald-400 p-3 rounded-2xl max-w-[85%] text-xs text-emerald-950 font-bold flex items-center gap-2 animate-pulse shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping"></span>
              <span>
                {interimTranscript
                  ? `"${interimTranscript}..."`
                  : language === 'te'
                  ? 'చెప్పండి, వింటున్నాము...'
                  : 'Listening... Speak your question now'}
              </span>
            </div>
          )}

          {isProcessing && (
            <div className="text-xs text-slate-500 bg-white p-3 rounded-2xl w-fit border border-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
              <span>Mana-AI is analyzing store data and preparing report...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* INPUT BAR */}
        <div className="p-3 bg-white border-t border-slate-200 space-y-2">
          {/* Active Recording Pill */}
          {isListening && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-100/80 border border-emerald-300 text-emerald-950 text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                <span>Recording voice in {selectedVoiceLang.toUpperCase()}...</span>
              </div>
              <button
                type="button"
                onClick={stopListening}
                className="text-[11px] bg-red-600 text-white px-2 py-0.5 rounded-lg"
              >
                Stop
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                language === 'te'
                  ? 'Mana-AI ని అడగండి (ఉదా: "నిన్నటి అమ్మకాల వివరాలు చూపి PDF రాయి")...'
                  : 'Ask Mana-AI (e.g. "What stock is low? Give me a PDF" or "How much did Ramesh spend?")...'
              }
              className="flex-1 min-w-0 bg-slate-100 rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 transition"
            />

            {/* Voice Language Pill */}
            <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl text-[10px] font-bold border border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedVoiceLang('te-IN')}
                className={`px-1.5 py-0.5 rounded-md ${selectedVoiceLang === 'te-IN' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
              >
                తెలుగు
              </button>
              <button
                type="button"
                onClick={() => setSelectedVoiceLang('hi-IN')}
                className={`px-1.5 py-0.5 rounded-md ${selectedVoiceLang === 'hi-IN' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => setSelectedVoiceLang('en-IN')}
                className={`px-1.5 py-0.5 rounded-md ${selectedVoiceLang === 'en-IN' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
              >
                EN
              </button>
            </div>

            {/* MIC BUTTON */}
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`p-2.5 sm:p-3 rounded-2xl transition shrink-0 ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse shadow-md'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
              }`}
              title="Voice Prompt"
            >
              {isListening ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* SEND BUTTON */}
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-4 py-2.5 sm:py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs sm:text-sm transition flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <span className="hidden sm:inline">Ask AI</span>
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* MODEL / API CONFIGURATION MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Mana-AI Brain Settings</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Choose AI Intelligence Engine:
              </label>

              {/* Engine 1: Mana-AI Smart Deterministic (Default) */}
              <label
                className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition ${
                  config.provider === 'local_smart'
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="provider"
                  value="local_smart"
                  checked={config.provider === 'local_smart'}
                  onChange={() => setConfig({ ...config, provider: 'local_smart' })}
                  className="mt-1"
                />
                <div>
                  <span className="font-bold text-xs text-slate-900 block">
                    ⚡ Mana-AI Smart Brain (Recommended)
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    100% Free, Zero-latency, works offline with live store data and instant PDF generators.
                  </p>
                </div>
              </label>

              {/* Engine 2: Google Gemini API */}
              <label
                className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition ${
                  config.provider === 'gemini'
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="provider"
                  value="gemini"
                  checked={config.provider === 'gemini'}
                  onChange={() => setConfig({ ...config, provider: 'gemini' })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <span className="font-bold text-xs text-slate-900 block">
                    🚀 Google Gemini 1.5 Flash (Cloud LLM)
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5 mb-2">
                    Connects directly to Google Generative AI for open-ended conversation.
                  </p>
                  {config.provider === 'gemini' && (
                    <input
                      type="password"
                      placeholder="Paste your Gemini API Key..."
                      value={config.geminiApiKey}
                      onChange={(e) => setConfig({ ...config, geminiApiKey: e.target.value })}
                      className="w-full text-xs p-2 rounded-xl bg-white border border-slate-300 focus:outline-none focus:border-emerald-500"
                    />
                  )}
                </div>
              </label>
            </div>

            {savedConfigNotice && (
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5 justify-center">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>AI Configuration Saved!</span>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowConfigModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
