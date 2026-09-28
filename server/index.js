import "dotenv/config";
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { processQuery } from './RAGEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const SCHEMES_FILE = path.join(DATA_DIR, 'schemes.json');
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback.json');
const CHAT_LOGS_FILE = path.join(DATA_DIR, 'chat_logs.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Utility helpers for reading and writing JSON files
function readJson(filePath, defaultData = []) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultData;
  }
}

function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// -------------------------------------------------------------
// PUBLIC API ENDPOINTS
// -------------------------------------------------------------

// Get all schemes with optional search & filter
app.get('/api/schemes', (req, res) => {
  const schemes = readJson(SCHEMES_FILE);
  const { category, beneficiary, search, district } = req.query;

  let filtered = schemes;

  if (category && category !== 'all') {
    filtered = filtered.filter(s => s.category === category);
  }

  if (beneficiary && beneficiary !== 'all') {
    filtered = filtered.filter(s => s.beneficiaries && s.beneficiaries.includes(beneficiary));
  }

  if (district && district !== 'all') {
    filtered = filtered.filter(s => s.district && (s.district.includes(district) || s.district.includes('All Maharashtra') || s.district.includes('सर्व महाराष्ट्र')));
  }

  if (search) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(s =>
      s.nameMr.toLowerCase().includes(q) ||
      s.nameEn.toLowerCase().includes(q) ||
      s.objectiveMr.toLowerCase().includes(q) ||
      s.objectiveEn.toLowerCase().includes(q) ||
      (s.beneficiariesMr && s.beneficiariesMr.some(b => b.toLowerCase().includes(q)))
    );
  }

  res.json({
    success: true,
    total: filtered.length,
    schemes: filtered
  });
});

// Get scheme by ID
app.get('/api/schemes/:id', (req, res) => {
  const schemes = readJson(SCHEMES_FILE);
  const scheme = schemes.find(s => s.id === req.params.id);
  if (!scheme) {
    return res.status(404).json({ success: false, message: 'Scheme not found' });
  }
  res.json({ success: true, scheme });
});

// Chatbot RAG Query Endpoint
app.post('/api/chat', async (req, res) => {
  const { query, language = 'mr', consentGiven = true } = req.body;

  if (!query) {
    return res.status(400).json({
      success: false,
      message: 'Query is required'
    });
  }

  try {
    // Process through RAG Engine
    const result = await processQuery(query, language);

    // Log conversation if consent is given
    if (consentGiven) {
      const logs = readJson(CHAT_LOGS_FILE);

      const newLog = {
        id: `chat-${Date.now()}`,
        timestamp: new Date().toISOString(),
        userQuery: query,
        botAnswer: result.answer,
        matched: result.isMatched,
        sourcesCount: result.sources.length,
        language
      };

      logs.unshift(newLog);
      writeJson(CHAT_LOGS_FILE, logs);
    }

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Chat processing error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to process your request.'
    });
  }
});

