document.addEventListener('DOMContentLoaded', () => {
  // Init Modal Elements
  const btnOpenInit = document.getElementById('btn-open-init');
  const initModal = document.getElementById('init-modal');
  const closeInitModal = document.getElementById('close-init-modal');
  const initForm = document.getElementById('init-form');
  const domainInput = document.getElementById('domain-input');

  // Header Elements
  const sessionDisplay = document.getElementById('session-display');
  const targetDisplay = document.getElementById('target-display');
  const globalStatus = document.getElementById('global-status');

  // Terminal Elements
  const terminalPulse = document.getElementById('terminal-pulse');
  const terminalBody = document.getElementById('terminal-body');
  const logCountDisplay = document.getElementById('log-count');

  // Safety Gate Modal Elements
  const safetyModal = document.getElementById('safety-modal');
  const contactsTbody = document.getElementById('contacts-tbody');
  const modalCancelBtn = document.getElementById('modal-cancel');
  const modalApproveBtn = document.getElementById('modal-approve');

  // Stats Elements
  const statsCard = document.getElementById('stats-card');
  const statLookalikes = document.getElementById('stat-lookalikes');
  const statProspects = document.getElementById('stat-prospects');
  const statVerified = document.getElementById('stat-verified');
  const statFailed = document.getElementById('stat-failed');
  const statSent = document.getElementById('stat-sent');

  let approvedContacts = [];
  let currentSenderName = '';
  let currentSenderEmail = '';
  let logCount = 0;
  let currentSession = '';
  let currentDomain = '';

  // --- Utility ---
  const getTime = () => {
    const d = new Date();
    return `[${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}]`;
  };

  function appendLog(msgHtml) {
    const line = document.createElement('div');
    line.className = 'log-line';
    line.innerHTML = `<span class="log-time">${getTime()}</span> <span style="flex:1;">${msgHtml}</span>`;
    terminalBody.appendChild(line);
    terminalBody.scrollTop = terminalBody.scrollHeight;
    logCount++;
    logCountDisplay.textContent = logCount;
  }

  function setStep(stepNum) {
    // Fill width: step 1=0%, 2=25%, 3=50%, 4=75%, 5=100%
    const fillWidth = (stepNum - 1) * 25;
    document.getElementById('stepper-fill').style.width = `${fillWidth}%`;

    for (let i = 1; i <= 5; i++) {
      const el = document.getElementById(`step-${i}`);
      el.className = 'step-item';
      if (i < stepNum) {
        el.classList.add('completed');
        el.querySelector('.step-circle').innerHTML = '<i data-lucide="check" width="16" height="16"></i>';
      } else if (i === stepNum) {
        el.classList.add('active');
        el.querySelector('.step-circle').innerHTML = i;
      } else {
        el.classList.add('pending');
        el.querySelector('.step-circle').innerHTML = i;
      }
    }
    lucide.createIcons();
  }

  // --- Modal Logic ---
  btnOpenInit.addEventListener('click', () => { initModal.style.display = 'flex'; });
  closeInitModal.addEventListener('click', () => { initModal.style.display = 'none'; });

  function openSafetyModal() {
    document.getElementById('safety-contact-count').textContent = `${approvedContacts.length} CONTACTS`;
    document.getElementById('btn-send-text').textContent = `Send ${approvedContacts.length} Emails`;

    contactsTbody.innerHTML = approvedContacts.map(c => `
      <tr>
        <td style="color:#fff; font-weight:500;">${c.name || 'N/A'}</td>
        <td class="text-muted">${c.email}</td>
        <td style="color:#D1D5DB; font-weight:500;">${c.title || 'N/A'}</td>
        <td><span class="company-badge">${c.company}</span></td>
      </tr>
    `).join('');
    safetyModal.style.display = 'flex';
  }

  modalCancelBtn.addEventListener('click', () => {
    safetyModal.style.display = 'none';
    appendLog(`<span class="text-danger">[ABORT] Pipeline sequence terminated by user.</span>`);
    terminalPulse.style.display = 'none';
    globalStatus.innerHTML = `<i data-lucide="x-circle" width="12" height="12"></i> <span>ABORTED</span>`;
    globalStatus.className = 'status-badge';
    globalStatus.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    globalStatus.style.color = '#EF4444';
    lucide.createIcons();
  });

  // --- Pipeline Logic ---
  initForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const domain = domainInput.value.trim();
    if (!domain) return;
    initModal.style.display = 'none';

    // Reset UI
    terminalBody.innerHTML = '';
    logCount = 0;
    logCountDisplay.textContent = '0';
    statsCard.style.display = 'none';
    
    // Update Header
    currentSession = Math.random().toString(36).substring(2, 10).toUpperCase();
    currentDomain = domain;
    sessionDisplay.innerHTML = `<span>${currentSession.substring(0,4)}</span>${currentSession.substring(4)}`;
    targetDisplay.innerHTML = `Target: <span class="text-cyan">${currentDomain}</span>`;
    
    globalStatus.className = 'status-badge running';
    globalStatus.innerHTML = `<i data-lucide="refresh-cw" class="spinner" width="12" height="12" style="border:none"></i> <span>RUNNING</span>`;
    lucide.createIcons();

    terminalPulse.style.display = 'flex';
    setStep(2);
    appendLog(`<span class="text-blue font-bold">[STAGE_START]</span> Initializing target vector: <span class="text-cyan">${domain}</span>`);

    // Connect to Server-Sent Events
    const evtSource = new EventSource(`/api/pipeline/discover?domain=${encodeURIComponent(domain)}`);

    evtSource.onmessage = function(event) {
      const data = JSON.parse(event.data);
      
      if (data.type === 'log') {
        // Map backend stage to UI step
        let uiStep = data.stage + 1; // Stage 1(Ocean) -> Step 2, Stage 2(Prospeo)->Step 3, Stage 3(Eazy)->Step 4
        if (uiStep <= 4) setStep(uiStep);

        let color = 'text-muted';
        if (data.logType === 'success') color = 'text-green';
        if (data.logType === 'warn') color = 'text-danger';
        if (data.logType === 'info') color = 'text-cyan';

        let prefix = '';
        if (data.msg.includes('[OCEAN]')) prefix = '<span class="text-blue">[OCEAN]</span> ';
        if (data.msg.includes('[PROSPEO]')) prefix = '<span class="text-blue">[PROSPEO]</span> ';
        if (data.msg.includes('[EAZYREACH]')) prefix = '<span class="text-blue">[EAZY]</span> ';

        let cleanMsg = data.msg.replace(/\[OCEAN\] |\[PROSPEO\] |\[EAZYREACH\] |✓ /g, '');
        if (data.logType === 'success') cleanMsg = `<i data-lucide="check-circle" width="14" height="14" style="display:inline-block;vertical-align:middle;margin-right:4px;"></i>${cleanMsg}`;

        appendLog(`${prefix}<span class="${color}">${cleanMsg}</span>`);
        lucide.createIcons();
      } 
      else if (data.type === 'complete') {
        evtSource.close();
        approvedContacts = data.contacts;
        currentSenderName = data.senderName;
        currentSenderEmail = data.senderEmail;
        
        terminalPulse.style.display = 'none';
        appendLog(`<span class="text-purple">[SYSTEM]</span> Ready for dispatch authorization.`);
        
        // Show Stats temporarily before modal
        statLookalikes.textContent = 20; // Simulated constant
        statProspects.textContent = approvedContacts.length * 2; // Simulated
        statVerified.textContent = approvedContacts.length;
        
        openSafetyModal();
      }
    };

    evtSource.onerror = function() {
      evtSource.close();
      appendLog(`<span class="text-danger">[FATAL] Connection to pipeline failed.</span>`);
      terminalPulse.style.display = 'none';
    };
  });

  // Final Dispatch
  modalApproveBtn.addEventListener('click', async () => {
    safetyModal.style.display = 'none';
    setStep(5);
    terminalPulse.style.display = 'flex';
    appendLog(`<span class="text-blue">[STAGE_START]</span> Dispatching emails via Brevo SMTP...`);
    
    try {
      const res = await fetch('/api/pipeline/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contacts: approvedContacts,
          domain: currentDomain,
          session: currentSession
        })
      });
      const data = await res.json();
      
      if (data.success) {
        appendLog(`<span class="text-green"><i data-lucide="check-circle" width="14" height="14"></i> Run complete. ${data.count}/${data.total} payloads delivered.</span>`);
        statSent.textContent = data.count;
        statFailed.textContent = data.total - data.count;
      } else {
        appendLog(`<span class="text-danger">[ERROR] ${data.msg || 'Dispatch failed.'}</span>`);
      }
    } catch (err) {
      appendLog(`<span class="text-danger">[ERROR] Dispatch service offline.</span>`);
    }

    terminalPulse.style.display = 'none';
    setStep(6); // Fills all to green
    document.getElementById('stepper-fill').style.width = '100%';
    
    globalStatus.className = 'status-badge complete';
    globalStatus.innerHTML = `<i data-lucide="check-circle" width="12" height="12"></i> <span>COMPLETE</span>`;
    
    statsCard.style.display = 'block';
    lucide.createIcons();
  });
});
