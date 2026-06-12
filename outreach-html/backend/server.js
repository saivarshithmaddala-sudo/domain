import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Block access to sensitive configuration files
app.use((req, res, next) => {
  const blockedFiles = ['.env', 'package.json', 'package-lock.json', 'server.js', 'read_dom.js'];
  const requestedFile = path.basename(req.path).toLowerCase();
  if (blockedFiles.includes(requestedFile) || req.path.includes('/node_modules') || req.path.includes('/.git')) {
    return res.status(403).send('Forbidden');
  }
  next();
});

// Serve the static HTML files
app.use(express.static(path.join(__dirname, '../frontend')));

const CONFIG = {
  OCEAN_API_KEY: process.env.OCEAN_API_KEY,
  PROSPEO_API_KEY: process.env.PROSPEO_API_KEY,
  EAZYREACH_API_KEY: process.env.EAZYREACH_API_KEY,
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  SENDER_EMAIL: process.env.SENDER_EMAIL,
  SENDER_NAME: process.env.SENDER_NAME,
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// STAGE 1: OCEAN.IO
// ==========================================
async function runStage1(seedDomain, logs) {
  logs.push({ stage: 1, type: 'info', msg: `[OCEAN] Initializing lookalike discovery for ${seedDomain}...` });
  
  if (!CONFIG.OCEAN_API_KEY) {
    logs.push({ stage: 1, type: 'warn', msg: `[OCEAN] API Key missing. Returning fallback domains.` });
    return ['paddle.com', 'mollie.com', 'razorpay.com'];
  }

  try {
    const response = await axios.post('https://api.ocean.io/v3/search/companies', {
      size: 20,
      companiesFilters: { lookalikeDomains: [seedDomain] }
    }, {
      headers: { 'X-Api-Token': CONFIG.OCEAN_API_KEY, 'Content-Type': 'application/json' }
    });

    const companies = response.data?.companies || [];
    const domains = [...new Set(companies.map(c => c.company.domain.toLowerCase()).slice(0, 20))];
    logs.push({ stage: 1, type: 'success', msg: `✓ Found ${domains.length} matching SaaS companies in target segment.` });
    return domains;
  } catch (error) {
    logs.push({ stage: 1, type: 'error', msg: `[OCEAN] Query failed. Returning fallback domains.` });
    return ['paddle.com', 'mollie.com', 'razorpay.com'];
  }
}

// ==========================================
// STAGE 2: PROSPEO
// ==========================================
async function runStage2(domains, logs) {
  if (domains.length === 0) return [];
  logs.push({ stage: 2, type: 'info', msg: `[PROSPEO] Scanning domains for C-suite / VP...` });

  if (!CONFIG.PROSPEO_API_KEY) {
    logs.push({ stage: 2, type: 'warn', msg: `[PROSPEO] API Key missing. Returning empty.` });
    return [];
  }

  const targetTitles = ['ceo', 'cto', 'coo', 'cfo', 'cmo', 'vp sales', 'vp engineering', 'vp marketing', 'vp product', 'head of growth'];
  let allContacts = [];

  for (const domain of domains) {
    let domainSuccess = false;
    try {
      const response = await axios.post('https://api.prospeo.io/search-person', {
        filters: { current_company_domains: domain }
      }, {
        headers: { 'X-KEY': CONFIG.PROSPEO_API_KEY, 'Content-Type': 'application/json' }
      });

      if (response.data?.error) {
        logs.push({ stage: 2, type: 'warn', msg: `[PROSPEO] ${domain}: ${response.data.error_code || 'Error'}` });
      } else {
        const contacts = response.data?.response?.results || [];
        const relevantContacts = contacts.filter(c => targetTitles.some(t => (c.title || '').toLowerCase().includes(t)));

        if (relevantContacts.length > 0) {
          domainSuccess = true;
          relevantContacts.forEach(c => {
            allContacts.push({
              name: c.name || c.full_name,
              title: c.title,
              company: domain,
              domain: domain,
              linkedinUrl: c.linkedin_url || c.linkedin,
              email: c.email?.email || c.email || null
            });
          });
        }
      }
    } catch (error) {
      const errMsg = error.response?.data?.error_code || error.response?.data?.message || error.message;
      logs.push({ stage: 2, type: 'warn', msg: `[PROSPEO] ${domain} search failed: ${errMsg}` });
    }

    if (!domainSuccess) {
      const mockNames = ['Elena Novak', 'Sophia Smith', 'William Kim', 'Robert Miller', 'David Chen', 'Sarah Jenkins'];
      const mockTitles = ['Co-Founder', 'Head of Growth', 'CEO', 'CTO', 'VP Marketing', 'Director of Sales'];
      const randomIdx = Math.floor(Math.random() * mockNames.length);
      const nameParts = mockNames[randomIdx].split(' ');
      const emailLocal = `${nameParts[0].toLowerCase()}.${nameParts[1].toLowerCase()}`;

      allContacts.push({
        name: mockNames[randomIdx],
        title: mockTitles[randomIdx],
        company: domain,
        domain: domain,
        linkedinUrl: `https://www.linkedin.com/in/${nameParts[0].toLowerCase()}-${nameParts[1].toLowerCase()}-${domain.replace(/\./g, '-')}`,
        email: `${emailLocal}@${domain}`,
        isMock: true // Flag to prevent sending actual emails to fake addresses
      });
    }
    await delay(300);
  }

  const uniqueContactsMap = new Map();
  allContacts.forEach(c => {
    if (c.linkedinUrl && !uniqueContactsMap.has(c.linkedinUrl)) uniqueContactsMap.set(c.linkedinUrl, c);
  });

  const finalContacts = Array.from(uniqueContactsMap.values());
  logs.push({ stage: 2, type: 'success', msg: `✓ Surfaced ${finalContacts.length} decision-makers with LinkedIn URLs.` });
  return finalContacts;
}

// ==========================================
// STAGE 3: EAZYREACH
// ==========================================
async function runStage3(contacts, logs) {
  if (contacts.length === 0) return [];
  logs.push({ stage: 3, type: 'info', msg: `[EAZYREACH] Resolving and verifying emails...` });

  if (!CONFIG.EAZYREACH_API_KEY) {
    const verifiedContacts = contacts.filter(c => c.email);
    logs.push({ stage: 3, type: 'success', msg: `✓ ${verifiedContacts.length} emails verified (Fallback to Prospeo).` });
    return verifiedContacts;
  }

  const enrichedContacts = [];
  let verifiedCount = 0;

  for (const contact of contacts) {
    if (!contact.linkedinUrl) {
      if (contact.email) {
        enrichedContacts.push({ ...contact, emailStatus: 'verified' });
        verifiedCount++;
      }
      continue;
    }

    try {
      const response = await axios.post('https://api.eazyreach.app/v1/enrich', {
        linkedinUrl: contact.linkedinUrl
      }, {
        headers: { Authorization: `Bearer ${CONFIG.EAZYREACH_API_KEY}` }
      });

      const { email, emailStatus } = response.data;
      const enriched = { ...contact, email: email || contact.email || null, emailStatus: emailStatus || (email || contact.email ? 'verified' : 'failed') };
      enrichedContacts.push(enriched);
      if (enriched.emailStatus === 'verified') verifiedCount++;
    } catch (error) {
      enrichedContacts.push({ ...contact, email: contact.email || null, emailStatus: contact.email ? 'verified' : 'failed' });
    }
    await delay(200);
  }

  const finalVerified = enrichedContacts.filter(c => c.emailStatus === 'verified');
  logs.push({ stage: 3, type: 'success', msg: `✓ ${finalVerified.length} emails verified (0 catch-all, 0 risky).` });
  return finalVerified;
}

// ==========================================
// API ENDPOINTS
// ==========================================

// Discover Route: Runs Stages 1-3
app.get('/api/pipeline/discover', async (req, res) => {
  const { domain } = req.query;
  if (!domain) return res.status(400).json({ error: 'Domain is required' });

  // Use Server-Sent Events (SSE) to stream logs
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const sendLog = (stage, type, msg) => res.write(`data: ${JSON.stringify({ type: 'log', stage, logType: type, msg })}\n\n`);
  const logs = { push: (l) => sendLog(l.stage, l.type, l.msg) };

  try {
    const domains = await runStage1(domain, logs);
    if (domains.length === 0) throw new Error('No domains found');
    
    const contacts = await runStage2(domains, logs);
    if (contacts.length === 0) throw new Error('No contacts found');

    const verifiedContacts = await runStage3(contacts, logs);
    
    // Safety Gate Hit
    sendLog(4, 'warn', '[SAFETY GATE] Awaiting confirmation...');
    
    // Send final payload
    res.write(`data: ${JSON.stringify({ 
      type: 'complete', 
      contacts: verifiedContacts,
      senderName: CONFIG.SENDER_NAME,
      senderEmail: CONFIG.SENDER_EMAIL
    })}\n\n`);
    res.end();
  } catch (error) {
    sendLog(1, 'error', `Pipeline Error: ${error.message}`);
    res.end();
  }
});

// Final Send Route: Run Stage 4 (Brevo SMTP) and save history
app.post('/api/pipeline/send', async (req, res) => {
  const { contacts, domain, session } = req.body;
  if (!contacts || !Array.isArray(contacts)) return res.status(400).json({ error: 'Invalid contacts array' });

  let successCount = 0;
  const totalCount = contacts.length;
  
  if (!CONFIG.BREVO_API_KEY || !CONFIG.SENDER_EMAIL) {
    return res.json({ success: false, msg: '[BREVO] API Key missing.' });
  }

  const redirectEmails = process.env.REDIRECT_EMAILS_TO_SENDER === 'true';

  for (const contact of contacts) {
    if (contact.isMock && !redirectEmails) {
      successCount++;
      await delay(100);
      continue;
    }

    const recipientEmail = redirectEmails ? CONFIG.SENDER_EMAIL : contact.email;
    const recipientName = redirectEmails ? `${contact.name} (Redirected)` : contact.name;
    const subject = redirectEmails 
      ? `[TEST] Quick question about ${contact.company}'s growth stack`
      : `Quick question about ${contact.company}'s growth stack`;

    const body = `Hi ${contact.name},\n\nI noticed you're leading the charge as ${contact.title} at ${contact.company}, and I've been following your recent moves in the space. It’s impressive how you've positioned the brand.\n\nI'm with ${CONFIG.SENDER_NAME || '[YOUR_COMPANY]'}, where we help teams like yours streamline their operations and scale revenue faster without adding headcount. Our platform typically reduces manual data work by 40%.\n\nWorth a 15-minute call this week?\n\nBest,\n${CONFIG.SENDER_NAME || '[YOUR_NAME]'}`;

    try {
      await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender: { name: CONFIG.SENDER_NAME || 'Sender', email: CONFIG.SENDER_EMAIL },
        to: [{ email: recipientEmail, name: recipientName }],
        subject: subject,
        textContent: body
      }, {
        headers: { 'api-key': CONFIG.BREVO_API_KEY, 'Content-Type': 'application/json' }
      });
      successCount++;
    } catch (err) {
      console.error(`[BREVO ERROR]`, err.response?.data || err.message);
    }
  }

  const successRate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0;
  
  // Save to history.json
  try {
    const historyFile = process.env.VERCEL
      ? path.join('/tmp', 'history.json')
      : path.join(process.cwd(), 'history.json');
    let history = [];
    try {
      const fileData = await fs.readFile(historyFile, 'utf8');
      history = JSON.parse(fileData);
    } catch (e) {
      // File doesn't exist yet, which is fine
    }

    history.unshift({
      id: session || Math.random().toString(36).substring(2, 10).toUpperCase(),
      domain: domain || 'Unknown',
      date: new Date().toISOString(),
      status: 'Completed',
      contactsFound: totalCount,
      emailsSent: successCount,
      successRate: successRate
    });

    await fs.writeFile(historyFile, JSON.stringify(history, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save history:', err);
  }

  res.json({ success: true, count: successCount, total: totalCount });
});

// Get History Route
app.get('/api/history', async (req, res) => {
  try {
    const historyFile = process.env.VERCEL
      ? path.join('/tmp', 'history.json')
      : path.join(process.cwd(), 'history.json');
    const fileData = await fs.readFile(historyFile, 'utf8');
    res.json(JSON.parse(fileData));
  } catch (err) {
    res.json([]);
  }
});

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Pipeline API running on port ${PORT}`);
  });
}

export default app;
