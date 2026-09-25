import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  Code2,
  Copy,
  CheckCheck,
  Clock,
  Cpu,
  CreditCard,
  FileText,
  Image as ImageIcon,
  Layers,
  Lock,
  MessageSquare,
  Mic,
  Pause,
  Play,
  Plus,
  QrCode,
  RotateCcw,
  Send,
  Smartphone,
  Smile,
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

interface DemoButton {
  id: string;
  label: string;
  action: string;
}

interface DemoMessage {
  id: number | string;
  from: 'out' | 'in';
  text: string;
  type: MsgType;
  time: string;
  status?: 'pending' | 'sent' | 'delivered' | 'read';
  buttons?: DemoButton[];
  mediaName?: string;
  mediaSize?: string;
  mediaDuration?: string;
  isOtp?: boolean;
  otpCode?: string;
}

const SCENARIOS: Record<string, { label: string; messages: DemoMessage[] }> = {
  ecommerce: {
    label: '🛒 Order Tracking',
    messages: [
      {
        id: 'ec-1',
        from: 'in',
        text: 'Hi! Can you give me a status update on order #9482?',
        type: 'text',
        time: '10:41 AM',
        status: 'read',
      },
      {
        id: 'ec-2',
        from: 'out',
        text: '📦 Order #9482 has been dispatched!\n\nDriver: Michael S. (+1 555-0192)\nEst. Delivery: Today by 4:30 PM\nDestination: 742 Evergreen Terrace',
        type: 'text',
        time: '10:42 AM',
        status: 'read',
        buttons: [
          { id: 'track_live', label: '🚚 Live GPS Map', action: 'track' },
          { id: 'view_items', label: '📦 View Package (2)', action: 'items' },
          { id: 'change_addr', label: '📍 Change Address', action: 'address' },
        ],
      },
    ],
  },
  otp: {
    label: '🔐 2FA Auth OTP',
    messages: [
      {
        id: 'otp-1',
        from: 'in',
        text: 'Send verification code for developer login',
        type: 'text',
        time: '10:44 AM',
        status: 'read',
      },
      {
        id: 'otp-2',
        from: 'out',
        text: '🔐 *Zaptura Cloud Verification Code*\n\nYour one-time authentication code is:\n\n*849-204*\n\n(Expires in 10 minutes. Do NOT share with anyone).',
        type: 'text',
        time: '10:44 AM',
        status: 'read',
        isOtp: true,
        otpCode: '849-204',
        buttons: [{ id: 'copy_otp', label: '📋 Copy Code: 849-204', action: 'copy_otp' }],
      },
    ],
  },
  ai: {
    label: '🤖 AI Support Agent',
    messages: [
      {
        id: 'ai-1',
        from: 'in',
        text: 'What makes Zaptura faster than official Meta Cloud API?',
        type: 'text',
        time: '10:45 AM',
        status: 'read',
      },
      {
        id: 'ai-2',
        from: 'out',
        text: '⚡ *Zaptura Autonomous Engine* connects direct Baileys sockets without per-conversation fees:\n\n• Zero markup on messages (save up to 90%)\n• 18ms dispatch latency\n• Automated session self-healing\n• Full rich media + button templates',
        type: 'text',
        time: '10:45 AM',
        status: 'read',
        buttons: [
          { id: 'view_plans', label: '💳 View Pricing', action: 'pricing' },
          { id: 'test_voice', label: '🎙 Listen to Audio Sample', action: 'voice' },
        ],
      },
    ],
  },
  voice: {
    label: '🎙 Audio Note',
    messages: [
      {
        id: 'v-1',
        from: 'in',
        text: 'Send me a simulated voice note message',
        type: 'text',
        time: '10:46 AM',
        status: 'read',
      },
      {
        id: 'v-2',
        from: 'out',
        text: '🎙 Voice note dispatched via Baileys audio stream (OPUS codec)',
        type: 'voice',
        mediaDuration: '0:14',
        time: '10:46 AM',
        status: 'read',
      },
    ],
  },
  doc: {
    label: '📄 PDF Invoice',
    messages: [
      {
        id: 'doc-1',
        from: 'in',
        text: 'Can I get a copy of my latest invoice?',
        type: 'text',
        time: '10:47 AM',
        status: 'read',
      },
      {
        id: 'doc-2',
        from: 'out',
        text: '📄 Here is your invoice #ZAP-9821. Generated synchronously via API.',
        type: 'doc',
        mediaName: 'Invoice_ZAP_9821.pdf',
        mediaSize: '1.4 MB · PDF Document',
        time: '10:48 AM',
        status: 'read',
      },
    ],
  },
};

