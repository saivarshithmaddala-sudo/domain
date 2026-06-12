import { useState, useEffect } from 'react';
import { Search, Users, MailCheck, Send, CheckCircle2 } from 'lucide-react';
import './Demo.css';

const Demo = () => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 2000);
    const timer2 = setTimeout(() => setStage(2), 5000);
    const timer3 = setTimeout(() => setStage(3), 8000);
    const timer4 = setTimeout(() => setStage(4), 11000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  return (
    <div className="demo-page">
      <header className="section-header animate-fade-up">
        <span className="mono-eyebrow">&gt; WATCH IT RUN</span>
        <h1>The pipeline, live.</h1>
      </header>

      <div className="demo-container animate-fade-up" style={{ animationDelay: '0.2s' }}>
        {/* LEFT: Terminal Panel */}
        <div className="terminal-panel">
          <div className="terminal-header">
            <div className="mac-dots">
              <span></span><span></span><span></span>
            </div>
            <div className="terminal-title">pipeline.sh</div>
          </div>
          <div className="terminal-body">
            <div className="log-line">
              <span className="prompt">$</span> outreach-cli run --domain stripe.com
            </div>
            {stage >= 1 && (
              <div className="log-line delay-show">
                <span className="info">[OCEAN]</span> Initializing lookalike discovery for stripe.com...
                <br/>
                <span className="success">✓ Found 42 matching SaaS companies in target segment.</span>
              </div>
            )}
            {stage >= 2 && (
              <div className="log-line delay-show">
                <span className="info">[PROSPEO]</span> Scanning domains for C-suite / VP...
                <br/>
                <span className="success">✓ Surfaced 84 decision-makers with LinkedIn URLs.</span>
              </div>
            )}
            {stage >= 3 && (
              <div className="log-line delay-show">
                <span className="info">[EAZYREACH]</span> Resolving and verifying emails...
                <br/>
                <span className="success">✓ 67 emails verified (0 catch-all, 0 risky).</span>
              </div>
            )}
            {stage >= 4 && (
              <div className="log-line delay-show">
                <span className="warn">[SAFETY GATE]</span> Awaiting confirmation... <span className="success">Approved.</span>
                <br/>
                <span className="info">[BREVO]</span> Dispatching personalized campaigns...
                <br/>
                <span className="success">✓ Run complete. 67 emails queued.</span>
              </div>
            )}
            <div className="cursor-blink">_</div>
          </div>
        </div>

        {/* RIGHT: Live Stage Tracker */}
        <div className="tracker-panel">
          <h3>Live Tracking</h3>
          
          <div className={`tracker-step ${stage >= 1 ? 'active' : ''} ${stage > 1 ? 'completed' : ''}`}>
            <div className="step-icon">
              {stage > 1 ? <CheckCircle2 size={20} /> : <Search size={20} />}
            </div>
            <div className="step-content">
              <h4>1. Lookalike Discovery</h4>
              <p>Ocean.io</p>
            </div>
            {stage === 1 && <div className="processing-pulse"></div>}
          </div>

          <div className={`tracker-step ${stage >= 2 ? 'active' : ''} ${stage > 2 ? 'completed' : ''}`}>
            <div className="step-icon">
              {stage > 2 ? <CheckCircle2 size={20} /> : <Users size={20} />}
            </div>
            <div className="step-content">
              <h4>2. Surfacing Contacts</h4>
              <p>Prospeo</p>
            </div>
            {stage === 2 && <div className="processing-pulse"></div>}
          </div>

          <div className={`tracker-step ${stage >= 3 ? 'active' : ''} ${stage > 3 ? 'completed' : ''}`}>
            <div className="step-icon">
              {stage > 3 ? <CheckCircle2 size={20} /> : <MailCheck size={20} />}
            </div>
            <div className="step-content">
              <h4>3. Email Resolution</h4>
              <p>Eazyreach</p>
            </div>
            {stage === 3 && <div className="processing-pulse"></div>}
          </div>

          <div className={`tracker-step ${stage >= 4 ? 'active' : ''} ${stage > 4 ? 'completed' : ''}`}>
            <div className="step-icon">
              <Send size={20} />
            </div>
            <div className="step-content">
              <h4>4. Outreach Sent</h4>
              <p>Brevo</p>
            </div>
            {stage === 4 && <div className="processing-pulse"></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
