import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, ShieldCheck, ExternalLink, AlertTriangle, Sparkles, User, Bot, CheckCircle, Mic, Volume2 } from 'lucide-react';
import { translations } from '../data/translations';

export default function ChatBotPanel({ onReportFeedback, initialQuery, lang }) {
  const t = translations[lang];
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: lang === 'mr'
        ? `नमस्कार! 🙏 मी महाराष्ट्र सरकारच्या योजनांविषयी माहिती देणारा **सत्यापित स्मार्ट सहाय्यक** आहे.\n\nतुम्ही शेतकरी, महिला, विद्यार्थी, आरोग्य किंवा इतर कोणत्याही योजनेविषयी प्रश्न विचारू शकता.\n\n*टीप: मी केवळ १००% पडताळणी केलेल्या अधिकृत शासकीय माहितीसंचातूनच उत्तरे देतो.*`
        : `Hello! 🙏 I am the **Verified Smart Assistant** for Maharashtra Government Schemes.\n\nYou can ask questions regarding schemes for farmers, women, students, healthcare, and more.\n\n*Note: Answers are strictly drawn from verified government datasets.*`,
      sources: []
    }
  ]);

  const suggestedPrompts = [
    { labelMr: "लाडकी बहीण योजनेची कागदपत्रे?", labelEn: "Ladki Bahin Documents?" },
    { labelMr: "शेतकऱ्यांसाठी कोणत्या योजना आहेत?", labelEn: "Schemes for Farmers?" },
    { labelMr: "संजय गांधी निराधार योजनेची पात्रता?", labelEn: "Sanjay Gandhi Scheme Eligibility?" },
    { labelMr: "आरोग्य योजनेत ५ लाख मदत कशी मिळते?", labelEn: "MJPJAY Healthcare 5 Lakh Aid?" },
    { labelMr: "शिष्यवृत्ती ५०% फी माफी कशी मिळेल?", labelEn: "Higher Education Fee Reimbursement?" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  // Handle initial query if passed from Scheme Directory card
  useEffect(() => {
    if (initialQuery) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  // Web Speech API: Voice Speech Recognition
  const handleVoiceListen = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(lang === 'mr'
        ? 'तुमच्या ब्राऊझरमध्ये व्हॉइस इनपुट सपोर्ट उपलब्ध नाही. Chrome किंवा Edge वापरून पहा.'
        : 'Voice recognition is not supported in this browser. Please try Chrome or Edge.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = lang === 'mr' ? 'mr-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      if (transcript) {
        setInputQuery(transcript);
        handleSend(transcript);
      }
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        alert(lang === 'mr'
          ? 'मायक्रोफोनची परवानगी द्या आणि पुन्हा प्रयत्न करा.'
          : 'Please allow microphone access and try again.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch (error) {
      console.error('Could not start speech recognition:', error);
      setIsListening(false);
    }
  };

  // Text-to-Speech audio readout
  const handleSpeak = (text) => {
    if (!('speechSynthesis' in window)) {
      alert(lang === 'mr'
        ? 'तुमच्या ब्राऊझरमध्ये ऑडिओ वाचन उपलब्ध नाही.'
        : 'Text-to-speech is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/<[^>]*>?/gm, '')
      .replace(/\*/g, '')
      .replace(/#/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === 'mr' ? 'mr-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeaking = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleSend = async (queryToSend = null) => {
    const text = queryToSend || inputQuery;
    if (!text.trim() || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: text,
          language: lang,
          consentGiven: true
        })
      });

      const data = await res.json();

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        userQuery: text,
        text: data.answer || 'माहिती उपलब्ध नाही.',
        sources: data.sources || [],
        isMatched: data.isMatched
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          userQuery: text,
          text: lang === 'mr'
            ? 'क्षस्व! सर्वर जोडणीत अडचण आली आहे. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.'
            : 'Sorry, connection error occurred. Please try again later.',
          sources: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to format bot markdown text simple HTML
  const formatMarkdownText = (txt) => {
    if (!txt) return '';
    let formatted = txt
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>')
      .replace(/### (.*?)(<br\/>|$)/g, '<h3 class="bot-msg-heading">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/- (.*?)(<br\/>|$)/g, '• $1<br/>');

    return formatted;
  };

  return (
    <div className="chatbot-panel-card">
      {/* Header */}
      <div className="chatbot-header">
        <div className="chatbot-header-icon">
          <Bot size={22} />
        </div>
        <div className="chatbot-header-text">
          <h3>{t.chatHeaderTitle}</h3>
          <p>{t.chatHeaderSubtitle}</p>
        </div>
      </div>

      {/* Message List */}
      <div className="chat-messages-container">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
            <div
              className="chat-bubble-content"
              dangerouslySetInnerHTML={{ __html: formatMarkdownText(msg.text) }}
            />

            {/* Audio Readout & Cited Sources */}
            {msg.sender === 'bot' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                {isSpeaking ? (
                  <button
                    type="button"
                    onClick={handleStopSpeaking}
                    style={{ background: 'transparent', color: '#dc2626', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                    title="ऑडिओ थांबवा (Stop Audio)"
                  >
                    <Volume2 size={14} />
                    <span>{lang === 'mr' ? 'थांबवा' : 'Stop'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSpeak(msg.text)}
                    style={{ background: 'transparent', color: 'var(--secondary-teal)', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                    title="उत्तर ऐका (Listen to Response)"
                  >
                    <Volume2 size={14} />
                    <span>{lang === 'mr' ? 'ऐका (Audio)' : 'Listen'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Cited Sources Badge */}
            {msg.sources && msg.sources.length > 0 && (
              <div className="source-tag-box">
                <div style={{ fontWeight: '600', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#0369a1' }}>
                  <ShieldCheck size={14} />
                  <span>{t.sourcesCited}</span>
                </div>

                {msg.sources.map((src) => (
                  <div key={src.id} style={{ fontSize: '0.78rem', margin: '0.2rem 0' }}>
                    • <strong>{lang === 'mr' ? src.nameMr : src.nameEn}</strong> (सत्यापित: {src.lastVerified})
                    {src.officialLink && (
                      <a
                        href={src.officialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="source-link"
                        style={{ marginLeft: '0.4rem' }}
                      >
                        <ExternalLink size={12} />
                        <span>पोर्टल</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Report Incorrect Response Button on EVERY Bot Answer */}
            {msg.sender === 'bot' && msg.id !== 'welcome-1' && (
              <div style={{ marginTop: '0.5rem' }}>
                <button
                  className="report-error-btn"
                  onClick={() => onReportFeedback({ userQuery: msg.userQuery, botAnswer: msg.text, schemeId: msg.sources?.[0]?.id })}
                >
                  <AlertTriangle size={12} />
                  <span>{t.reportIssueBtn}</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="chat-bubble bot" style={{ fontStyle: 'italic', color: '#64748b' }}>
            <span>माहितीसंचातून अचूक उत्तरे शोधत आहे...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="suggested-chips-container">
        <span className="suggested-chips-title">
          <Sparkles size={12} style={{ verticalAlign: 'middle', marginRight: '0.2rem' }} />
          {t.suggestedQueries}
        </span>
        <div className="chips-scroll-row">
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              className="chip-btn"
              onClick={() => handleSend(lang === 'mr' ? p.labelMr : p.labelEn)}
            >
              {lang === 'mr' ? p.labelMr : p.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        className="chat-input-area"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        {/* Voice Input Mic Button */}
        <button
          type="button"
          className={`voice-mic-btn ${isListening ? 'recording' : ''}`}
          onClick={handleVoiceListen}
          aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
          title={isListening ? 'ऐकणे थांबवा (Stop Listening)' : 'बोला (Voice Input)'}
        >
          <Mic size={18} />
        </button>

        <input
          type="text"
          placeholder={isListening ? (lang === 'mr' ? 'माहिती ऐकत आहे...' : 'Listening...') : t.chatInputPlaceholder}
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
        />

        <button type="submit" className="chat-send-btn" disabled={loading}>
          <span>{t.sendButton}</span>
          <Send size={16} />
        </button>
      </form>

      <div style={{ background: '#f8fafc', padding: '0.35rem', textAlign: 'center', fontSize: '0.72rem', color: '#94a3b8', borderTop: '1px solid #e2e8f0' }}>
        {t.disclaimerConsent}
      </div>
    </div>
  );
}