export function Landing() {
  useDocumentTitle('Zaptura — Autonomous WhatsApp API & Automation Cloud');

  const [lang, setLang] = useState<(typeof LANGS)[number]>('JS');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [yearly, setYearly] = useState(false);
  const [copied, setCopied] = useState(false);

  // Live WhatsApp Simulator State (Mobile First & Interactive)
  const [mobileTab, setMobileTab] = useState<'phone' | 'api'>('phone');
  const [activeScenario, setActiveScenario] = useState<string>('ecommerce');
  const [simType, setSimType] = useState<MsgType>('text');
  const [simText, setSimText] = useState('Order #9482 confirmed! Your tracking link is ready.');
  const [simRecipient, setSimRecipient] = useState('+1 (555) 382-9012');
  const [phoneInput, setPhoneInput] = useState('');
  const [simTyping, setSimTyping] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | number | null>(null);
  const [voiceProgress, setVoiceProgress] = useState(0);
  const [apiViewTab, setApiViewTab] = useState<'request' | 'webhook'>('request');
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const [messagesList, setMessagesList] = useState<DemoMessage[]>(SCENARIOS.ecommerce.messages);
  const [lastPayload, setLastPayload] = useState<any>({
    endpoint: '/api/sessions/zap_prod_01/messages/send-text',
    method: 'POST',
    status: 200,
    latencyMs: 18,
    request: {
      chatId: '15553829012@s.whatsapp.net',
      type: 'text',
      text: 'Order #9482 has been dispatched!',
      metadata: {
        engine: 'Baileys Multi-Device Socket',
        sentAt: new Date().toISOString(),
        ackStatus: 'READ',
      },
    },
    webhook: {
      event: 'messages.upsert',
      session: 'zap_prod_01',
      data: {
        key: { remoteJid: '15553829012@s.whatsapp.net', fromMe: false },
        message: { conversation: 'Hi! Can you give me a status update on order #9482?' },
        messageTimestamp: Math.floor(Date.now() / 1000),
      },
    },
  });

  // Voice note timer effect
  useEffect(() => {
    if (!playingVoiceId) return;
    const interval = setInterval(() => {
      setVoiceProgress(prev => {
        if (prev >= 100) {
          setPlayingVoiceId(null);
          return 0;
        }
        return prev + 12;
      });
    }, 300);
    return () => clearInterval(interval);
  }, [playingVoiceId]);

  // Auto-scroll chat body
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messagesList, simTyping]);

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 2500);
  };

  const loadScenario = (key: string) => {
    setActiveScenario(key);
    setSimTyping(false);
    setPlayingVoiceId(null);
    setVoiceProgress(0);
    const scenario = SCENARIOS[key];
    if (!scenario) return;
    setMessagesList(scenario.messages);

    setLastPayload({
      endpoint: `/api/sessions/zap_prod_01/scenarios/${key}`,
      method: 'POST',
      status: 200,
      latencyMs: 15,
      request: {
        scenario: key,
        recipient: simRecipient.replace(/\D/g, '') + '@s.whatsapp.net',
        timestamp: new Date().toISOString(),
      },
      webhook: {
        event: 'messages.upsert',
        session: 'zap_prod_01',
        data: {
          key: { remoteJid: simRecipient.replace(/\D/g, '') + '@s.whatsapp.net', fromMe: false },
          scenarioLoaded: key,
        },
      },
    });
  };

  const handleButtonClick = (btn: DemoButton) => {
    if (btn.action === 'copy_otp') {
      navigator.clipboard?.writeText('849-204');
      showToast('Copied OTP Code: 849-204 to clipboard! 📋');
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = Date.now();

    setMessagesList(prev => [
      ...prev,
      {
        id: userMsgId,
        from: 'in',
        text: btn.label,
        type: 'text',
        time: timeStr,
        status: 'read',
      },
    ]);

    setLastPayload({
      endpoint: '/api/sessions/zap_prod_01/webhooks/interactive-reply',
      method: 'POST',
      status: 200,
      latencyMs: 14,
      request: {
        action: btn.action,
        buttonId: btn.id,
        selectedText: btn.label,
        chatId: simRecipient.replace(/\D/g, '') + '@s.whatsapp.net',
        timestamp: new Date().toISOString(),
      },
      webhook: {
        event: 'interactive.button_click',
        session: 'zap_prod_01',
        data: {
          selectedButtonId: btn.id,
          sender: simRecipient.replace(/\D/g, ''),
        },
      },
    });

    setSimTyping(true);
    setTimeout(() => {
      setSimTyping(false);
      let replyText = '';
      let replyButtons: DemoButton[] | undefined = undefined;

      if (btn.action === 'track') {
        replyText =
          '📍 Live GPS: Courier Michael S. is 1.4 miles away near Grand Ave. Delivery truck is on schedule for 4:30 PM. Live map: https://zap.to/track/9482';
        replyButtons = [
          { id: 'call_driver', label: '📞 Call Driver', action: 'call' },
          { id: 'leave_door', label: '🏠 Leave at Doorstep', action: 'door' },
        ];
      } else if (btn.action === 'items') {
        replyText =
          '📋 Package #9482 contains:\n1. 1x Wireless Mechanical Keyboard ($129)\n2. 1x Braided USB-C Cable ($20)\n\nTotal Paid: $149.00 USD.';
      } else if (btn.action === 'address') {
        replyText = '📍 Address Update: Please reply with your updated delivery address or apartment number.';
      } else if (btn.action === 'copy_otp') {
        replyText = '✅ One-Time Code verified! Developer authentication session activated for user dev@zaptura.io.';
      } else if (btn.action === 'pricing') {
        replyText =
          '💳 *Zaptura Tier Overview:*\n• Starter: $6/mo (10k msgs)\n• Growth: $15/mo (40k msgs)\n• Scale: $45/mo (unlimited)\n\nZero setup fees, cancel anytime.';
        replyButtons = [
          { id: 'start_trial', label: '🚀 Start Free Trial', action: 'trial' },
          { id: 'view_docs', label: '📄 Read API Docs', action: 'docs' },
        ];
      } else if (btn.action === 'voice') {
        loadScenario('voice');
        return;
      } else if (btn.action === 'call') {
        replyText = '📞 Calling Driver Michael S. (+1 555-0192)... Call bridged successfully via VoIP gateway.';
      } else if (btn.action === 'door') {
        replyText = '✅ Instruction noted! Package will be left securely at your doorstep.';
      } else if (btn.action === 'trial') {
        replyText =
          '🚀 Welcome aboard! Your sandbox session zap_prod_01 is now provisioned with 1,000 free test messages.';
      } else {
        replyText = `✅ Action "${btn.label}" confirmed and processed in 18ms.`;
      }

      setMessagesList(prev => [
        ...prev,
        {
          id: userMsgId + 1,
          from: 'out',
          text: replyText,
          type: 'text',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read',
          buttons: replyButtons,
        },
      ]);
    }, 900);
  };

  const dispatchMessage = (text: string, type: MsgType = 'text', fromUser = true) => {
    if (!text.trim()) return;

    const userMsgId = Date.now();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessagesList(prev => [
      ...prev,
      {
        id: userMsgId,
        from: fromUser ? 'in' : 'out',
        text,
        type,
        time: timeStr,
        status: 'pending',
      },
    ]);

    setTimeout(() => {
      setMessagesList(prev => prev.map(m => (m.id === userMsgId ? { ...m, status: 'sent' } : m)));
    }, 200);
    setTimeout(() => {
      setMessagesList(prev => prev.map(m => (m.id === userMsgId ? { ...m, status: 'delivered' } : m)));
    }, 450);
    setTimeout(() => {
      setMessagesList(prev => prev.map(m => (m.id === userMsgId ? { ...m, status: 'read' } : m)));
    }, 700);

    setLastPayload({
      endpoint: `/api/sessions/zap_prod_01/messages/send-${type}`,
      method: 'POST',
      status: 201,
      latencyMs: 18,
      request: {
        chatId: simRecipient.replace(/\D/g, '') + '@s.whatsapp.net',
        type,
        text,
        metadata: {
          engine: 'Baileys Multi-Device Socket',
          sentAt: new Date().toISOString(),
          ack: 3,
        },
      },
      webhook: {
        event: 'messages.upsert',
        session: 'zap_prod_01',
        data: {
          key: { id: `wamid.${userMsgId}`, fromMe: !fromUser },
          message: { conversation: text },
          status: 'DELIVERED',
        },
      },
    });

    setSimTyping(true);
    setTimeout(() => {
      setSimTyping(false);
      const lower = text.toLowerCase();
      let replyText = '';
      let replyType: MsgType = 'text';
      let replyButtons: DemoButton[] | undefined = undefined;
      let isOtp = false;
      let otpCode: string | undefined = undefined;
      let mediaName: string | undefined = undefined;
      let mediaSize: string | undefined = undefined;
      let mediaDuration: string | undefined = undefined;

      if (
        lower.includes('track') ||
        lower.includes('order') ||
        lower.includes('package') ||
        lower.includes('shipping')
      ) {
        replyText =
          '📦 Order #9482 is in transit!\n\nDriver: Michael S. (+1 555-0192)\nEst. Delivery: Today by 4:30 PM\nDestination: 742 Evergreen Terrace';
        replyButtons = [
          { id: 'track_live', label: '🚚 Live GPS Map', action: 'track' },
          { id: 'view_items', label: '📦 View Package (2)', action: 'items' },
        ];
      } else if (lower.includes('otp') || lower.includes('code') || lower.includes('auth') || lower.includes('2fa')) {
        replyText =
          '🔐 *Zaptura Cloud Verification Code*\n\nYour one-time authentication code is:\n\n*849-204*\n\n(Expires in 10 minutes. Do NOT share with anyone).';
        isOtp = true;
        otpCode = '849-204';
        replyButtons = [{ id: 'copy_otp', label: '📋 Copy Code: 849-204', action: 'copy_otp' }];
      } else if (
        lower.includes('price') ||
        lower.includes('pricing') ||
        lower.includes('cost') ||
        lower.includes('plan')
      ) {
        replyText =
          '💳 *Zaptura Pricing Plans:*\n\n• Starter: $6/mo (10k messages)\n• Growth: $15/mo (40k messages)\n• Scale: $45/mo (unlimited)\n\nZero per-conversation fees, zero Meta markup. Full REST + WebSocket API included!';
        replyButtons = [
          { id: 'start_trial', label: '🚀 Start Free Trial', action: 'trial' },
          { id: 'view_docs', label: '📄 API Documentation', action: 'docs' },
        ];
      } else if (lower.includes('voice') || lower.includes('audio') || lower.includes('mic')) {
        replyType = 'voice';
        replyText = '🎙 Voice note dispatched via Baileys audio stream (OPUS codec)';
        mediaDuration = '0:14';
      } else if (lower.includes('doc') || lower.includes('pdf') || lower.includes('invoice') || lower.includes('file')) {
        replyType = 'doc';
        replyText = '📄 Generated Invoice_ZAP_9821.pdf dispatched via API';
        mediaName = 'Invoice_ZAP_9821.pdf';
        mediaSize = '1.4 MB · PDF Document';
      } else if (
        lower.includes('image') ||
        lower.includes('photo') ||
        lower.includes('picture') ||
        lower.includes('media')
      ) {
        replyType = 'image';
        replyText = '📊 Fleet_Telemetry_Report.png rendered and dispatched via cloud container.';
        mediaName = 'Fleet_Telemetry_Report.png';
        mediaSize = '840 KB';
      } else if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
        replyText =
          '👋 Hello! I am the Zaptura Autonomous Assistant running live on a Baileys container. Ask me for order tracking, OTP verification, audio notes, or system pricing!';
        replyButtons = [
          { id: 'track_live', label: '🛒 Track Order', action: 'track' },
          { id: 'req_otp', label: '🔐 Request OTP', action: 'copy_otp' },
          { id: 'view_plans', label: '💳 View Pricing', action: 'pricing' },
        ];
      } else {
        replyText = `⚡ Autonomous AI Bot: Received "${text.length > 28 ? text.slice(0, 28) + '...' : text}". Handled via Baileys socket in 18ms with 99.99% gateway uptime.`;
        replyButtons = [
          { id: 'track_live', label: '🛒 Track Order #9482', action: 'track' },
          { id: 'view_plans', label: '💳 View Plans', action: 'pricing' },
        ];
      }

      setMessagesList(prev => [
        ...prev,
        {
          id: userMsgId + 1,
          from: 'out',
          text: replyText,
          type: replyType,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read',
          buttons: replyButtons,
          isOtp,
          otpCode,
          mediaName,
          mediaSize,
          mediaDuration,
        },
      ]);
    }, 950);
  };

  const handleSimulateSend = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!simText.trim()) return;
    dispatchMessage(simText, simType, false);
  };

  const handlePhoneSend = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!phoneInput.trim()) return;
    dispatchMessage(phoneInput, 'text', true);
    setPhoneInput('');
  };

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
            <a href="#demo" className="zp-btn zp-btn-outline zp-btn-xl">
              <span>Launch Live Demo</span>
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

      {/* ================= INTERACTIVE DEMO ================= */}
      <section className="zp-section" id="demo">
        <div className="zp-section-header">
          <p className="zp-section-eyebrow">Mobile-First Testing Sandbox</p>
          <h2 className="zp-section-title">
            Test The Zaptura Gateway <span>In Real-Time</span>
          </h2>
          <p className="zp-section-desc">
            Interact directly with the simulated WhatsApp client below or dispatch payloads via the developer API. Type
            freely, tap interactive buttons, play voice notes, and inspect synchronized webhook events.
          </p>
        </div>

        {/* Mobile View Toggle Switch (phones & tablets) */}
        <div className="zp-mobile-view-tabs" role="tablist" aria-label="Demo View Switcher">
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === 'phone'}
            className={`zp-mobile-tab-btn ${mobileTab === 'phone' ? 'active' : ''}`}
            onClick={() => setMobileTab('phone')}
          >
            <Smartphone size={16} />
            <span>Live WhatsApp Client</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobileTab === 'api'}
            className={`zp-mobile-tab-btn ${mobileTab === 'api' ? 'active' : ''}`}
            onClick={() => setMobileTab('api')}
          >
            <Terminal size={16} />
            <span>Developer API & JSON</span>
          </button>
        </div>

        {/* Quick Scenario Pills */}
        <div className="zp-scenario-bar">
          <span className="zp-scenario-label">Try Prebuilt Bot Scenarios:</span>
          <div className="zp-scenario-pills">
            {Object.entries(SCENARIOS).map(([key, item]) => (
              <button
                key={key}
                type="button"
                className={`zp-scenario-btn ${activeScenario === key ? 'active' : ''}`}
                onClick={() => loadScenario(key)}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              className="zp-scenario-btn zp-scenario-reset"
              onClick={() => {
                loadScenario('ecommerce');
                showToast('Chat history reset to default scenario');
              }}
              title="Reset conversation"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Toast Feedback */}
        {toastNotice && (
          <div className="zp-demo-toast" role="status">
            <Sparkles size={14} className="zp-text-emerald" />
            <span>{toastNotice}</span>
          </div>
        )}

        <div className="zp-sim-layout">
          {/* Left: Composer & Real-Time JSON Payload (shown on desktop or when 'api' is selected on mobile) */}
          <div className={`zp-sim-composer-col ${mobileTab === 'phone' ? 'zp-mobile-hidden' : ''}`}>
            <div className="zp-sim-card">
              <div className="zp-sim-card-header">
                <div className="zp-sim-card-title">
                  <Terminal size={17} className="zp-text-emerald" />
                  <span>Interactive Dispatch Composer</span>
                </div>
                <span className="zp-tag-online">Session: zap_prod_01</span>
              </div>

              <form onSubmit={handleSimulateSend} className="zp-sim-form">
                <div className="zp-sim-field">
                  <label>Recipient WhatsApp Number (E.164)</label>
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

              {/* Real-time Dual-Tab JSON Payload Inspector */}
              <div className="zp-sim-payload-box">
                <div className="zp-payload-tabs">
                  <button
                    type="button"
                    className={`zp-payload-tab ${apiViewTab === 'request' ? 'active' : ''}`}
                    onClick={() => setApiViewTab('request')}
                  >
                    <span>POST REST Request</span>
                  </button>
                  <button
                    type="button"
                    className={`zp-payload-tab ${apiViewTab === 'webhook' ? 'active' : ''}`}
                    onClick={() => setApiViewTab('webhook')}
                  >
                    <span>Inbound Webhook Event</span>
                  </button>
                </div>

                <div className="zp-payload-header">
                  <span>{apiViewTab === 'request' ? lastPayload.endpoint : 'EVENT /api/webhooks/whatsapp'}</span>
                  <span className="zp-payload-status">
                    {lastPayload.status} OK · {lastPayload.latencyMs}ms
                  </span>
                </div>
                <pre className="zp-payload-code">
                  {JSON.stringify(apiViewTab === 'request' ? lastPayload.request : lastPayload.webhook, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* Right: Realistic Dark Mode WhatsApp iPhone Mockup (shown on desktop or when 'phone' is selected on mobile) */}
          <div className={`zp-sim-phone-col ${mobileTab === 'api' ? 'zp-mobile-hidden' : ''}`}>
            <div className="zp-phone-wrapper">
              {/* iPhone Dynamic Island & Status Bar */}
              <div className="zp-iphone-status-bar">
                <span className="zp-iphone-time">9:41</span>
                <div className="zp-iphone-island">
                  <div className="zp-iphone-island-cam" />
                </div>
                <div className="zp-iphone-status-icons">
                  <span className="zp-iphone-net">5G</span>
                  <div className="zp-iphone-battery">
                    <div className="zp-iphone-battery-fill" />
                  </div>
                </div>
              </div>

              {/* WhatsApp App Header */}
              <div className="zp-wa-header">
                <ChevronLeft size={20} className="zp-wa-back" onClick={() => loadScenario('ecommerce')} />
                <div className="zp-wa-avatar">
                  <span>ZP</span>
                  <span className="zp-wa-avatar-badge" />
                </div>
                <div className="zp-wa-contact">
                  <h4>Zaptura Assistant</h4>
                  <span className="zp-wa-status">
                    {simTyping ? (
                      <span className="zp-typing-indicator">typing...</span>
                    ) : (
                      'online · official business account'
                    )}
                  </span>
                </div>
                <div className="zp-wa-actions">
                  <button
                    type="button"
                    className="zp-wa-icon-action"
                    onClick={() => {
                      loadScenario('ecommerce');
                      showToast('Chat restarted');
                    }}
                    title="Restart Demo"
                    aria-label="Restart Demo"
                  >
                    <RotateCcw size={15} />
                  </button>
                  <span className="zp-wa-badge-verified">Verified</span>
                </div>
              </div>

              {/* WhatsApp Chat Body */}
              <div className="zp-wa-body" ref={chatBodyRef}>
                <div className="zp-wa-security-alert">
                  <Lock size={11} />
                  <span>Messages are end-to-end encrypted with WhatsApp protocol.</span>
                </div>

                {messagesList.map(msg => (
                  <div key={msg.id} className={`zp-wa-bubble ${msg.from === 'out' ? 'out' : 'in'}`}>
                    {/* Media Attachments */}
                    {msg.type === 'image' && (
                      <div className="zp-wa-media-preview">
                        <ImageIcon size={26} className="zp-media-icon" />
                        <div className="zp-wa-media-info">
                          <strong>{msg.mediaName || 'Growth_Chart_2026.png'}</strong>
                          <small>{msg.mediaSize || '840 KB · PNG Image'}</small>
                        </div>
                      </div>
                    )}

                    {msg.type === 'doc' && (
                      <div className="zp-wa-doc-preview">
                        <FileText size={24} className="zp-doc-icon" />
                        <div className="zp-wa-doc-info">
                          <strong>{msg.mediaName || 'Invoice_9821.pdf'}</strong>
                          <small>{msg.mediaSize || '1.4 MB · PDF Document'}</small>
                        </div>
                      </div>
                    )}

                    {msg.type === 'voice' && (
                      <div className="zp-wa-voice-card">
                        <button
                          type="button"
                          className="zp-wa-voice-play-btn"
                          onClick={() => {
                            if (playingVoiceId === msg.id) {
                              setPlayingVoiceId(null);
                            } else {
                              setPlayingVoiceId(msg.id);
                              setVoiceProgress(0);
                            }
                          }}
                          aria-label={playingVoiceId === msg.id ? 'Pause voice message' : 'Play voice message'}
                        >
                          {playingVoiceId === msg.id ? <Pause size={14} /> : <Play size={14} className="zp-play-icon" />}
                        </button>
                        <div className="zp-wa-voice-waveform">
                          <div
                            className={`zp-wa-wave-visual ${playingVoiceId === msg.id ? 'playing' : ''}`}
                            style={{
                              backgroundSize: `${playingVoiceId === msg.id ? voiceProgress : 0}% 100%`,
                            }}
                          />
                          <div className="zp-wa-voice-time">
                            <span>{playingVoiceId === msg.id ? `0:0${Math.floor(voiceProgress / 8)}` : (msg.mediaDuration || '0:14')}</span>
                            <span className="zp-wa-voice-tag">OPUS 48kHz</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Message Text with newlines */}
                    <p className="zp-wa-text">{msg.text}</p>

                    {/* Clickable Interactive WhatsApp Buttons */}
                    {msg.buttons && msg.buttons.length > 0 && (
                      <div className="zp-wa-btn-group">
                        {msg.buttons.map(btn => (
                          <button
                            key={btn.id}
                            type="button"
                            className="zp-wa-action-btn"
                            onClick={() => handleButtonClick(btn)}
                          >
                            <span>{btn.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Timestamp & Delivery States */}
                    <div className="zp-wa-meta">
                      <span className="zp-wa-time">{msg.time}</span>
                      {msg.from === 'in' ? (
                        msg.status === 'pending' ? (
                          <Clock size={12} className="zp-wa-checks" />
                        ) : msg.status === 'sent' ? (
                          <Check size={13} className="zp-wa-checks" />
                        ) : msg.status === 'delivered' ? (
                          <CheckCheck size={14} className="zp-wa-checks" />
                        ) : (
                          <CheckCheck size={14} className="zp-wa-checks zp-checks-blue" />
                        )
                      ) : (
                        <CheckCheck size={14} className="zp-wa-checks zp-checks-blue" />
                      )}
                    </div>
                  </div>
                ))}

                {/* Animated Typing Indicator */}
                {simTyping && (
                  <div className="zp-wa-bubble out zp-wa-typing-bubble">
                    <span className="zp-dot" />
                    <span className="zp-dot" />
                    <span className="zp-dot" />
                  </div>
                )}
              </div>

              {/* Realistic Interactive In-Phone WhatsApp Input Bar */}
              <form onSubmit={handlePhoneSend} className="zp-wa-footer">
                <button
                  type="button"
                  className="zp-wa-attach-btn"
                  onClick={() => dispatchMessage('📊 Attached: System_Architecture.png', 'image', true)}
                  title="Attach media"
                  aria-label="Attach media"
                >
                  <Plus size={18} />
                </button>
                <div className="zp-wa-input-container">
                  <Smile size={16} className="zp-wa-emoji-icon" />
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value)}
                    placeholder="Type a message to the bot..."
                    className="zp-wa-real-input"
                  />
                </div>
                <button
                  type="submit"
                  className={`zp-wa-send-btn ${phoneInput.trim() ? 'active' : ''}`}
                  title="Send message"
                  aria-label="Send message"
                >
                  {phoneInput.trim() ? <Send size={15} /> : <Mic size={16} />}
                </button>
              </form>

              {/* iPhone Home Indicator */}
              <div className="zp-iphone-home-indicator">
                <div className="zp-iphone-home-pill" />
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
                <label htmlFor="monthly-volume">Estimated Monthly Outbound Messages:</label>
                <strong className="zp-roi-count">{monthlyVolume.toLocaleString()} msgs / month</strong>
              </div>
              <input
                id="monthly-volume"
                type="range"
                aria-label="Estimated Monthly Outbound Messages"
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
            Scale your WhatsApp operations with predictable flat pricing in Zaptura.
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
                      {plan.sessions} Linked WhatsApp {plan.sessions > 1 ? 'Accounts' : 'Account'}
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
                  to={`/register?plan=${plan.id}`}
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
