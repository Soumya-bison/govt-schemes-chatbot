import React, { useState, useEffect } from 'react';
import { Database, AlertTriangle, MessageSquare, CheckCircle, Plus, Edit, Trash2, ShieldCheck, RefreshCw, Save } from 'lucide-react';
import { translations } from '../data/translations';

export default function AdminDashboard({ schemes, onRefreshSchemes, lang }) {
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState('schemes'); // schemes, feedback, logs, config
  const [metrics, setMetrics] = useState({
    totalSchemes: schemes.length,
    totalFeedback: 0,
    pendingFeedback: 0,
    totalChatInteractions: 0
  });

  const [feedbackList, setFeedbackList] = useState([]);
  const [chatLogs, setChatLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Scheme Add/Edit Form Modal state
  const [isSchemeModalOpen, setIsSchemeModalOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  const [schemeForm, setSchemeForm] = useState({
    nameMr: '',
    nameEn: '',
    category: 'agriculture',
    categoryMr: 'कृषी विकास',
    categoryEn: 'Agriculture',
    objectiveMr: '',
    objectiveEn: '',
    benefitAmountMr: '',
    benefitAmountEn: '',
    officialLink: '',
    district: 'सर्व महाराष्ट्र'
  });

  // Config settings form state
  const [configForm, setConfigForm] = useState({
    helplineNumber: '',
    whatsappNumber: '',
    whatsappLink: '',
    email: ''
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Fetch Metrics
      const mRes = await fetch('/api/admin/metrics');
      const mData = await mRes.json();
      if (mData.success) setMetrics(mData.metrics);

      // Fetch Feedback Reports
      const fRes = await fetch('/api/admin/feedback');
      const fData = await fRes.json();
      if (fData.success) setFeedbackList(fData.feedback);

      // Fetch Chat Logs
      const lRes = await fetch('/api/admin/logs');
      const lData = await lRes.json();
      if (lData.success) setChatLogs(lData.logs);

      // Fetch Config
      const cRes = await fetch('/api/config');
      const cData = await cRes.json();
      if (cData.success && cData.config) {
        setConfigForm(cData.config);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickVerifyToday = async (schemeId) => {
    try {
      const res = await fetch(`/api/admin/schemes/${schemeId}/verify`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        onRefreshSchemes();
        loadAdminData();
      }
    } catch (err) {
      console.error('Verify error:', err);
    }
  };

  const handleDeleteScheme = async (schemeId) => {
    if (!window.confirm('तुम्हाला ही योजना खरोखर हटवायची आहे का? (Delete scheme?)')) return;
    try {
      const res = await fetch(`/api/admin/schemes/${schemeId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onRefreshSchemes();
        loadAdminData();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleStatusToggle = async (feedbackId, currentStatus) => {
    const nextStatus = currentStatus === 'Pending' ? 'Resolved' : 'Pending';
    try {
      const res = await fetch(`/api/admin/feedback/${feedbackId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        loadAdminData();
      }
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  const openAddSchemeModal = () => {
    setEditingScheme(null);
    setSchemeForm({
      nameMr: '',
      nameEn: '',
      category: 'agriculture',
      categoryMr: 'कृषी विकास',
      categoryEn: 'Agriculture',
      objectiveMr: '',
      objectiveEn: '',
      benefitAmountMr: '',
      benefitAmountEn: '',
      officialLink: 'https://maharashtra.gov.in',
      district: 'सर्व महाराष्ट्र'
    });
    setIsSchemeModalOpen(true);
  };

  const openEditSchemeModal = (scheme) => {
    setEditingScheme(scheme);
    setSchemeForm({ ...scheme });
    setIsSchemeModalOpen(true);
  };

  const handleSaveScheme = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...schemeForm,
        id: editingScheme ? editingScheme.id : undefined,
        eligibilityMr: editingScheme?.eligibilityMr || ["महाराष्ट्राचा मूळ रहिवासी असावा."],
        eligibilityEn: editingScheme?.eligibilityEn || ["Must be domicile resident of Maharashtra."],
        documentsMr: editingScheme?.documentsMr || ["आधार कार्ड", "उत्पन्नाचा दाखला", "बँक पासबुक"],
        documentsEn: editingScheme?.documentsEn || ["Aadhaar Card", "Income Certificate", "Bank Passbook"],
        applicationProcessMr: editingScheme?.applicationProcessMr || ["आपले सरकार किंवा महाडीबीटी पोर्टलवर ऑनलाइन अर्ज करा."],
        applicationProcessEn: editingScheme?.applicationProcessEn || ["Apply online via Aaple Sarkar or MahaDBT portal."]
      };

      const res = await fetch('/api/admin/schemes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setIsSchemeModalOpen(false);
        onRefreshSchemes();
        loadAdminData();
      }
    } catch (err) {
      console.error('Save scheme error:', err);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configForm)
      });
      const data = await res.json();
      if (data.success) {
        alert('संपर्क सेटिंग्ज अपडेट झाली! (Support configuration updated!)');
      }
    } catch (err) {
      console.error('Save config error:', err);
    }
  };

  return (
    <div className="admin-wrapper">
      <div className="hero-banner" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
        <h2>{t.adminTitle}</h2>
        <p>शासकीय योजना डेटाबेस, नागरिक तक्रारी व RAG AI प्रणालीचे व्यवस्थापन करा.</p>
      </div>

      {/* Metric Cards */}
      <div className="admin-metrics-grid">
        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#0284c7' }}>
            <Database size={24} />
          </div>
          <div className="metric-text">
            <h4>{t.metricsSchemes}</h4>
            <span>{schemes.length}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#dc2626' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="metric-text">
            <h4>{t.metricsPendingFb}</h4>
            <span style={{ color: '#dc2626' }}>{metrics.pendingFeedback}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#16a34a' }}>
            <MessageSquare size={24} />
          </div>
          <div className="metric-text">
            <h4>{t.metricsChats}</h4>
            <span>{metrics.totalChatInteractions}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs-row">
        <button
          className={`admin-tab-btn ${activeTab === 'schemes' ? 'active' : ''}`}
          onClick={() => setActiveTab('schemes')}
        >
          {t.tabSchemes}
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          {t.tabFeedback} ({metrics.pendingFeedback})
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          {t.tabLogs}
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          {t.tabConfig}
        </button>
      </div>

      {/* TAB 1: SCHEMES MANAGEMENT */}
      {activeTab === 'schemes' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>उपलब्ध योजना सूची ({schemes.length})</h3>
            <button className="btn-primary-civic" onClick={openAddSchemeModal}>
              <Plus size={16} />
              <span>{t.addNewSchemeBtn}</span>
            </button>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>योजनेचे नाव (Scheme Name)</th>
                  <th>श्रेणी (Category)</th>
                  <th>लाभ (Benefit)</th>
                  <th>अंतिम पडताळणी (Last Verified)</th>
                  <th>क्रिया (Actions)</th>
                </tr>
              </thead>
              <tbody>
                {schemes.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.nameMr}</strong>
                      <br />
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{s.nameEn}</span>
                    </td>
                    <td>{s.categoryMr}</td>
                    <td style={{ fontWeight: '600', color: '#16a34a' }}>{s.benefitAmountMr}</td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: '#0369a1', fontWeight: '600' }}>
                        {s.lastVerified}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className="btn-outline-civic"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.78rem' }}
                          title="आज पडताळणी झाली (Verify Today)"
                          onClick={() => handleQuickVerifyToday(s.id)}
                        >
                          <ShieldCheck size={14} />
                          <span>पडताळणी</span>
                        </button>

                        <button
                          className="btn-outline-civic"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.78rem' }}
                          onClick={() => openEditSchemeModal(s)}
                        >
                          <Edit size={14} />
                        </button>

                        <button
                          className="btn-outline-civic"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.78rem', color: '#dc2626', borderColor: '#fca5a5' }}
                          onClick={() => handleDeleteScheme(s.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FLAGGED FEEDBACK REPORTS */}
      {activeTab === 'feedback' && (
        <div>
          <h3>नागरिकांनी नोंदवलेल्या तक्रारी (Flagged Responses)</h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1rem' }}>
            बॉटच्या उत्तरात चूक वाटल्यास नागरिकांनी पाठवलेले अहवाल येथे दिसतात.
          </p>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>तारीख / वेळ</th>
                  <th>नागरिकाचा प्रश्न</th>
                  <th>तक्रारीचा प्रकार</th>
                  <th>बॉटचे उत्तर / स्पष्टीकरण</th>
                  <th>स्थिती (Status)</th>
                </tr>
              </thead>
              <tbody>
                {feedbackList.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                      कोणतीही तक्रार नोंदवलेली नाही. (No feedback reports)
                    </td>
                  </tr>
                ) : (
                  feedbackList.map((fb) => (
                    <tr key={fb.id}>
                      <td style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {new Date(fb.timestamp).toLocaleString('mr-IN')}
                      </td>
                      <td style={{ fontWeight: '600' }}>{fb.userQuery}</td>
                      <td>
                        <span style={{ background: '#fef2f2', color: '#dc2626', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: '600' }}>
                          {fb.issueType}
                        </span>
                        {fb.details && <div style={{ fontSize: '0.8rem', marginTop: '0.2rem', color: '#475569' }}>"{fb.details}"</div>}
                      </td>
                      <td style={{ fontSize: '0.82rem', maxWidth: '280px' }}>
                        <div style={{ maxHeight: '80px', overflowY: 'auto' }}>{fb.botAnswer}</div>
                      </td>
                      <td>
                        <button
                          className="btn-outline-civic"
                          style={{
                            padding: '0.3rem 0.6rem',
                            fontSize: '0.78rem',
                            background: fb.status === 'Pending' ? '#fef2f2' : '#f0fdf4',
                            color: fb.status === 'Pending' ? '#dc2626' : '#15803d',
                            borderColor: fb.status === 'Pending' ? '#fca5a5' : '#86efac'
                          }}
                          onClick={() => handleStatusToggle(fb.id, fb.status)}
                        >
                          <CheckCircle size={12} />
                          <span>{fb.status === 'Pending' ? t.statusPending : t.statusResolved}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CHAT LOGS */}
      {activeTab === 'logs' && (
        <div>
          <h3>RAG संभाषण नोंदी (Quality Assurance Logs)</h3>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>तारीख</th>
                  <th>नागरिकाचा प्रश्न</th>
                  <th>मॅच झाला का?</th>
                  <th>भाषा</th>
                </tr>
              </thead>
              <tbody>
                {chatLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {new Date(log.timestamp).toLocaleTimeString('mr-IN')}
                    </td>
                    <td style={{ fontWeight: '600' }}>{log.userQuery}</td>
                    <td>
                      <span style={{ color: log.matched ? '#16a34a' : '#dc2626', fontWeight: '600' }}>
                        {log.matched ? '✅ Match Found' : '❌ No Match (Fallback)'}
                      </span>
                    </td>
                    <td>{log.language === 'mr' ? 'मराठी' : 'English'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CONFIG MANAGEMENT */}
      {activeTab === 'config' && (
        <div style={{ maxWidth: '600px', background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3>संपर्क व हेल्पलाईन पर्याय अपडेट करा</h3>
          <form onSubmit={handleSaveConfig} style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label>टोल-फ्री हेल्पलाइन नंबर (Toll-Free Helpline):</label>
              <input
                type="text"
                value={configForm.helplineNumber}
                onChange={(e) => setConfigForm({ ...configForm, helplineNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>व्हॉट्सॲप नंबर (WhatsApp Number):</label>
              <input
                type="text"
                value={configForm.whatsappNumber}
                onChange={(e) => setConfigForm({ ...configForm, whatsappNumber: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>व्हॉट्सॲप लिंक (Direct WhatsApp URL):</label>
              <input
                type="text"
                value={configForm.whatsappLink}
                onChange={(e) => setConfigForm({ ...configForm, whatsappLink: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>मदत ई-मेल (Support Email):</label>
              <input
                type="email"
                value={configForm.email}
                onChange={(e) => setConfigForm({ ...configForm, email: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-primary-civic" style={{ marginTop: '1rem' }}>
              <Save size={16} />
              <span>बदल जतन करा (Save Settings)</span>
            </button>
          </form>
        </div>
      )}

      {/* Scheme Add/Edit Modal */}
      {isSchemeModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSchemeModalOpen(false)}>
          <div className="modal-content-card" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingScheme ? 'योजना सुधारित करा (Edit Scheme)' : 'नवीन योजना जोडा (Add Scheme)'}</h3>
            </div>
            <form onSubmit={handleSaveScheme} className="modal-body">
              <div className="form-group">
                <label>योजनेचे नाव (मराठी):</label>
                <input
                  type="text"
                  required
                  value={schemeForm.nameMr}
                  onChange={(e) => setSchemeForm({ ...schemeForm, nameMr: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>योजनेचे नाव (English):</label>
                <input
                  type="text"
                  required
                  value={schemeForm.nameEn}
                  onChange={(e) => setSchemeForm({ ...schemeForm, nameEn: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>योजनेचे उद्दिष्ट (मराठी):</label>
                <textarea
                  rows="2"
                  required
                  value={schemeForm.objectiveMr}
                  onChange={(e) => setSchemeForm({ ...schemeForm, objectiveMr: e.target.value })}
                ></textarea>
              </div>

              <div className="form-group">
                <label>मिळणारा लाभ (उदा. रु. १,५००/- दरमहा):</label>
                <input
                  type="text"
                  required
                  value={schemeForm.benefitAmountMr}
                  onChange={(e) => setSchemeForm({ ...schemeForm, benefitAmountMr: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>अधिकृत संकेतस्थळ (Official Link):</label>
                <input
                  type="url"
                  required
                  value={schemeForm.officialLink}
                  onChange={(e) => setSchemeForm({ ...schemeForm, officialLink: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn-outline-civic" onClick={() => setIsSchemeModalOpen(false)}>
                  रद्द करा
                </button>
                <button type="submit" className="btn-primary-civic">
                  जतन करा (Save Scheme)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
