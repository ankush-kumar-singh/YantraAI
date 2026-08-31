/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup multer for mock uploads
const upload = multer({ dest: 'uploads/' });

// Seed datasets loaded from fixtures
const seedModels = require('../fixtures/models.json');
const seedTools = require('../fixtures/tools.json');
const seedKbSources = require('../fixtures/kbSources.json');
const seedConversations = require('../fixtures/conversations.json');

// In-memory data states
let inMemoryConversations = [...seedConversations];
let inMemoryModels = [...seedModels];
let inMemoryTools = [...seedTools];
let inMemoryKbSources = [...seedKbSources];

let inMemoryProjects = [
  {
    id: 'proj-coding',
    name: 'Coding & Architecture',
    description: 'Microservice design, Python sandbox scripts, and automated test runners.',
    color: '#3b82f6',
    icon: 'folder',
    systemPrompt: 'You are an expert systems engineer. Prioritize sandbox safety, type validation, and clean architecture.',
    createdAt: Date.now() - 86400000 * 3,
    filesCount: 6,
    statusSummary: '3 active, 1 awaiting approval'
  },
  {
    id: 'proj-research',
    name: 'Deep Research & Papers',
    description: 'Technical standards cross-referencing, ISO compliance, and RAG synthesis.',
    color: '#10b981',
    icon: 'folder',
    systemPrompt: 'Analyze technical literature with rigorous accuracy. Cite local vector chunks and reference SOP IDs.',
    createdAt: Date.now() - 86400000 * 5,
    filesCount: 12,
    statusSummary: '2 active, 0 awaiting approval'
  }
];

let inMemorySettings = {
  theme: 'dark',
  defaultModelId: 'model-reasoning-qwen',
  defaultMode: 'agent',
  autoRoutingEnabled: true,
  userName: 'Engineer Alex Mercer',
  userRole: 'Lead Engineer',
  density: 'comfortable',
  notifyOnApproval: true,
  notifyOnTaskCompletion: true,
  notifyOnModelLoad: false,
  retentionPolicy: 'indefinite',
  localEndpointUrl: 'http://localhost:11434',
  enableLocalApiBridge: false,
  streamSimulationSpeed: 18,
  soundEffects: false,
  codeWordWrap: true,
  showTokenStats: true,
  customSystemPrompt: 'You are Sentinel, a sovereign AI system running completely on-premise without external API dependencies.',
  temperature: 0.2,
  topP: 0.95,
  maxTokens: 4096,
  sandboxCpuCap: 4,
  sandboxMemoryCapMB: 8192,
  sandboxTimeoutSec: 120
};

let inMemoryAuditLog = Array.from({ length: 15 }, (_, i) => ({
  id: `audit-${i}`,
  timestamp: Date.now() - i * 600000,
  event: i % 5 === 0 ? 'Outbound HTTP Request Intercepted & Blocked' : 'Sandbox Boundary Execution Verified',
  category: i % 5 === 0 ? 'external_call_blocked' : 'sandbox_boundary',
  status: i % 5 === 0 ? 'blocked' : 'enforced',
  details: i % 5 === 0 
    ? 'Prevented attempted DNS resolve to api.openai.com. Sovereign air-gap rule enforced strictly.' 
    : 'Python container sandbox verified. Zero host escapes allowed.'
}));

// ==========================================
// REST Endpoints
// ==========================================

// Conversations
router.get('/conversations', (req, res) => {
  res.json(inMemoryConversations);
});

router.get('/conversations/:id', (req, res) => {
  const conv = inMemoryConversations.find(c => c.id === req.params.id);
  if (conv) {
    res.json(conv.messages);
  } else {
    res.status(404).json({ error: 'Conversation not found' });
  }
});

router.post('/conversations', (req, res) => {
  if (Array.isArray(req.body)) {
    inMemoryConversations = req.body;
  } else {
    inMemoryConversations.push(req.body);
  }
  res.json(inMemoryConversations);
});

router.patch('/conversations/:id', (req, res) => {
  const index = inMemoryConversations.findIndex(c => c.id === req.params.id);
  if (index !== -1) {
    inMemoryConversations[index] = { ...inMemoryConversations[index], ...req.body };
    res.json(inMemoryConversations[index]);
  } else {
    res.status(404).json({ error: 'Conversation not found' });
  }
});

router.delete('/conversations/:id', (req, res) => {
  inMemoryConversations = inMemoryConversations.filter(c => c.id !== req.params.id);
  res.json({ status: 'deleted' });
});

// Projects
router.get('/projects', (req, res) => {
  res.json(inMemoryProjects);
});

router.post('/projects', (req, res) => {
  inMemoryProjects.push(req.body);
  res.json(inMemoryProjects);
});

// Models
router.get('/models', (req, res) => {
  res.json(inMemoryModels);
});

router.post('/models', (req, res) => {
  const newModel = { ...req.body, id: `model-${Date.now()}`, loadStatus: 'loading' };
  inMemoryModels.push(newModel);
  res.json(newModel);
  
  // Transition status to loaded in 5 seconds
  setTimeout(() => {
    newModel.loadStatus = 'loaded';
  }, 5000);
});

// Tools
router.get('/tools', (req, res) => {
  res.json(inMemoryTools);
});

router.post('/tools', (req, res) => {
  const newTool = { ...req.body, id: `tool-${Date.now()}` };
  inMemoryTools.push(newTool);
  res.json(newTool);
});

// Knowledge Sources
router.get('/kb/sources', (req, res) => {
  res.json(inMemoryKbSources);
});

router.post('/kb/sources', (req, res) => {
  const newSource = { ...req.body, id: `ks-${Date.now()}`, syncStatus: 'indexing' };
  inMemoryKbSources.push(newSource);
  res.json(newSource);
  
  // Finish indexing sync in 10 seconds
  setTimeout(() => {
    newSource.syncStatus = 'synced';
  }, 10000);
});

// Security Audit Logs
router.get('/security/audit-log', (req, res) => {
  res.json(inMemoryAuditLog);
});

// Settings
router.get('/settings', (req, res) => {
  res.json(inMemorySettings);
});

router.patch('/settings', (req, res) => {
  inMemorySettings = { ...inMemorySettings, ...req.body };
  res.json(inMemorySettings);
});

// Auth Session
router.get('/auth/session', (req, res) => {
  res.json({ userName: inMemorySettings.userName, userRole: inMemorySettings.userRole });
});

// Uploads
router.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    res.json({
      file_id: `f_${Math.random().toString(36).substr(2, 9)}`,
      name: req.file.originalname
    });
  } else {
    res.status(400).json({ error: 'No file uploaded' });
  }
});

// Download Deliverables
router.get('/files/:id', (req, res) => {
  const tempFilePath = path.join(__dirname, 'placeholder.txt');
  fs.writeFileSync(tempFilePath, 'This is placeholder file content generated by the Santinal Mock Backend.');
  res.download(tempFilePath, `artifact_${req.params.id}.txt`, () => {
    try {
      fs.unlinkSync(tempFilePath);
    } catch {}
  });
});

// Deliverables Preview
router.get('/files/:id/preview', (req, res) => {
  res.send(`
    <div style="padding: 1rem; color: #71717a; font-family: sans-serif;">
      <p style="font-weight: 600;">Preview Not Available in Simulator Mode</p>
      <p style="font-size: 0.875rem;">Mock backend returned placeholder html. Request ID: ${req.params.id}</p>
    </div>
  `);
});

module.exports = router;
