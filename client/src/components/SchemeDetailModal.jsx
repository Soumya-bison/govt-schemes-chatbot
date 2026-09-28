import React from 'react';
import { X, CheckCircle, FileText, ExternalLink, Calendar, Users, Award, ShieldAlert, Send, Printer, Share2, Star } from 'lucide-react';
import { translations } from '../data/translations';

export default function SchemeDetailModal({ scheme, onClose, onAskChatbot, lang, savedSchemeIds = [], onToggleSave }) {
  if (!scheme) return null;
  const t = translations[lang];

  const name = lang === 'mr' ? scheme.nameMr : scheme.nameEn;
  const category = lang === 'mr' ? scheme.categoryMr : scheme.categoryEn;
  const objective = lang === 'mr' ? scheme.objectiveMr : scheme.objectiveEn;
  const benefit = lang === 'mr' ? scheme.benefitAmountMr : scheme.benefitAmountEn;
  const eligibility = lang === 'mr' ? scheme.eligibilityMr : scheme.eligibilityEn;
  const documents = lang === 'mr' ? scheme.documentsMr : scheme.documentsEn;
  const process = lang === 'mr' ? scheme.applicationProcessMr : scheme.applicationProcessEn;
  const validity = lang === 'mr' ? scheme.validityPeriodMr : scheme.validityPeriodEn;
  const limitations = lang === 'mr' ? scheme.limitationsMr : scheme.limitationsEn;
  const isSaved = savedSchemeIds.includes(scheme.id);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const docs = documents || [];
    const text = `📌 *${name}*\n\n💰 *लाभ:* ${benefit}\n\n📄 *आवश्यक कागदपत्रे:*\n${docs.map(d => `• ${d}`).join('\n')}\n\nअधिकृत माहितीसाठी महाराष्ट्र शासन योजना पोर्टलला भेट द्या.`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="category-tag" style={{ background: '#38bdf8', color: '#0369a1' }}>
              {category}
            </span>
            <h3 style={{ marginTop: '0.4rem' }}>{name}</h3>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className={`bookmark-btn ${isSaved ? 'active' : ''}`}
              onClick={() => onToggleSave && onToggleSave(scheme.id)}
              title={isSaved ? "योजना जतन झाली आहे" : "योजना जतन करा"}
              style={{ color: isSaved ? '#eab308' : '#ffffff' }}
            >
              <Star size={20} fill={isSaved ? '#eab308' : 'none'} />
            </button>
            <button className="modal-close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {/* Benefit Highlight Box */}
          <div className="benefit-badge-box" style={{ padding: '0.85rem 1rem', fontSize: '0.95rem' }}>
            <Award size={18} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />
            <strong>{t.benefitLabel}</strong> {benefit}
          </div>

          {/* Objective */}
          <div className="modal-section">
            <h4>📌 उद्दिष्ट (Objective)</h4>
            <p>{objective}</p>
          </div>

          {/* Eligibility */}
          <div className="modal-section">
            <h4>
              <CheckCircle size={16} style={{ color: '#16a34a', verticalAlign: 'middle', marginRight: '0.3rem' }} />
              {t.eligibilityLabel}
            </h4>
            <ul>
              {eligibility && eligibility.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Documents */}
          <div className="modal-section">
            <h4>
              <FileText size={16} style={{ color: '#2563eb', verticalAlign: 'middle', marginRight: '0.3rem' }} />
              {t.documentsLabel}
            </h4>
            <ul>
              {documents && documents.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Application Steps */}
          <div className="modal-section">
            <h4>📝 अर्ज प्रक्रिया (How to Apply)</h4>
            <ul>
              {process && process.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          </div>

          {/* Validity & Exclusions */}
          <div className="modal-section" style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>मुदत/कालावधी:</strong> {validity}
            </div>
            {limitations && limitations.length > 0 && (
              <div>
                <strong style={{ color: '#dc2626' }}>
                  <ShieldAlert size={14} style={{ verticalAlign: 'middle', marginRight: '0.2rem' }} />
                  अटी / अपात्रता नियम:
                </strong>
                <ul style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                  {limitations.map((lim, idx) => (
                    <li key={idx}>{lim}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Meta Verification & Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
            <div className="verification-footer">
              <Calendar size={14} />
              <span>{t.lastVerified} {scheme.lastVerified}</span>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                className="btn-outline-civic"
                onClick={handlePrint}
                title="प्रिंट करा / PDF जतन करा"
              >
                <Printer size={14} />
                <span>प्रिंट / PDF</span>
              </button>

              <button
                className="btn-whatsapp"
                onClick={handleWhatsAppShare}
              >
                <Share2 size={14} />
                <span>शेअर करा</span>
              </button>

              <button
                className="btn-outline-civic"
                onClick={() => {
                  onClose();
                  onAskChatbot(name);
                }}
              >
                <Send size={14} />
                <span>{t.askBotAboutThis}</span>
              </button>

              {scheme.officialLink && (
                <a
                  href={scheme.officialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary-civic"
                  style={{ textDecoration: 'none' }}
                >
                  <span>{t.officialLink}</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

