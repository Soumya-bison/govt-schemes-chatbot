import React from 'react';
import { ShieldCheck, Globe, BookOpen, MessageSquare, PhoneCall, Settings, Landmark, Sparkles, Star, Eye } from 'lucide-react';
import { translations } from '../data/translations';

export default function Header({ currentTab, setCurrentTab, lang, setLang, onOpenWizard, savedCount = 0, highContrast, setHighContrast, onShowSavedOnly, onOpenChatbot }) {
  const t = translations[lang];

  return (
    <header className="header-wrapper">
      {/* Top Govt Banner Bar */}
      <div className="civic-top-bar">
        <div className="verified-tag">
          <ShieldCheck size={16} />
          <span>{t.verifiedBadge}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>{t.govtPortalLabel}</span>

          {/* High Contrast Toggle */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            className="lang-toggle-btn"
            style={{ background: highContrast ? '#eab308' : 'rgba(255, 255, 255, 0.15)', color: highContrast ? '#000' : '#fff' }}
            title="हाय-कॉन्ट्रास्ट मोड / High Contrast Mode"
          >
            <Eye size={14} />
            <span>{highContrast ? 'सामान्य मोड' : 'हाय कॉन्ट्रास्ट'}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'mr' ? 'en' : 'mr')}
            className="lang-toggle-btn"
            title="भाषा बदला / Toggle Language"
          >
            <Globe size={14} />
            <span>{lang === 'mr' ? 'English' : 'मराठी'}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="main-header">
        <div className="header-inner">
          <div className="brand-container" style={{ cursor: 'pointer' }} onClick={() => setCurrentTab('directory')}>
            <div className="brand-logo-emblem">
              <Landmark size={24} />
            </div>
            <div className="brand-titles">
              <h1>{t.siteTitle}</h1>
              <p>{t.siteTagline}</p>
            </div>
          </div>

          <nav className="nav-links">
            {/* Eligibility Wizard Trigger */}
            <button
              className="nav-btn"
              style={{ background: 'linear-gradient(135deg, #d97706, #c05621)', color: 'white', fontWeight: '700' }}
              onClick={onOpenWizard}
            >
              <Sparkles size={16} />
              <span>{lang === 'mr' ? 'पात्रता तपासा' : 'Check Eligibility'}</span>
            </button>

            <button
              className={`nav-btn ${currentTab === 'directory' ? 'active' : ''}`}
              onClick={() => setCurrentTab('directory')}
            >
              <BookOpen size={16} />
              <span>{t.navDirectory}</span>
            </button>

            {/* Saved Bookmarks Badge */}
            {savedCount > 0 && (
              <button
                className="nav-btn"
                style={{ background: 'rgba(234, 179, 8, 0.2)', color: '#fef08a', borderColor: '#eab308' }}
                onClick={() => {
                  setCurrentTab('directory');
                  if (onShowSavedOnly) onShowSavedOnly();
                }}
              >
                <Star size={16} fill="#eab308" color="#eab308" />
                <span>{lang === 'mr' ? `जतन केलेले (${savedCount})` : `Saved (${savedCount})`}</span>
              </button>
            )}

            <button
              className="nav-btn"
              onClick={() => onOpenChatbot && onOpenChatbot()}
            >
              <MessageSquare size={16} />
              <span>{t.navChatbot}</span>
            </button>

            <button
              className={`nav-btn ${currentTab === 'contact' ? 'active' : ''}`}
              onClick={() => setCurrentTab('contact')}
            >
              <PhoneCall size={16} />
              <span>{t.navContact}</span>
            </button>

            <button
              className={`nav-btn ${currentTab === 'admin' ? 'active' : ''}`}
              onClick={() => setCurrentTab('admin')}
            >
              <Settings size={16} />
              <span>{t.navAdmin}</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}

