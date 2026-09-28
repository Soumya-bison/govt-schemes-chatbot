import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, ShieldCheck, ExternalLink, AlertTriangle, Sparkles, Bot, Mic, Volume2, X, Maximize2, Minimize2 } from 'lucide-react';
import { translations } from '../data/translations';

export default function FloatingChatWidget({ isOpen, setIsOpen, initialQuery, lang, onReportFeedback }) {
  const t = translations[lang];
  const messagesEndRef = useRef(null);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: lang === 'mr'
        ? `नमस्कार! 🙏 मी महाराष्ट्र सरकारच्या योजनांविषयी माहिती देणारा **सत्यापित AI सहाय्यक (HubBot)** आहे.\n\nतुम्ही शेतकरी, महिला, विद्यार्थी, आरोग्य किंवा इतर कोणत्याही योजनेविषयी थेट प्रश्न विचारू शकता.\n\n*टीप: मी केवळ अधिकृत शासकीय माहितीसंचातूनच उत्तरे देतो.*`
        : `Hello! 🙏 I am the **Verified AI Assistant** for Maharashtra Government Schemes.\n\nYou can ask any questions regarding schemes for farmers, women, students, healthcare, and more.\n\n*Note: Answers are strictly drawn from verified government datasets.*`,
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
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Handle initial query triggered from Scheme Cards or Wizard
  useEffect(() => {
    if (initialQuery) {
      setIsOpen(true);
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  // Show a quick visual tooltip on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasPrompted(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Web Speech API: Voice Speech Recognition
  const handleVoiceListen = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(lang === 'mr' ? 'तुमच्या ब्राऊझरमध्ये व्हॉइस इनपुट सपोर्ट उपलब्ध नाही.' : 'Voice recognition is not supported in your browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'mr' ? 'mr-IN' : 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputQuery(transcript);
      setIsListening(false);
      handleSend(transcript);
    };

    recognition.onerror = (err) => {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Text-to-Speech audio readout
  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/\*/g, '').replace(/#/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = lang === 'mr' ? 'mr-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
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
      const res = await fetch('/api/chat', {
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
        text: data.answer || (lang === 'mr' ? 'माहिती उपलब्ध नाही.' : 'Information not available.'),
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

  // Helper to format bot markdown text to clean HTML
  const formatMarkdownText = (txt) => {
    if (!txt) return '';
    return txt
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>')
      .replace(/### (.*?)(<br\/>|$)/g, '<h3 class="bot-msg-heading">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/- (.*?)(<br\/>|$)/g, '• $1<br/>');
  };

  return (
    <div className="floating-chat-container">
      {/* Floating Tooltip Callout (shows briefly when closed) */}
      {!isOpen && hasPrompted && (
        <div className="floating-chat-tooltip" onClick={() => setIsOpen(true)}>
          <Sparkles size={14} style={{ color: '#fb923c' }} />
          <span>{lang === 'mr' ? 'शासकीय योजना AI मदतगाराशी बोला' : 'Ask Scheme AI Assistant'}</span>
          <button
            className="tooltip-close-btn"
            onClick={(e) => {
              e.stopPropagation();
              setHasPrompted(false);
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        className={`floating-chat-fab ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? 'चॅट विंडो बंद करा' : 'AI चॅट मदतगार उघडा'}
      >
        {isOpen ? <X size={26} /> : <MessageSquare size={26} />}
      </button>

      {/* Floating Popup Window Widget */}
      {isOpen && (
        <div className={`floating-chat-popup ${isExpanded ? 'expanded' : ''}`}>
          {/* Header Bar */}
          <div className="floating-chat-header">
            <div className="floating-chat-header-info">
              <div className="floating-bot-avatar">
                <Bot size={20} />
              </div>
              <div>
                <div className="floating-bot-title-row">
                  <h4>{t.chatHeaderTitle}</h4>
                  <span className="bot-status-dot" title="Active AI Bot"></span>
                </div>
                <p className="floating-bot-subtitle">Powered by AI • {t.verifiedBadge}</p>
              </div>
            </div>

            <div className="floating-chat-header-actions">
              <button
                className="header-icon-btn"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'विंडो लहान करा' : 'विंडो मोठी करा'}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                className="header-icon-btn"
                onClick={() => setIsOpen(false)}
                title="बंद करा (Close)"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="floating-messages-area">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
                <div
                  className="chat-bubble-content"
                  dangerouslySetInnerHTML={{ __html: formatMarkdownText(msg.text) }}
                />

                {/* Audio Readout */}
                {msg.sender === 'bot' && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                    <button
                      onClick={() => handleSpeak(msg.text)}
                      style={{ background: 'transparent', color: 'var(--secondary-teal)', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                      title="उत्तर ऐका (Listen to Response)"
                    >
                      <Volume2 size={14} />
                      <span>{lang === 'mr' ? 'ऐका (Audio)' : 'Listen'}</span>
                    </button>
                  </div>
                )}

                {/* Cited Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="source-tag-box">
                    <div style={{ fontWeight: '600', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#0369a1' }}>
                      <ShieldCheck size={14} />
                      <span>{t.sourcesCited}</span>
                    </div>

                    {msg.sources.map((src) => (
                      <div key={src.id} style={{ fontSize: '0.78rem', margin: '0.2rem 0' }}>
                        • <strong>{lang === 'mr' ? src.nameMr : src.nameEn}</strong>
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

                {/* Report Error Button */}
                {msg.sender === 'bot' && msg.id !== 'welcome-1' && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <button
                      className="report-error-btn"
                      onClick={() => onReportFeedback && onReportFeedback({ userQuery: msg.userQuery, botAnswer: msg.text, schemeId: msg.sources?.[0]?.id })}
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
                <span>माहितीसंचातून उत्तरे शोधत आहे...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Option Chips */}
          <div className="floating-suggested-chips">
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
            className="floating-chat-input-row"
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
              title={isListening ? 'ऐकत आहे... (Listening...)' : 'बोला (Voice Input in Marathi)'}
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
              <Send size={16} />
            </button>
          </form>

          {/* Footer Privacy Note */}
          <div className="floating-chat-disclaimer">
            AI-generated responses based on official GR records.
          </div>
        </div>
      )}
    </div>
  );
}
