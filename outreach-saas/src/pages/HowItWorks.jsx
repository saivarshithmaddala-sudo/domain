import { Terminal, Waves, Users, MailCheck, Send, AlertTriangle } from 'lucide-react';
import './HowItWorks.css';

const HowItWorks = () => {
  return (
    <div className="how-it-works-page">
      <header className="section-header animate-fade-up">
        <span className="mono-eyebrow">&gt; THE PIPELINE</span>
        <h1>Four stages. One command.</h1>
      </header>

      <div className="pipeline-visual">
        {/* Stage 01 */}
        <div className="pipeline-stage animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="stage-icon"><Terminal size={24} /></div>
          <div className="stage-content">
            <div className="stage-label">Stage 01 — INPUT</div>
            <h3>company.domain</h3>
            <p>You type a single seed domain. That's the only human input the system ever receives.</p>
            <div className="terminal-input-sim">
              <span className="prompt">&gt;</span>
              <span className="typing-text">stripe.com</span>
              <span className="cursor"></span>
            </div>
          </div>
        </div>

        <div className="connector-vertical"><div className="travel-dot"></div></div>

        {/* Stage 02 */}
        <div className="pipeline-stage animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <div className="stage-icon"><Waves size={24} className="text-cyan" /></div>
          <div className="stage-content">
            <div className="stage-label">Stage 02 — OCEAN.IO</div>
            <h3>Lookalike Discovery</h3>
            <p>Ocean.io expands the seed into a list of similar companies — matched by firmographics, market segment, and growth signals.</p>
            <div className="output-badge">→ 20–50 company domains</div>
          </div>
        </div>

        <div className="connector-vertical"><div className="travel-dot" style={{animationDelay: '1s'}}></div></div>

        {/* Stage 03 */}
        <div className="pipeline-stage animate-fade-up" style={{ animationDelay: '0.5s' }}>
          <div className="stage-icon"><Users size={24} className="text-cyan" /></div>
          <div className="stage-content">
            <div className="stage-label">Stage 03 — PROSPEO</div>
            <h3>Decision-Maker Surfacing</h3>
            <p>Each domain is scanned for C-suite and VP-level contacts. LinkedIn profile URLs are returned for every match.</p>
            <div className="output-badge">→ Names + LinkedIn URLs</div>
          </div>
        </div>

        <div className="connector-vertical"><div className="travel-dot" style={{animationDelay: '0.5s'}}></div></div>

        {/* Stage 04 */}
        <div className="pipeline-stage animate-fade-up" style={{ animationDelay: '0.7s' }}>
          <div className="stage-icon"><MailCheck size={24} className="text-cyan" /></div>
          <div className="stage-content">
            <div className="stage-label">Stage 04 — EAZYREACH</div>
            <h3>Email Resolution</h3>
            <p>LinkedIn profiles are resolved into verified, deliverable work email addresses. No guessing, no bouncing.</p>
            <div className="output-badge">→ Verified work emails</div>
          </div>
        </div>

        <div className="connector-vertical"><div className="travel-dot" style={{animationDelay: '1.5s'}}></div></div>

        {/* Safety Gate */}
        <div className="safety-gate animate-fade-up" style={{ animationDelay: '0.9s' }}>
          <AlertTriangle className="safety-icon" size={24} />
          <div className="safety-text">
            <strong>⚠ Safety Gate:</strong> Before emails fire, the system shows a contact summary. One confirmation, then hands-free from there.
          </div>
        </div>

        <div className="connector-vertical"><div className="travel-dot" style={{animationDelay: '0.2s'}}></div></div>

        {/* Stage 05 */}
        <div className="pipeline-stage animate-fade-up" style={{ animationDelay: '1.1s' }}>
          <div className="stage-icon"><Send size={24} className="text-cyan" /></div>
          <div className="stage-content">
            <div className="stage-label">Stage 05 — BREVO</div>
            <h3>Personalized Outreach</h3>
            <p>Each contact receives a tailored cold email. The pipeline fires automatically — no copy-paste, no manual steps.</p>
            <div className="output-badge success-badge">→ Outreach sent ✓</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HowItWorks;
