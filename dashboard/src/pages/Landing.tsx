import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Code2,
  Copy,
  CheckCheck,
  Cpu,
  CreditCard,
  FileText,
  Image as ImageIcon,
  Layers,
  Lock,
  MessageSquare,
  Mic,
  QrCode,
  Send,
  Sparkles,
  Star,
  Terminal,
  Users,
  Webhook,
  Zap,
} from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { MarketingShell } from './MarketingShell';
import { CODE_SAMPLES, FAQ_ITEMS, NX_PLAN_FEATURES, NX_PLANS } from './marketing-data';
import './Marketing.css';

const LANGS = ['JS', 'Python', 'cURL', 'Go', 'PHP'] as const;

type MsgType = 'text' | 'image' | 'voice' | 'doc';

export function Landing() {
  useDocumentTitle('Zaptura — Autonomous WhatsApp API & Automation Cloud');

  const [lang, setLang] = useState<(typeof LANGS)[number]>('JS');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [yearly, setYearly] = useState(false);
  const [copied, setCopied] = useState(false);

  // Live WhatsApp Simulator State
  const [simType, setSimType] = useState<MsgType>('text');
  const [simText, setSimText] = useState('Order #9482 confirmed! Your tracking link is ready.');
  const [simRecipient, setSimRecipient] = useState('+1 (555) 382-9012');
  const [simTyping, setSimTyping] = useState(false);
  const [messagesList, setMessagesList] = useState<
    Array<{ id: number; from: 'out' | 'in'; text: string; type: MsgType; time: string }>
  >([
    { id: 1, from: 'in', text: 'Hi! Can you send me the status of my order?', type: 'text', time: '10:41 AM' },
    { id: 2, from: 'out', text: 'Order #9482 confirmed! Your tracking link is ready.', type: 'text', time: '10:42 AM' },
  ]);

  // Cost comparison calculator state
  const [monthlyVolume, setMonthlyVolume] = useState<number>(30000);

  const sample = CODE_SAMPLES[lang];

  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.replace('#', '');
      if (!id) return;
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(sample.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!simText.trim()) return;

    const newId = Date.now();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessagesList(prev => [...prev, { id: newId, from: 'out', text: simText, type: simType, time: timeStr }]);

    // Simulate webhook bot auto-reply
    setSimTyping(true);
    setTimeout(() => {
      setSimTyping(false);
      setMessagesList(prev => [
        ...prev,
        {
          id: newId + 1,
          from: 'in',
          text: 'Thanks! Just got the notification. Super fast! 🚀',
          type: 'text',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1200);
  };

  // Calculations for cost savings
  // Meta Cloud API averages ~$0.045 per conversation/marketing message
  const metaCost = Math.round((monthlyVolume / 1000) * 45);
  // Zaptura flat cost is based on volume tier
  const zapturaCost = monthlyVolume <= 10000 ? 6 : monthlyVolume <= 40000 ? 15 : 45;
  const annualSavings = Math.max(0, (metaCost - zapturaCost) * 12);

  return (
    <MarketingShell>
      {/* ================= HERO SECTION ================= */}
      <section className="zp-hero">
        <div className="zp-hero-bg" aria-hidden="true">
          <div className="zp-mesh-glow zp-glow-top" />
          <div className="zp-mesh-glow zp-glow-bottom" />
          <div className="zp-hero-grid-pattern" />
        </div>

        <div className="zp-hero-content">
          <div className="zp-hero-badge">
            <span className="zp-pulse-dot" />
            <span className="zp-badge-text">Autonomous WhatsApp Engine v2.4</span>
            <span className="zp-badge-sub">Zero Per-Message Fees</span>
          </div>

          <h1 className="zp-hero-title">
            The High-Performance <br />
            <span className="zp-gradient-text">WhatsApp API & SaaS Cloud</span>
          </h1>

          <p className="zp-hero-lead">
            Connect multiple WhatsApp numbers in seconds, stream bi-directional webhooks, hook into AI agents, and
            dispatch unlimited automated notifications with zero message markups.
          </p>

          <div className="zp-hero-cta-group">
            <Link to="/register" className="zp-btn zp-btn-primary zp-btn-xl">
              <span>Start 3-Day Free Trial</span>
              <ArrowRight size={18} className="zp-btn-arrow" />
            </Link>
            <a href="#simulator" className="zp-btn zp-btn-outline zp-btn-xl">
              <span>Launch Live Simulator</span>
            </a>
          </div>

          <div className="zp-hero-metrics-pill">
            <div className="zp-metric-item">
              <CreditCard size={15} className="zp-text-emerald" />
              <span>No Credit Card Required</span>
            </div>
            <span className="zp-metric-divider" />
            <div className="zp-metric-item">
              <QrCode size={15} className="zp-text-cyan" />
              <span>15s Multi-Device QR Pairing</span>
            </div>
            <span className="zp-metric-divider" />
            <div className="zp-metric-item">
              <Zap size={15} className="zp-text-amber" />
              <span>Sub-50ms REST Dispatch</span>
            </div>
            <span className="zp-metric-divider" />
            <div className="zp-metric-item">
              <Lock size={15} className="zp-text-emerald" />
              <span>AES-256 Scoped Tokens</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE SIMULATOR ================= */}
      <section className="zp-section" id="simulator">
        <div className="zp-section-header">
          <p className="zp-section-eyebrow">Interactive Testing Sandbox</p>
          <h2 className="zp-section-title">
            Test The Zaptura Gateway <span>In Real-Time</span>
          </h2>
          <p className="zp-section-desc">
            Compose dynamic messages, toggle rich payload types, inspect live delivery states, and watch the developer
            JSON output update synchronously.
          </p>
        </div>

        <div className="zp-sim-layout">
          {/* Left: Composer & API Payload */}
          <div className="zp-sim-composer-col">
            <div className="zp-sim-card">
              <div className="zp-sim-card-header">
                <div className="zp-sim-card-title">
                  <Terminal size={17} className="zp-text-emerald" />
                  <span>Interactive Dispatch Composer</span>
                </div>
                <span className="zp-tag-online">Simulated Session: zap_prod_01</span>
              </div>

              <form onSubmit={handleSimulateSend} className="zp-sim-form">
                <div className="zp-sim-field">
                  <label>Recipient WhatsApp Number (E.164 / Chat ID)</label>
                  <input
                    type="text"
                    value={simRecipient}
                    onChange={e => setSimRecipient(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="zp-input"
                  />
                </div>

                <div className="zp-sim-field">
                  <label>Payload Message Type</label>
                  <div className="zp-sim-type-selector">
                    {(
                      [
                        { id: 'text', icon: MessageSquare, label: 'Text' },
                        { id: 'image', icon: ImageIcon, label: 'Media' },
                        { id: 'voice', icon: Mic, label: 'Voice Note' },
                        { id: 'doc', icon: FileText, label: 'PDF Doc' },
                      ] as const
                    ).map(item => (
                      <button
                        key={item.id}
                        type="button"
                        className={`zp-type-btn ${simType === item.id ? 'active' : ''}`}
                        onClick={() => {
                          setSimType(item.id);
                          if (item.id === 'image') setSimText('📊 Attached: Quarterly Growth Report.png');
                          else if (item.id === 'voice') setSimText('🎙 Voice message (0:14) dispatched via API');
                          else if (item.id === 'doc') setSimText('📄 Invoice_ZAP_9821.pdf generated');
                          else setSimText('Order #9482 confirmed! Your tracking link is ready.');
                        }}
                      >
                        <item.icon size={14} />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="zp-sim-field">
                  <label>Message Content / Caption</label>
                  <textarea
                    rows={3}
                    value={simText}
                    onChange={e => setSimText(e.target.value)}
                    className="zp-textarea"
                    placeholder="Enter your simulated message payload..."
                  />
                </div>

                <button type="submit" className="zp-btn zp-btn-primary zp-btn-full">
                  <Send size={15} />
                  <span>Dispatch Simulated Message</span>
                </button>
              </form>

              {/* Real-time JSON Payload Inspector */}
              <div className="zp-sim-payload-box">
                <div className="zp-payload-header">
                  <span>
                    POST /api/sessions/default/messages/send-
                    {simType === 'doc'
                      ? 'file'
                      : simType === 'image'
                        ? 'image'
                        : simType === 'voice'
                          ? 'voice'
                          : 'text'}
                  </span>
                  <span className="zp-payload-status">Status: 201 Created</span>
                </div>
                <pre className="zp-payload-code">
                  {JSON.stringify(
                    {
                      chatId: simRecipient.replace(/\D/g, '') + '@c.us',
                      type: simType,
                      text: simText,
                      metadata: {
                        client: 'Zaptura Cloud Engine v2.4',
                        sentAt: new Date().toISOString(),
                        ackStatus: 'DELIVERED',
                      },
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>
            </div>
          </div>

          {/* Right: Realistic Dark Mode WhatsApp Phone Mockup */}
          <div className="zp-sim-phone-col">
            <div className="zp-phone-wrapper">
              <div className="zp-phone-notch" />

              {/* WhatsApp App Header */}
              <div className="zp-wa-header">
                <div className="zp-wa-avatar">
                  <span>ZP</span>
                </div>
                <div className="zp-wa-contact">
                  <h4>Zaptura Notifications</h4>
                  <span className="zp-wa-status">
                    {simTyping ? (
                      <span className="zp-typing-indicator">typing...</span>
                    ) : (
                      'online · official business account'
                    )}
                  </span>
                </div>
                <div className="zp-wa-actions">
                  <span className="zp-wa-badge-verified">Verified</span>
                </div>
              </div>

              {/* WhatsApp Chat Body */}
              <div className="zp-wa-body">
                <div className="zp-wa-security-alert">
                  <Lock size={11} />
                  <span>Messages are end-to-end encrypted with WhatsApp protocol.</span>
                </div>

                {messagesList.map(msg => (
                  <div key={msg.id} className={`zp-wa-bubble ${msg.from === 'out' ? 'out' : 'in'}`}>
                    {msg.type === 'image' && (
                      <div className="zp-wa-media-preview">
                        <ImageIcon size={28} className="zp-media-icon" />
                        <span>Growth_Chart_2026.png</span>
                      </div>
                    )}
                    {msg.type === 'doc' && (
                      <div className="zp-wa-doc-preview">
                        <FileText size={22} className="zp-doc-icon" />
                        <div>
                          <strong>Invoice_9821.pdf</strong>
                          <small>1.4 MB · PDF Document</small>
                        </div>
                      </div>
                    )}
                    {msg.type === 'voice' && (
                      <div className="zp-wa-voice-preview">
                        <Mic size={16} />
                        <div className="zp-wave-bar" />
                        <span>0:14</span>
                      </div>
                    )}

                    <p className="zp-wa-text">{msg.text}</p>

                    <div className="zp-wa-meta">
                      <span className="zp-wa-time">{msg.time}</span>
                      {msg.from === 'out' && <CheckCheck size={14} className="zp-wa-checks zp-checks-blue" />}
                    </div>
                  </div>
                ))}

                {simTyping && (
                  <div className="zp-wa-bubble in zp-wa-typing-bubble">
                    <span className="zp-dot" />
                    <span className="zp-dot" />
                    <span className="zp-dot" />
                  </div>
                )}
              </div>

              {/* Phone Footer */}
              <div className="zp-wa-footer">
                <span className="zp-wa-mock-input">Type a message...</span>
                <div className="zp-wa-send-btn">
                  <Send size={15} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DEVELOPER CODE SECTION ================= */}
      <section className="zp-section zp-section-alt" id="code">
        <div className="zp-section-header">
          <p className="zp-section-eyebrow">Developer-First Integration</p>
          <h2 className="zp-section-title">
            Integrate In Minutes, <span>Not Days</span>
          </h2>
          <p className="zp-section-desc">
            Use standard HTTP requests in any programming language or framework. Copy, paste, and run.
          </p>
        </div>

        <div className="zp-code-container">
          <div className="zp-code-window">
            <div className="zp-code-topbar">
              <div className="zp-code-dots">
                <span className="zp-dot-red" />
                <span className="zp-dot-yellow" />
                <span className="zp-dot-green" />
              </div>

              <div className="zp-code-tabs" role="tablist">
                {LANGS.map(id => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={lang === id}
                    className={`zp-code-tab ${lang === id ? 'active' : ''}`}
                    onClick={() => setLang(id)}
                  >
                    {id}
                  </button>
                ))}
              </div>

              <button type="button" onClick={handleCopyCode} className="zp-copy-btn" aria-label="Copy code snippet">
                {copied ? <CheckCheck size={14} className="zp-text-emerald" /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <div className="zp-code-body">
              <pre className="zp-pre">
                <code>{sample.code}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CORE FEATURES GRID ================= */}
      <section className="zp-section" id="features">
        <div className="zp-section-header">
          <p className="zp-section-eyebrow">Enterprise-Ready Architecture</p>
          <h2 className="zp-section-title">
            Engineered For Stability, <span>Speed & Scale</span>
          </h2>
          <p className="zp-section-desc">
            Everything your business needs to turn WhatsApp into an autonomous communication engine.
          </p>
        </div>

        <div className="zp-feature-grid">
          {[
            {
              icon: Layers,
              title: 'Multi-Session Virtualization',
              desc: 'Run 1 to 10+ concurrent WhatsApp numbers on independent virtual containers with zero cross-talk.',
              badge: 'Multi-Tenant',
            },
            {
              icon: Webhook,
              title: 'Sub-40ms Webhook Stream',
              desc: 'Bi-directional webhooks for incoming chats, status changes, and read receipts with HMAC signature verification.',
              badge: 'Ultra Fast',
            },
            {
              icon: Sparkles,
              title: 'Native AI & LLM Hooks',
              desc: 'Connect inbound conversations directly to LangChain, OpenAI GPT-4o, Claude, or n8n workflow automations.',
              badge: 'AI Ready',
            },
            {
              icon: Lock,
              title: 'Scoped Key Security',
              desc: 'Session-isolated API tokens ensure client operators can only access their allocated WhatsApp instances.',
              badge: 'AES-256',
            },
            {
              icon: Cpu,
              title: 'Auto-Healing Watchdog',
              desc: 'Proactive session health monitoring automatically re-establishes dropped sockets without manual QR scans.',
              badge: '99.99% Uptime',
            },
            {
              icon: Code2,
              title: 'Full OpenAPI & Swagger UI',
              desc: 'Interactive schema inspection at /api/docs with TypeScript typings, Postman export, and auto-generated clients.',
              badge: 'OpenAPI 3.0',
            },
          ].map((f, i) => (
            <div className="zp-feature-card" key={i}>
              <div className="zp-feature-top">
                <div className="zp-feature-icon-wrap">
                  <f.icon size={22} className="zp-text-emerald" />
                </div>
                <span className="zp-feature-badge">{f.badge}</span>
              </div>
              <h3 className="zp-feature-name">{f.title}</h3>
              <p className="zp-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= ROI & COST SAVINGS CALCULATOR ================= */}
      <section className="zp-section zp-section-alt">
        <div className="zp-section-header">
          <p className="zp-section-eyebrow">Cost Comparison Calculator</p>
          <h2 className="zp-section-title">
            Stop Paying The <span>Meta Conversation Tax</span>
          </h2>
          <p className="zp-section-desc">
            Meta Cloud charges $0.04 to $0.08 per 24h conversation. With Zaptura, your messaging is 100% unlimited.
          </p>
        </div>

        <div className="zp-roi-container">
          <div className="zp-roi-card">
            <div className="zp-roi-slider-block">
              <div className="zp-roi-slider-header">
                <span>Estimated Monthly Outbound Messages:</span>
                <strong className="zp-roi-count">{monthlyVolume.toLocaleString()} msgs / month</strong>
              </div>
              <input
                type="range"
                min={5000}
                max={150000}
                step={5000}
                value={monthlyVolume}
                onChange={e => setMonthlyVolume(Number(e.target.value))}
                className="zp-range-slider"
              />
              <div className="zp-roi-slider-ticks">
                <span>5k</span>
                <span>25k</span>
                <span>50k</span>
                <span>100k</span>
                <span>150k+</span>
              </div>
            </div>

            <div className="zp-roi-comparison-grid">
              <div className="zp-roi-box zp-roi-meta">
                <span className="zp-roi-box-label">Meta Cloud API / Twilio</span>
                <div className="zp-roi-price">
                  ${metaCost}
                  <span>/mo</span>
                </div>
                <p className="zp-roi-box-sub">Pay-per-conversation markup + conversation window expirations.</p>
              </div>

              <div className="zp-roi-vs">VS</div>

              <div className="zp-roi-box zp-roi-zaptura">
                <span className="zp-roi-box-label zp-text-emerald">Zaptura Flat SaaS</span>
                <div className="zp-roi-price zp-text-emerald">
                  ${zapturaCost}
                  <span>/mo</span>
                </div>
                <p className="zp-roi-box-sub">Zero per-message fees. Unlimited messaging capacity.</p>
              </div>
            </div>

            <div className="zp-roi-savings-banner">
              <Sparkles size={20} className="zp-text-emerald" />
              <span>
                You save approximately <strong>${annualSavings.toLocaleString()} per year</strong> by switching to
                Zaptura!
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS (3 STEPS) ================= */}
      <section className="zp-section" id="how-it-works">
        <div className="zp-section-header">
          <p className="zp-section-eyebrow">Frictionless 3-Step Setup</p>
          <h2 className="zp-section-title">
            From Zero to Sending in <span>Under 60 Seconds</span>
          </h2>
        </div>

        <div className="zp-steps-grid">
          <div className="zp-step-card">
            <div className="zp-step-num">01</div>
            <div className="zp-step-icon">
              <Users size={26} className="zp-text-emerald" />
            </div>
            <h3>Create Zaptura Account</h3>
            <p>Sign up instantly with email. Choose your plan tier or enjoy the 3-day instant free access.</p>
          </div>

          <div className="zp-step-card">
            <div className="zp-step-num">02</div>
            <div className="zp-step-icon">
              <QrCode size={26} className="zp-text-cyan" />
            </div>
            <h3>Scan WhatsApp Web QR</h3>
            <p>Open WhatsApp on your phone &gt; Linked Devices &gt; Scan the on-screen QR code to pair.</p>
          </div>

          <div className="zp-step-card">
            <div className="zp-step-num">03</div>
            <div className="zp-step-icon">
              <Send size={26} className="zp-text-amber" />
            </div>
            <h3>Dispatch & Automate</h3>
            <p>Copy your scoped API key and start sending automated alerts, notifications, or AI replies.</p>
          </div>
        </div>
      </section>

      {/* ================= PRICING SECTION ================= */}
      <section className="zp-section zp-section-alt" id="pricing">
        <div className="zp-section-header">
          <p className="zp-section-eyebrow">Clear, Predictable Pricing</p>
          <h2 className="zp-section-title">
            Simple Plans. <span>Zero Hidden Costs.</span>
          </h2>
          <p className="zp-section-desc">
            Scale your WhatsApp operations with predictable flat pricing. Billing mocked in v1 preview.
          </p>
        </div>

        <div className="zp-billing-toggle-wrap">
          <div className="zp-billing-toggle">
            <button type="button" className={!yearly ? 'active' : ''} onClick={() => setYearly(false)}>
              Monthly Billing
            </button>
            <button type="button" className={yearly ? 'active' : ''} onClick={() => setYearly(true)}>
              Annual Billing <span className="zp-save-pill">Save 15%</span>
            </button>
          </div>
        </div>

        <div className="zp-pricing-grid">
          {NX_PLANS.map(plan => {
            const price = yearly ? Math.round(plan.monthly * 12 * 0.85) : plan.monthly;
            return (
              <div key={plan.id} className={`zp-pricing-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && (
                  <div className="zp-popular-badge">
                    <Star size={12} fill="currentColor" />
                    <span>Most Popular Choice</span>
                  </div>
                )}

                <div className="zp-card-header">
                  <h3 className="zp-plan-name">{plan.name}</h3>
                  <p className="zp-plan-blurb">{plan.blurb}</p>
                </div>

                <div className="zp-plan-cost">
                  <div className="zp-plan-amount">
                    ${price}
                    <span className="zp-plan-cycle">{yearly ? '/year' : '/month'}</span>
                  </div>
                  <span className="zp-plan-unit">${plan.perSession} per active session</span>
                </div>

                <ul className="zp-plan-features">
                  <li className="zp-feature-highlight">
                    <Check size={16} className="zp-text-emerald" />
                    <strong>
                      {plan.sessions} Linked WhatsApp {plan.sessions > 1 ? 'Numbers' : 'Number'}
                    </strong>
                  </li>
                  {NX_PLAN_FEATURES.map((feat, idx) => (
                    <li key={idx}>
                      <Check size={14} className="zp-text-emerald" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className={`zp-btn ${plan.popular ? 'zp-btn-primary' : 'zp-btn-outline'} zp-btn-full`}
                >
                  <span>{plan.popular ? 'Start Free Trial Now' : 'Select ' + plan.name}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= FAQ SECTION ================= */}
      <section className="zp-section" id="faq">
        <div className="zp-section-header">
          <p className="zp-section-eyebrow">Got Questions?</p>
          <h2 className="zp-section-title">
            Frequently Asked <span>Questions</span>
          </h2>
        </div>

        <div className="zp-faq-list">
          {FAQ_ITEMS.map((item, idx) => (
            <div key={idx} className={`zp-faq-item ${openFaq === idx ? 'open' : ''}`}>
              <button
                type="button"
                className="zp-faq-question"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                aria-expanded={openFaq === idx}
              >
                <span>{item.q}</span>
                <ChevronDown size={18} className="zp-faq-chevron" />
              </button>
              {openFaq === idx && (
                <div className="zp-faq-answer">
                  <p>{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ================= HIGH-IMPACT FINAL CTA ================= */}
      <section className="zp-cta-section">
        <div className="zp-cta-box">
          <div className="zp-cta-glow" aria-hidden="true" />
          <h2 className="zp-cta-title">Ready to Supercharge Your WhatsApp Communications?</h2>
          <p className="zp-cta-desc">
            Deploy your first WhatsApp session in seconds. No per-message fees, no complex Meta verification, and
            complete REST API automation.
          </p>

          <div className="zp-cta-actions">
            <Link to="/register" className="zp-btn zp-btn-primary zp-btn-xl">
              <span>Claim Your 3-Day Free Trial</span>
              <ArrowRight size={18} className="zp-btn-arrow" />
            </Link>
            <Link to="/docs" className="zp-btn zp-btn-outline zp-btn-xl">
              <span>Read API Documentation</span>
            </Link>
          </div>

          <div className="zp-cta-guarantees">
            <span>✓ Instant QR pairing</span>
            <span>✓ Full OpenAPI & Swagger access</span>
            <span>✓ Cancel anytime with 1 click</span>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
