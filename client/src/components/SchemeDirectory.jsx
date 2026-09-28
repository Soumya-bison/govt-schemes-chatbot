import React, { useState } from 'react';
import { Search, Filter, Calendar, Award, ExternalLink, ArrowRight, CheckCircle, RefreshCw, Star, Share2 } from 'lucide-react';
import { translations } from '../data/translations';

export default function SchemeDirectory({ schemes, onSelectScheme, onAskChatbot, lang, savedSchemeIds = [], onToggleSave, showSavedOnly = false, setShowSavedOnly }) {
  const t = translations[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const beneficiaryOptions = [
    { id: 'all', label: t.allBeneficiaries },
    ...Object.entries(t.beneficiaries || {}).map(([id, label]) => ({ id, label }))
  ];

  const categoryOptions = [
    { id: 'all', label: t.allCategories },
    ...Object.entries(t.categories || {}).map(([id, label]) => ({ id, label }))
  ];

  const handleWhatsAppShare = (scheme) => {
    const name = lang === 'mr' ? scheme.nameMr : scheme.nameEn;
    const benefit = lang === 'mr' ? scheme.benefitAmountMr : scheme.benefitAmountEn;
    const docs = (lang === 'mr' ? scheme.documentsMr : scheme.documentsEn) || [];
    
    const text = `📌 *${name}*\n\n💰 *लाभ:* ${benefit}\n\n📄 *आवश्यक कागदपत्रे:*\n${docs.map(d => `• ${d}`).join('\n')}\n\nअधिक माहितीसाठी महाराष्ट्र शासन योजना पोर्टलला भेट द्या.`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Helper to handle filter state resets
  const handleBeneficiaryChange = (val) => {
    setSelectedBeneficiary(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (val) => {
    setSelectedCategory(val);
    setCurrentPage(1);
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  // Filtering logic
  const filteredSchemes = schemes.filter((scheme) => {
    // Saved Filter
    if (showSavedOnly && !savedSchemeIds.includes(scheme.id)) {
      return false;
    }

    // Beneficiary filter
    if (selectedBeneficiary !== 'all') {
      if (!scheme.beneficiaries || !scheme.beneficiaries.includes(selectedBeneficiary)) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory !== 'all') {
      if (scheme.category !== selectedCategory) {
        return false;
      }
    }

    // Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchNameMr = scheme.nameMr && scheme.nameMr.toLowerCase().includes(q);
      const matchNameEn = scheme.nameEn && scheme.nameEn.toLowerCase().includes(q);
      const matchObjMr = scheme.objectiveMr && scheme.objectiveMr.toLowerCase().includes(q);
      const matchObjEn = scheme.objectiveEn && scheme.objectiveEn.toLowerCase().includes(q);
      const matchBenefitMr = scheme.benefitAmountMr && scheme.benefitAmountMr.toLowerCase().includes(q);

      if (!matchNameMr && !matchNameEn && !matchObjMr && !matchObjEn && !matchBenefitMr) {
        return false;
      }
    }

    return true;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredSchemes.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSchemes = filteredSchemes.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="directory-wrapper">
      {/* Hero Header */}
      <div className="hero-banner">
        <h2>{t.heroTitle}</h2>
        <p>{t.heroSubtitle}</p>
      </div>

      {/* Search & Filter Controls */}
      <div className="search-filter-card">
        <div className="search-input-wrapper">
          <Search size={18} className="search-input-icon" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Beneficiary Filter Pills */}
        <div style={{ marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
            {t.filterBeneficiary}
          </span>
          <div className="filter-pills-row">
            {beneficiaryOptions.map((b) => (
              <button
                key={b.id}
                className={`filter-pill ${selectedBeneficiary === b.id ? 'active' : ''}`}
                onClick={() => handleBeneficiaryChange(b.id)}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Dropdown & Reset */}
        <div className="secondary-filters-grid">
          <div className="filter-select-group">
            <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>
              {t.filterCategory}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary-navy)' }}>
                {t.matchingSchemes} {filteredSchemes.length}
              </span>

              {/* Saved filter pill */}
              <button
                className={`filter-pill ${showSavedOnly ? 'active' : ''}`}
                onClick={() => {
                  if (setShowSavedOnly) setShowSavedOnly(!showSavedOnly);
                  setCurrentPage(1);
                }}
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}
              >
                ⭐ {lang === 'mr' ? 'केवळ जतन केलेल्या योजना' : 'Saved Only'} ({savedSchemeIds.length})
              </button>
            </div>

            {(selectedBeneficiary !== 'all' || selectedCategory !== 'all' || searchQuery !== '' || showSavedOnly) && (
              <button
                className="btn-outline-civic"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                onClick={() => {
                  setSelectedBeneficiary('all');
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setCurrentPage(1);
                  if (setShowSavedOnly) setShowSavedOnly(false);
                }}
              >
                <RefreshCw size={12} />
                <span>{t.resetFilters}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scheme Cards Grid */}
      {filteredSchemes.length === 0 ? (
        <div style={{ background: 'white', padding: '3rem', textAlign: 'center', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '1.1rem', color: '#64748b' }}>{t.noSchemesFound}</p>
        </div>
      ) : (
        <>
          <div className="schemes-grid">
            {paginatedSchemes.map((scheme) => {
              const name = lang === 'mr' ? scheme.nameMr : scheme.nameEn;
              const category = lang === 'mr' ? scheme.categoryMr : scheme.categoryEn;
              const objective = lang === 'mr' ? scheme.objectiveMr : scheme.objectiveEn;
              const benefit = lang === 'mr' ? scheme.benefitAmountMr : scheme.benefitAmountEn;
              const isSaved = savedSchemeIds.includes(scheme.id);

              return (
                <div key={scheme.id} className="scheme-card">
                  <div>
                    <div className="scheme-card-header">
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span className="category-tag">{category}</span>
                        <span className="district-tag">{scheme.district || 'सर्व महाराष्ट्र'}</span>
                      </div>

                      {/* Bookmark star */}
                      <button
                        className={`bookmark-btn ${isSaved ? 'active' : ''}`}
                        onClick={() => onToggleSave && onToggleSave(scheme.id)}
                        title={isSaved ? "योजना जतन झाली आहे (Saved)" : "योजना जतन करा (Save Scheme)"}
                      >
                        <Star size={18} fill={isSaved ? '#eab308' : 'none'} color={isSaved ? '#eab308' : '#94a3b8'} />
                      </button>
                    </div>

                    <h3 className="scheme-title">{name}</h3>

                    <div className="benefit-badge-box">
                      <Award size={14} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                      {benefit}
                    </div>

                    <p className="scheme-objective">{objective}</p>
                  </div>

                  <div>
                    <div className="verification-footer">
                      <CheckCircle size={14} style={{ color: '#16a34a' }} />
                      <span>{t.lastVerified} {scheme.lastVerified}</span>
                    </div>

                    <div className="card-action-btns">
                      <button
                        className="btn-primary-civic"
                        onClick={() => onSelectScheme(scheme)}
                      >
                        <span>{t.viewDetails}</span>
                        <ArrowRight size={14} />
                      </button>

                      <button
                        className="btn-whatsapp"
                        onClick={() => handleWhatsAppShare(scheme)}
                        title="व्हॉट्सॲपवर पाठवा (Share via WhatsApp)"
                        style={{ padding: '0.6rem 0.6rem' }}
                      >
                        <Share2 size={14} />
                      </button>

                      <button
                        className="btn-outline-civic"
                        onClick={() => onAskChatbot(name)}
                        title={t.askBotAboutThis}
                      >
                        <span>प्रश्न विचारा</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              <button
                className="btn-outline-civic"
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage(p => Math.max(1, p - 1));
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                {lang === 'mr' ? '◀ मागील' : '◀ Prev'}
              </button>

              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => {
                      setCurrentPage(pageNum);
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: currentPage === pageNum ? 'var(--primary-navy)' : 'white',
                      color: currentPage === pageNum ? 'white' : 'var(--text-main)',
                      fontWeight: currentPage === pageNum ? '700' : '500',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                className="btn-outline-civic"
                disabled={currentPage === totalPages}
                onClick={() => {
                  setCurrentPage(p => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                {lang === 'mr' ? 'पुढील ▶' : 'Next ▶'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

