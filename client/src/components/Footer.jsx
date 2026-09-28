import React from 'react';
import { Landmark, ShieldCheck } from 'lucide-react';
import { translations } from '../data/translations';

export default function Footer({ lang }) {
  const t = translations[lang];

  return (
    <footer className="civic-footer">
      <div className="footer-inner">
        <div style={{ maxWidth: '400px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'white', fontWeight: '700' }}>
            <Landmark size={20} style={{ color: '#38bdf8' }} />
            <span>{t.siteTitle}</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            {t.siteTagline} — नागरिक केंद्रित डिजिटल व्यासपीठ. महाराष्ट्रातील सर्व नागरिकांना शासकीय योजनांची सत्यापित व अचूक माहिती सहज मिळवून देणे हे आमचे उद्दिष्ट आहे.
          </p>
        </div>

        <div>
          <h4 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '0.9rem' }}>अधिकृत शासकीय पोर्टल्स</h4>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.82rem' }}>
            <li style={{ marginBottom: '0.3rem' }}>
              <a href="https://aaplesarkar.mahaonline.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8' }}>
                आपले सरकार पोर्टल (Aaple Sarkar)
              </a>
            </li>
            <li style={{ marginBottom: '0.3rem' }}>
              <a href="https://mahadbt.maharashtra.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8' }}>
                महाडीबीटी पोर्टल (MahaDBT)
              </a>
            </li>
            <li style={{ marginBottom: '0.3rem' }}>
              <a href="https://ladkibahin.maharashtra.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8' }}>
                लाडकी बहीण योजना पोर्टल
              </a>
            </li>
            <li>
              <a href="https://www.maharashtra.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8' }}>
                महाराष्ट्र शासन अधिकृत संकेतस्थळ
              </a>
            </li>
          </ul>
        </div>

        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(56, 189, 248, 0.1)', padding: '0.4rem 0.8rem', borderRadius: '6px', color: '#38bdf8', fontSize: '0.82rem', fontWeight: '600' }}>
            <ShieldCheck size={16} />
            <span>100% Verified Scheme Dataset</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.5rem' }}>
            ही प्रणाली केवळ अधिकृत शासन निर्णयांवर (GR) आधारित माहिती प्रदर्शित करते.
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        Connecting People to Government Schemes | सरकारी योजना जनतेशी जोडणारे व्यासपीठ © {new Date().getFullYear()}
      </div>
    </footer>
  );
}
