import { Link } from 'react-router-dom';
import { Target, Brain, Zap, Search, UserCheck, MailCheck, Send } from 'lucide-react';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <span className="mono-eyebrow animate-fade-up" style={{ animationDelay: '0.1s' }}>
            &gt; ZERO HUMANS IN THE LOOP
          </span>
          <h1 className="hero-title">
            <span className="animate-fade-up" style={{ animationDelay: '0.2s', display: 'block' }}>One domain.</span>
            <span className="text-gradient animate-fade-up" style={{ animationDelay: '0.3s', display: 'block' }}>A full outreach engine.</span>
          </h1>
          <p className="hero-subtitle animate-fade-up" style={{ animationDelay: '0.4s' }}>
            Type a single company domain. The pipeline finds lookalikes, surfaces decision-makers, resolves their emails, and sends personalized outreach — automatically.
          </p>
          <div className="hero-ctas animate-fade-up" style={{ animationDelay: '0.5s' }}>
            <Link to="/demo" className="btn-primary">
              See It Run →
            </Link>
            <Link to="/how-it-works" className="btn-secondary">
              How It Works
            </Link>
          </div>
        </div>

        {/* Pipeline Mini-Preview */}
        <div className="pipeline-preview animate-fade-up" style={{ animationDelay: '0.7s' }}>
          <div className="preview-node"><Search size={20} /> Ocean.io</div>
          <div className="preview-connector"><div className="traveling-dot"></div></div>
          <div className="preview-node"><UserCheck size={20} /> Prospeo</div>
          <div className="preview-connector"><div className="traveling-dot" style={{animationDelay: '0.75s'}}></div></div>
          <div className="preview-node"><MailCheck size={20} /> Eazyreach</div>
          <div className="preview-connector"><div className="traveling-dot" style={{animationDelay: '1.5s'}}></div></div>
          <div className="preview-node"><Send size={20} /> Brevo</div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="social-proof">
        <div className="proof-banner">
          <h2>4 APIs. 1 command. 0 manual steps.</h2>
          <div className="proof-stats">
            <div className="stat-block">
              <span className="stat-value">~50</span>
              <span className="stat-label">Leads per run</span>
            </div>
            <div className="stat-block">
              <span className="stat-value">100%</span>
              <span className="stat-label">Verified emails</span>
            </div>
            <div className="stat-block">
              <span className="stat-value">1:1</span>
              <span className="stat-label">Personalization</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="features">
        <div className="features-grid">
          <div className="surface-card feature-card">
            <div className="feature-icon"><Target className="text-gradient" size={32} /></div>
            <h3>Lookalike Discovery</h3>
            <p>Feed one seed domain, get 20–50 similar companies instantly.</p>
          </div>
          <div className="surface-card feature-card">
            <div className="feature-icon"><Brain className="text-gradient" size={32} /></div>
            <h3>Decision-Maker Targeting</h3>
            <p>C-suite and VP contacts with LinkedIn URLs, no guesswork.</p>
          </div>
          <div className="surface-card feature-card">
            <div className="feature-icon"><Zap className="text-gradient" size={32} /></div>
            <h3>Auto-Send with Safety Gate</h3>
            <p>Reviews a summary before firing, so nothing misfires.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
