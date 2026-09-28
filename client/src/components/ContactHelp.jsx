import React, { useState, useEffect } from 'react';
import { PhoneCall, MessageCircle, Mail, Clock, Send, ExternalLink, CheckCircle, HelpCircle } from 'lucide-react';
import { translations } from '../data/translations';

export default function ContactHelp({ lang }) {
  const t = translations[lang];

  const [config, setConfig] = useState({
    helplineNumber: "1800-120-8040",
    whatsappNumber: "+91 98230 00000",
    whatsappLink: "https://wa.me/919823000000",
    email: "help.yojana@maharashtra.gov.in",
    workingHoursMr: "सोमवार ते शनिवार (सकाळी १०:०० ते संध्याकाळी ६:००)",
    workingHoursEn: "Monday to Saturday (10:00 AM to 6:00 PM)",
    officialPortals: []
  });

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [question, setQuestion] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          setConfig(data.config);
        }
      })
      .catch((err) => console.error('Error loading config:', err));
  }, []);

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    if (!name || !phone || !question) return;

    setSubmitted(true);
    setName('');
    setPhone('');
    setQuestion('');
  };

  return (
    <div className="contact-help-wrapper">
      <div className="hero-banner" style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0f2942 100%)' }}>
        <h2>{t.contactTitle}</h2>
        <p>{t.contactSubtitle}</p>
      </div>

      {/* Grid of Channels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Toll-Free Helpline */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', background: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: '#1d4ed8' }}>
              <PhoneCall size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', color: 'var(--primary-navy)' }}>{t.helplineHeader}</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>थेट टेलिफोनिक मार्गदर्शन</p>
            </div>
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1d4ed8', marginBottom: '0.5rem' }}>
            {config.helplineNumber}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Clock size={14} />
            <span>{lang === 'mr' ? config.workingHoursMr : config.workingHoursEn}</span>
          </div>
        </div>

        {/* WhatsApp Business Chat */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: '#15803d' }}>
              <MessageCircle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', color: 'var(--primary-navy)' }}>{t.whatsappHeader}</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>अधिकृत व्हॉट्सॲप सहाय्य</p>
            </div>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#15803d', marginBottom: '0.75rem' }}>
            {config.whatsappNumber}
          </div>
          <a
            href={config.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-civic"
            style={{ display: 'inline-flex', textDecoration: 'none', color: '#15803d', borderColor: '#15803d' }}
          >
            <span>व्हॉट्सॲपवर मेसेज करा</span>
            <ExternalLink size={14} />
          </a>
        </div>

        {/* Official Portals Directory */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', background: '#fae8ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: '#86198f' }}>
              <Mail size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', color: 'var(--primary-navy)' }}>ईमेल व अधिकृत पोर्टल्स</h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{config.email}</p>
            </div>
          </div>
          <ul style={{ paddingLeft: '1rem', fontSize: '0.85rem' }}>
            {(config.officialPortals || []).map((p, idx) => (
              <li key={idx} style={{ marginBottom: '0.35rem' }}>
                <a href={p.url} target="_blank" rel="noopener noreferrer">
                  {lang === 'mr' ? p.nameMr : p.nameEn}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Direct Inquiry Form */}
      <div style={{ background: 'white', padding: '1.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)', maxWidth: '720px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-navy)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HelpCircle size={20} style={{ color: 'var(--secondary-teal)' }} />
          <span>{t.directInquiryHeader}</span>
        </h3>

        {submitted ? (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
            <CheckCircle size={36} style={{ color: '#16a34a', margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ color: '#14532d', fontSize: '1.05rem', marginBottom: '0.25rem' }}>संदेश प्राप्त झाला!</h4>
            <p style={{ color: '#166534', fontSize: '0.9rem' }}>{t.inquirySubmitted}</p>
          </div>
        ) : (
          <form onSubmit={handleInquirySubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label>{t.yourName}</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. रमेश पाटील"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>{t.mobileNo}</label>
                <input
                  type="tel"
                  required
                  placeholder="उदा. 98230XXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>{t.yourQuestion}</label>
              <textarea
                rows="4"
                required
                placeholder="योजनेचे नाव आणि तुमची अडचण येथे सविस्तर लिहा..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              ></textarea>
            </div>

            <button type="submit" className="btn-primary-civic" style={{ marginTop: '0.5rem' }}>
              <Send size={16} />
              <span>{t.submitInquiry}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
