import React, { useState } from 'react';
import { X, AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import { translations } from '../data/translations';

export default function FeedbackModal({ feedbackItem, onClose, lang }) {
  if (!feedbackItem) return null;
  const t = translations[lang];

  const [issueType, setIssueType] = useState('Wrong Documents');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: feedbackItem.userQuery,
          botAnswer: feedbackItem.botAnswer,
          issueType,
          details,
          schemeId: feedbackItem.schemeId || null
        })
      });

      const data = await res.json();
      if (data.success) {
        setIsSubmitted(true);
        setTimeout(() => {
          onClose();
        }, 2200);
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ background: '#7f1d1d' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} style={{ color: '#fca5a5' }} />
            <h3>{t.feedbackTitle}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {isSubmitted ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <CheckCircle2 size={48} style={{ color: '#16a34a', margin: '0 auto 1rem auto' }} />
              <h4 style={{ color: '#14532d', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                {lang === 'mr' ? 'तक्रार प्राप्त झाली!' : 'Report Received!'}
              </h4>
              <p style={{ color: '#475569', fontSize: '0.9rem' }}>
                {t.feedbackSuccessMsg}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '1rem' }}>
                {t.feedbackSubtitle}
              </p>

              {/* User Query Preview */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <strong>प्रश्न (Query):</strong> {feedbackItem.userQuery}
              </div>

              {/* Issue Type Select */}
              <div className="form-group">
                <label>{t.issueTypeLabel}</label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  required
                >
                  <option value="Wrong Documents">{t.issueWrongDocs}</option>
                  <option value="Outdated Info">{t.issueOutdated}</option>
                  <option value="Incomplete Eligibility">{t.issueWrongEligibility}</option>
                  <option value="Unclear Steps">{t.issueUnclearApp}</option>
                  <option value="Other">{t.issueOther}</option>
                </select>
              </div>

              {/* Additional Details */}
              <div className="form-group">
                <label>{t.detailsLabel}</label>
                <textarea
                  rows="3"
                  placeholder={t.detailsPlaceholder}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className="btn-outline-civic"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  {t.cancel}
                </button>

                <button
                  type="submit"
                  className="btn-primary-civic"
                  style={{ background: '#dc2626' }}
                  disabled={isSubmitting}
                >
                  <Send size={14} />
                  <span>{isSubmitting ? 'पाठवत आहे...' : t.submitFeedback}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
