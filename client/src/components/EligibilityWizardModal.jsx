import React, { useState } from 'react';
import { X, CheckCircle, ArrowRight, ArrowLeft, Award, Sparkles, User, Briefcase, DollarSign, MapPin, Send } from 'lucide-react';
import { translations } from '../data/translations';

export default function EligibilityWizardModal({ isOpen, onClose, schemes, onSelectScheme, onAskChatbot, lang }) {
  if (!isOpen) return null;
  const t = translations[lang];

  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('farmers');
  const [ageGroup, setAgeGroup] = useState('18-40');
  const [incomeSlab, setIncomeSlab] = useState('under_1lakh');
  const [district, setDistrict] = useState('all');

  const categories = [
    { id: 'farmers', titleMr: '🌾 शेतकरी (Farmers)', titleEn: '🌾 Farmers', icon: Briefcase },
    { id: 'women', titleMr: '👩 महिला व मुली (Women & Girls)', titleEn: '👩 Women & Girls', icon: User },
    { id: 'students', titleMr: '🎓 विद्यार्थी (Students)', titleEn: '🎓 Students', icon: User },
    { id: 'senior_citizens', titleMr: '👴 ज्येष्ठ नागरिक (Senior Citizens)', titleEn: '👴 Senior Citizens', icon: User },
    { id: 'bpl', titleMr: '🏠 गरजू / BPL कुटुंब (BPL Families)', titleEn: '🏠 BPL Families', icon: Briefcase }
  ];

  const ageOptions = [
    { id: 'below_18', labelMr: '१८ वर्षांपेक्षा कमी (Below 18)', labelEn: 'Below 18' },
    { id: '18-40', labelMr: '१८ ते ४० वर्षे (18 - 40 Years)', labelEn: '18 - 40 Years' },
    { id: '40-60', labelMr: '४० ते ६० वर्षे (40 - 60 Years)', labelEn: '40 - 60 Years' },
    { id: 'above_60', labelMr: '६० वर्षांपेक्षा जास्त (Above 60)', labelEn: 'Above 60' }
  ];

  const incomeOptions = [
    { id: 'under_1lakh', labelMr: 'रु. १ लाखांपेक्षा कमी', labelEn: 'Under ₹1 Lakh/yr' },
    { id: '1lakh_2.5lakh', labelMr: 'रु. १ लाख ते २.५ लाख', labelEn: '₹1 Lakh - ₹2.5 Lakh/yr' },
    { id: '2.5lakh_8lakh', labelMr: 'रु. २.५ लाख ते ८ लाख', labelEn: '₹2.5 Lakh - ₹8 Lakh/yr' },
    { id: 'any', labelMr: 'कोणतेही उत्पन्न (Any Income)', labelEn: 'Any Income' }
  ];

  // Calculate matching schemes based on wizard criteria
  const matchedSchemes = schemes.filter((s) => {
    // Match beneficiary category
    if (selectedCategory && s.beneficiaries) {
      if (!s.beneficiaries.includes(selectedCategory) && selectedCategory !== 'bpl') {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-card" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header" style={{ background: 'linear-gradient(135deg, #0f766e, #0f2942)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={22} style={{ color: '#fb923c' }} />
            <div>
              <h3>{lang === 'mr' ? 'पात्रता तपासा (Eligibility Wizard)' : 'Eligibility Checker Wizard'}</h3>
              <p style={{ fontSize: '0.78rem', color: '#93c5fd', margin: 0 }}>
                {lang === 'mr' ? '३ सोप्या स्टेप्समध्ये तुमच्यासाठी पात्र असणाऱ्या योजना शोधा' : 'Find scheme matches tailored for you in 3 simple steps'}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {/* Progress Nodes */}
          <div className="wizard-progress-bar">
            <div className={`wizard-step-node ${step >= 1 ? (step === 1 ? 'active' : 'completed') : ''}`}>1</div>
            <div className={`wizard-step-node ${step >= 2 ? (step === 2 ? 'active' : 'completed') : ''}`}>2</div>
            <div className={`wizard-step-node ${step >= 3 ? (step === 3 ? 'active' : 'completed') : ''}`}>3</div>
            <div className={`wizard-step-node ${step === 4 ? 'active' : ''}`}>4</div>
          </div>

          {/* STEP 1: CATEGORY */}
          {step === 1 && (
            <div>
              <h4 style={{ fontSize: '1.05rem', color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
                १. तुम्ही कोणत्या प्रवर्गातील (वर्ग) नागरिक आहात?
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                Select your primary beneficiary group:
              </p>

              <div className="wizard-option-grid">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className={`wizard-option-card ${selectedCategory === c.id ? 'selected' : ''}`}
                    onClick={() => setSelectedCategory(c.id)}
                  >
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--primary-navy)' }}>
                      {lang === 'mr' ? c.titleMr : c.titleEn}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: AGE GROUP */}
          {step === 2 && (
            <div>
              <h4 style={{ fontSize: '1.05rem', color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
                २. तुमचे वय काय आहे? (Select Age Group)
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                वयोमर्यादेनुसार पात्रता निकष निश्चित होतात:
              </p>

              <div className="wizard-option-grid">
                {ageOptions.map((a) => (
                  <div
                    key={a.id}
                    className={`wizard-option-card ${ageGroup === a.id ? 'selected' : ''}`}
                    onClick={() => setAgeGroup(a.id)}
                  >
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--primary-navy)' }}>
                      {lang === 'mr' ? a.labelMr : a.labelEn}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: INCOME SLAB */}
          {step === 3 && (
            <div>
              <h4 style={{ fontSize: '1.05rem', color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
                ३. कौटुंबिक वार्षिक उत्पन्न किती आहे? (Annual Income)
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                उत्पन्नाच्या दाखल्यानुसार (Income Certificate) पर्याय निवडा:
              </p>

              <div className="wizard-option-grid">
                {incomeOptions.map((inc) => (
                  <div
                    key={inc.id}
                    className={`wizard-option-card ${incomeSlab === inc.id ? 'selected' : ''}`}
                    onClick={() => setIncomeSlab(inc.id)}
                  >
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--primary-navy)' }}>
                      {lang === 'mr' ? inc.labelMr : inc.labelEn}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: MATCHED RESULTS */}
          {step === 4 && (
            <div>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ color: '#14532d', fontSize: '1.05rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle size={18} style={{ color: '#16a34a' }} />
                    <span>{lang === 'mr' ? 'अभिनंदन! तुमच्यासाठी योग्य योजना उपलब्ध आहेत.' : 'Matching Schemes Found!'}</span>
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#166534', marginTop: '0.2rem' }}>
                    {lang === 'mr' ? `एकूण ${matchedSchemes.length} योजनांच्या पात्रतेत तुम्ही बसता.` : `Total ${matchedSchemes.length} schemes matched your profile criteria.`}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                {matchedSchemes.map((scheme) => {
                  const name = lang === 'mr' ? scheme.nameMr : scheme.nameEn;
                  const benefit = lang === 'mr' ? scheme.benefitAmountMr : scheme.benefitAmountEn;

                  return (
                    <div key={scheme.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span className="match-score-badge">
                            <Sparkles size={12} />
                            <span>100% Match</span>
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{scheme.categoryMr}</span>
                        </div>
                        <h5 style={{ fontSize: '0.98rem', fontWeight: '700', color: 'var(--primary-navy)' }}>{name}</h5>
                        <p style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: '600', marginTop: '0.2rem' }}>
                          💰 {benefit}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className="btn-primary-civic"
                          style={{ padding: '0.4rem 0.7rem', fontSize: '0.8rem' }}
                          onClick={() => {
                            onClose();
                            onSelectScheme(scheme);
                          }}
                        >
                          {t.viewDetails}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
            {step > 1 ? (
              <button
                className="btn-outline-civic"
                onClick={() => setStep(step - 1)}
              >
                <ArrowLeft size={16} />
                <span>{lang === 'mr' ? 'मागे जा' : 'Back'}</span>
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                className="btn-primary-civic"
                onClick={() => setStep(step + 1)}
              >
                <span>{lang === 'mr' ? 'पुढील पायरी' : 'Next Step'}</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                className="btn-outline-civic"
                onClick={onClose}
              >
                <span>{lang === 'mr' ? 'पूर्ण (Close)' : 'Done'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
