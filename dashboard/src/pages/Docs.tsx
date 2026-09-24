import { Link } from 'react-router-dom';
import { ArrowRight, Code2, Copy, Check, Terminal, ExternalLink, ShieldAlert, Cpu } from 'lucide-react';
import { useState } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { MarketingShell } from './MarketingShell';
import { CODE_SAMPLES } from './marketing-data';
import './Marketing.css';

export function Docs() {
  useDocumentTitle('Documentation & Developer Quickstart — Zaptura WA');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(CODE_SAMPLES.cURL.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <MarketingShell>
      <section className="zp-section zp-docs-page">
        <div className="zp-section-header">
          <p className="zp-section-eyebrow">Developer Quickstart</p>
          <h1 className="zp-section-title">
            Build with the <span>Zaptura REST Gateway</span>
          </h1>
          <p className="zp-section-desc">
            Connect via standard HTTPS REST endpoints, receive bi-directional webhooks, and automate your WhatsApp
            workflow in 4 steps.
          </p>
        </div>

        <div className="zp-docs-steps-card">
          <div className="zp-docs-step">
            <span className="zp-step-badge">1</span>
            <div>
              <h3>Register Your Zaptura Account</h3>
              <p>
                Sign up at <Link to="/register">/register</Link> to receive your root account JWT and enter the
                management dashboard.
              </p>
            </div>
          </div>

          <div className="zp-docs-step">
            <span className="zp-step-badge">2</span>
            <div>
              <h3>Create a WhatsApp Session & Copy the Scoped API Key</h3>
              <p>
                Navigate to <strong>Sessions</strong> in the dashboard and click <strong>Create Session</strong>. A
                one-time high-entropy session key is issued.
              </p>
            </div>
          </div>

          <div className="zp-docs-step">
            <span className="zp-step-badge">3</span>
            <div>
              <h3>Scan the Multi-Device QR Code</h3>
              <p>
                From the WhatsApp app on your phone, navigate to <strong>Linked Devices &gt; Link a Device</strong> and
                scan the on-screen QR code. Status will transition from <code>SCAN_QR_CODE</code> to{' '}
                <code>WORKING</code> in ~5 seconds.
              </p>
            </div>
          </div>

          <div className="zp-docs-step">
            <span className="zp-step-badge">4</span>
            <div>
              <h3>Dispatch Your First WhatsApp Message</h3>
              <p>
                Execute a POST request to <code>/api/sessions/:sessionId/messages/send-text</code> passing your API Key
                in the <code>X-API-Key</code> HTTP header.
              </p>
            </div>
          </div>
        </div>

        <div className="zp-docs-code-card">
          <div className="zp-code-topbar">
            <div className="zp-sim-card-title">
              <Terminal size={16} className="zp-text-emerald" />
              <span>cURL Dispatch Example</span>
            </div>
            <button type="button" onClick={handleCopy} className="zp-copy-btn">
              {copied ? <Check size={14} className="zp-text-emerald" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <div className="zp-code-body">
            <pre className="zp-pre">
              <code>{CODE_SAMPLES.cURL.code}</code>
            </pre>
          </div>
        </div>

        <div className="zp-docs-features-grid">
          <div className="zp-feature-card">
            <div className="zp-feature-top">
              <Code2 size={20} className="zp-text-cyan" />
              <span className="zp-feature-badge">OpenAPI 3.0</span>
            </div>
            <h3>Interactive Swagger UI</h3>
            <p>
              Explore live endpoints, inspect DTO schemas, and test interactive requests at{' '}
              <a href="/api/docs" target="_blank" rel="noreferrer" className="zp-inline-link">
                /api/docs <ExternalLink size={12} />
              </a>
              .
            </p>
          </div>

          <div className="zp-feature-card">
            <div className="zp-feature-top">
              <Cpu size={20} className="zp-text-emerald" />
              <span className="zp-feature-badge">Webhooks</span>
            </div>
            <h3>Bi-Directional Webhooks</h3>
            <p>
              Configure webhook URLs per session for message arrival, message delivery acknowledgments (ack 1, 2, 3),
              and connection state shifts.
            </p>
          </div>

          <div className="zp-feature-card">
            <div className="zp-feature-top">
              <ShieldAlert size={20} className="zp-text-amber" />
              <span className="zp-feature-badge">Best Practices</span>
            </div>
            <h3>Safe Automation Rate Limits</h3>
            <p>
              Keep dispatch pace human-like (e.g. 1-3 seconds between bulk messages). Always provide customer opt-out
              mechanisms to protect account health.
            </p>
          </div>
        </div>

        <div className="zp-hero-cta-group" style={{ marginTop: '3rem' }}>
          <Link to="/register" className="zp-btn zp-btn-primary zp-btn-xl">
            <span>Create Your Free Account</span>
            <ArrowRight size={18} />
          </Link>
          <a href="/api/docs" target="_blank" rel="noreferrer" className="zp-btn zp-btn-outline zp-btn-xl">
            <span>Open Swagger API UI</span>
            <ExternalLink size={16} />
          </a>
        </div>
      </section>
    </MarketingShell>
  );
}
