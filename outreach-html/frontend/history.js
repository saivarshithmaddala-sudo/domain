document.addEventListener('DOMContentLoaded', async () => {
  const tbody = document.getElementById('history-tbody');
  
  try {
    const res = await fetch('/api/history');
    const history = await res.json();
    
    if (history.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#6B7280;padding:2rem;">No campaigns found. Go run the pipeline!</td></tr>';
      return;
    }
    
    tbody.innerHTML = history.map(run => {
      const date = new Date(run.date).toLocaleString();
      return `
        <tr>
          <td class="font-mono text-cyan" style="font-weight:600;">${run.id}</td>
          <td class="text-muted">${date}</td>
          <td style="color:#fff;font-weight:500;">${run.domain}</td>
          <td><span class="status-badge complete" style="display:inline-flex;padding:0.125rem 0.5rem;"><i data-lucide="check-circle" width="12" height="12"></i> <span>${run.status}</span></span></td>
          <td class="font-mono">${run.contactsFound}</td>
          <td class="font-mono">${run.emailsSent}</td>
          <td class="font-mono" style="color: #34D399;">${run.successRate}%</td>
        </tr>
      `;
    }).join('');
    
    lucide.createIcons();
    
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#EF4444;padding:2rem;">Failed to load history. Make sure the Node server is running.</td></tr>';
  }
});