// User Feedback / Report Error Endpoint
app.post('/api/feedback', (req, res) => {
  const { userQuery, botAnswer, issueType, details, schemeId } = req.body;

  if (!userQuery || !issueType) {
    return res.status(400).json({ success: false, message: 'Missing required feedback fields' });
  }

  const feedbackList = readJson(FEEDBACK_FILE);
  const newFeedback = {
    id: `fb-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userQuery,
    botAnswer,
    issueType,
    details: details || '',
    schemeId: schemeId || null,
    status: 'Pending' // Pending, Reviewed, Fixed
  };

  feedbackList.unshift(newFeedback);
  writeJson(FEEDBACK_FILE, feedbackList);

  res.json({
    success: true,
    messageMr: 'आपला अभिप्राय यशस्वीरीत्या नोंदवला गेला आहे. प्रशासक लवकरच याची पडताळणी करतील.',
    messageEn: 'Your feedback has been successfully logged. Administrators will review it shortly.'
  });
});

// Config / Contact Info Endpoint
app.get('/api/config', (req, res) => {
  const config = readJson(CONFIG_FILE, {});
  res.json({ success: true, config });
});

// -------------------------------------------------------------
// ADMIN ENDPOINTS
// -------------------------------------------------------------

// Admin Dashboard Summary Metrics
app.get('/api/admin/metrics', (req, res) => {
  const schemes = readJson(SCHEMES_FILE);
  const feedback = readJson(FEEDBACK_FILE);
  const chatLogs = readJson(CHAT_LOGS_FILE);

  const pendingFeedback = feedback.filter(f => f.status === 'Pending').length;

  res.json({
    success: true,
    metrics: {
      totalSchemes: schemes.length,
      totalFeedback: feedback.length,
      pendingFeedback,
      totalChatInteractions: chatLogs.length,
      lastUpdated: new Date().toISOString()
    }
  });
});

// Admin Get Feedback Log
app.get('/api/admin/feedback', (req, res) => {
  const feedback = readJson(FEEDBACK_FILE);
  res.json({ success: true, feedback });
});

// Admin Update Feedback Status
app.post('/api/admin/feedback/:id/status', (req, res) => {
  const { status } = req.body;
  const feedback = readJson(FEEDBACK_FILE);

  const index = feedback.findIndex(f => f.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Feedback record not found' });
  }

  feedback[index].status = status;
  writeJson(FEEDBACK_FILE, feedback);

  res.json({ success: true, feedback: feedback[index] });
});

// Admin Create or Update Scheme
app.post('/api/admin/schemes', (req, res) => {
  const schemeData = req.body;
  const schemes = readJson(SCHEMES_FILE);

  if (!schemeData.nameMr || !schemeData.nameEn) {
    return res.status(400).json({ success: false, message: 'Scheme name is required in both languages' });
  }

  if (schemeData.id) {
    // Update existing
    const index = schemes.findIndex(s => s.id === schemeData.id);
    if (index !== -1) {
      schemes[index] = {
        ...schemes[index],
        ...schemeData,
        lastVerified: new Date().toISOString().split('T')[0]
      };
      writeJson(SCHEMES_FILE, schemes);
      return res.json({ success: true, message: 'Scheme updated successfully', scheme: schemes[index] });
    }
  }

  // Create new scheme
  const newScheme = {
    id: `scheme-${String(schemes.length + 1).padStart(3, '0')}`,
    ...schemeData,
    lastVerified: new Date().toISOString().split('T')[0]
  };

  schemes.unshift(newScheme);
  writeJson(SCHEMES_FILE, schemes);

  res.json({ success: true, message: 'New scheme added successfully', scheme: newScheme });
});

// Admin Quick Verify Scheme
app.post('/api/admin/schemes/:id/verify', (req, res) => {
  const schemes = readJson(SCHEMES_FILE);
  const index = schemes.findIndex(s => s.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Scheme not found' });
  }

  schemes[index].lastVerified = new Date().toISOString().split('T')[0];
  writeJson(SCHEMES_FILE, schemes);

  res.json({ success: true, message: 'Scheme verification date updated', scheme: schemes[index] });
});

// Admin Delete Scheme
app.delete('/api/admin/schemes/:id', (req, res) => {
  let schemes = readJson(SCHEMES_FILE);
  const initialLength = schemes.length;
  schemes = schemes.filter(s => s.id !== req.params.id);

  if (schemes.length === initialLength) {
    return res.status(404).json({ success: false, message: 'Scheme not found' });
  }

  writeJson(SCHEMES_FILE, schemes);
  res.json({ success: true, message: 'Scheme deleted' });
});

// Admin Get Chat Logs
app.get('/api/admin/logs', (req, res) => {
  const logs = readJson(CHAT_LOGS_FILE);
  res.json({ success: true, logs });
});

// Admin Update Config
app.post('/api/admin/config', (req, res) => {
  const newConfig = req.body;
  writeJson(CONFIG_FILE, newConfig);
  res.json({ success: true, message: 'Support configuration updated', config: newConfig });
});

// Serve frontend dist static assets
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Govt Schemes Marathi API Server running on port ${PORT}`);
});
