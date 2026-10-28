import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Volume2, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVoiceQuery: (query: string) => void;
}

const VOICE_PRESETS = [
  {
    langBadge: 'తెలుగు (Telugu)',
    text: 'నాకు ఒక ఆయిల్ ప్యాకెట్, రెండు ట్యూబ్ లైట్లు, ఐదు సబ్బులు కావాలి',
    meaning: '1 oil packet, 2 tube lights and 5 soaps',
  },
  {
    langBadge: 'हिंदी (Hindi)',
    text: '1 तेल पैकेट, 2 ट्यूब लाइट और 5 साबुन चाहिए',
    meaning: '1 oil packet, 2 tube lights and 5 soaps',
  },
  {
    langBadge: 'English',
    text: '1 oil packet, 2 tube lights and 5 soaps',
    meaning: 'Multi-product basket discovery',
  },
  {
    langBadge: 'తెలుగు (Provisions)',
    text: 'రెండు ప్యాకెట్ల పాలు, ఒక బ్రెడ్ మరియు టీ పొడి',
    meaning: '2 milk packets, 1 bread and tea powder',
  },
  {
    langBadge: 'हिंदी (Kirana)',
    text: '2 पैकेट दूध, 1 ब्रेड और चाय पत्ती',
    meaning: '2 milk, 1 bread and tea',
  },
];

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isOpen,
  onClose,
  onSelectVoiceQuery,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const { language } = useLanguage();

  useEffect(() => {
    if (!isOpen) {
      setIsListening(false);
      setLiveTranscript('');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setLiveTranscript(transcript);
      };
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.start();

      return () => {
        try {
          recognition.abort();
        } catch {}
      };
    } catch {}
  }, [isOpen, language]);

  if (!isOpen) return null;

  const handleApplyTranscript = (text: string) => {
    onSelectVoiceQuery(text);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {language === 'te' ? 'మైక్ లో చెప్పండి' : language === 'hi' ? 'बोलकर सामान खोजें' : 'Speak to Find Items'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'te' ? 'తెలుగు, హిందీ లేదా ఇంగ్లీషులో మాట్లాడండి' : language === 'hi' ? 'हिंदी, तेलुगु या अंग्रेजी में बोलें' : 'Speak in Telugu, Hindi or English'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Mic Button / Listening Visualizer */}
        <div className="p-6 text-center border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
          <button
            onClick={() => {
              if (liveTranscript) {
                handleApplyTranscript(liveTranscript);
              }
            }}
            className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center transition-all ${
              isListening
                ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/30 scale-105 animate-pulse'
                : 'bg-emerald-50 text-emerald-700 border-2 border-emerald-400'
            }`}
          >
            <Mic className="w-10 h-10" />
          </button>

          <h4 className="text-base font-bold text-slate-900 mt-4">
            {isListening
              ? language === 'te' ? 'వినబడుతోంది... మాట్లాడండి' : language === 'hi' ? 'सुन रहे हैं... बोलिए' : 'Listening... Speak now'
              : language === 'te' ? 'మైక్ సిద్ధంగా ఉంది లేదా క్రింది నమూనాను నొక్కండి' : language === 'hi' ? 'माइक तैयार है या नीचे से चुनें' : 'Speak or tap a sample below'}
          </h4>

          {liveTranscript ? (
            <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <p className="text-xs text-emerald-800 font-bold mb-1">
                {language === 'te' ? 'మీరు చెప్పింది:' : language === 'hi' ? 'आपने बोला:' : 'Recognized:'}
              </p>
              <p className="text-sm font-extrabold text-emerald-950">"{liveTranscript}"</p>
              <button
                onClick={() => handleApplyTranscript(liveTranscript)}
                className="mt-3 inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition shadow-sm"
              >
                <span>{language === 'te' ? 'సరుకులు వెతకండి' : language === 'hi' ? 'सामान खोजें' : 'Search Now'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              {language === 'te'
                ? 'కిరాణా షాపులో అడిగినట్లే మీకు కావాల్సిన సరుకులు చెప్పండి.'
                : language === 'hi'
                ? 'दुकानदार से जैसे मांगते हैं, वैसे ही बोलें।'
                : 'Say product names and quantities naturally.'}
            </p>
          )}
        </div>

        {/* Clickable Voice Samples */}
        <div className="p-5">
          <span className="text-xs font-bold text-slate-700 block mb-2.5">
            {language === 'te' ? 'నమూనా మాటలను నొక్కండి:' : language === 'hi' ? 'नमूना वाक्य (क्लिक करें):' : 'Tap a sample voice query to test:'}
          </span>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {VOICE_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyTranscript(preset.text)}
                className="w-full text-left p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition flex items-center justify-between gap-3 group"
              >
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    {preset.langBadge}
                  </span>
                  <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-900 mt-1">
                    "{preset.text}"
                  </p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <Volume2 className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
