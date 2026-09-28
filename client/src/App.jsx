import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SchemeDirectory from './components/SchemeDirectory';
import SchemeDetailModal from './components/SchemeDetailModal';
import EligibilityWizardModal from './components/EligibilityWizardModal';
import FloatingChatWidget from './components/FloatingChatWidget';
import FeedbackModal from './components/FeedbackModal';
import ContactHelp from './components/ContactHelp';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import './styles/index.css';

export default function App() {
  const [currentTab, setCurrentTab] = useState('directory'); // 'directory', 'contact', 'admin'
  const [lang, setLang] = useState('mr'); // 'mr' (default Marathi) or 'en'
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected scheme for detail modal
  const [selectedScheme, setSelectedScheme] = useState(null);

  // Floating Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatbotQuery, setChatbotQuery] = useState('');

  // Feedback modal item
  const [feedbackItem, setFeedbackItem] = useState(null);

  // Eligibility Wizard state
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Saved / Bookmarked Scheme IDs in LocalStorage
  const [savedSchemeIds, setSavedSchemeIds] = useState(() => {
    try {
      const stored = localStorage.getItem('saved_govt_schemes');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // High contrast mode state
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('saved_govt_schemes', JSON.stringify(savedSchemeIds));
    } catch (e) {
      console.error('Error storing saved schemes:', e);
    }
  }, [savedSchemeIds]);

  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast-mode');
    } else {
      document.body.classList.remove('high-contrast-mode');
    }
  }, [highContrast]);

  const fetchSchemes = async () => {
    try {
      const res = await fetch('/api/schemes');
      const data = await res.json();
      if (data.success && data.schemes) {
        setSchemes(data.schemes);
      }
    } catch (err) {
      console.error('Error fetching schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleToggleSaveScheme = (schemeId) => {
    setSavedSchemeIds((prev) => {
      if (prev.includes(schemeId)) {
        return prev.filter((id) => id !== schemeId);
      } else {
        return [...prev, schemeId];
      }
    });
  };

  const handleAskChatbot = (schemeName) => {
    const q = lang === 'mr'
      ? `${schemeName} या योजनेबद्दल माहिती सांगा आणि आवश्यक कागदपत्रे काय आहेत?`
      : `Tell me about ${schemeName} scheme and required documents?`;

    setChatbotQuery(q);
    setIsChatOpen(true);
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        setLang={setLang}
        onOpenWizard={() => setIsWizardOpen(true)}
        savedCount={savedSchemeIds.length}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        onShowSavedOnly={() => setShowSavedOnly(true)}
        onOpenChatbot={() => setIsChatOpen(true)}
      />

      {/* Main Container */}
      <main className="main-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              शासकीय योजनांचा डेटा लोड होत आहे...
            </div>
            <p>Loading verified schemes database...</p>
          </div>
        ) : (
          <>
            {currentTab === 'directory' && (
              <SchemeDirectory
                schemes={schemes}
                onSelectScheme={(s) => setSelectedScheme(s)}
                onAskChatbot={handleAskChatbot}
                lang={lang}
                savedSchemeIds={savedSchemeIds}
                onToggleSave={handleToggleSaveScheme}
                showSavedOnly={showSavedOnly}
                setShowSavedOnly={setShowSavedOnly}
              />
            )}

            {currentTab === 'contact' && (
              <ContactHelp lang={lang} />
            )}

            {currentTab === 'admin' && (
              <AdminDashboard
                schemes={schemes}
                onRefreshSchemes={fetchSchemes}
                lang={lang}
              />
            )}
          </>
        )}
      </main>

      {/* Floating HubSpot-Style Pop-up Chatbot Widget */}
      <FloatingChatWidget
        isOpen={isChatOpen}
        setIsOpen={setIsChatOpen}
        initialQuery={chatbotQuery}
        lang={lang}
        onReportFeedback={(item) => setFeedbackItem(item)}
      />

      {/* Modals */}
      <SchemeDetailModal
        scheme={selectedScheme}
        onClose={() => setSelectedScheme(null)}
        onAskChatbot={handleAskChatbot}
        lang={lang}
        savedSchemeIds={savedSchemeIds}
        onToggleSave={handleToggleSaveScheme}
      />

      <EligibilityWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        schemes={schemes}
        onSelectScheme={(s) => setSelectedScheme(s)}
        onAskChatbot={handleAskChatbot}
        lang={lang}
      />

      <FeedbackModal
        feedbackItem={feedbackItem}
        onClose={() => setFeedbackItem(null)}
        lang={lang}
      />

      {/* Footer */}
      <Footer lang={lang} />
    </div>
  );
}


