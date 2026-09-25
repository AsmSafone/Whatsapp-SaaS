export const NX_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    monthly: 6,
    sessions: 1,
    perSession: '6.00',
    blurb: 'Ideal for indie hackers and solo founders seeking 1 dedicated WhatsApp number for automated notifications.',
    popular: false,
    highlight: 'Instant Setup · 1 Account',
  },
  {
    id: 'pro',
    name: 'Pro Automation',
    monthly: 15,
    sessions: 3,
    perSession: '5.00',
    blurb: 'Engineered for growing businesses managing up to 3 numbers with bi-directional AI bot workflows.',
    popular: true,
    highlight: 'Most Popular · AI Ready',
  },
  {
    id: 'plus',
    name: 'Scale Plus',
    monthly: 30,
    sessions: 6,
    perSession: '5.00',
    blurb: 'Built for high-volume support desks and multi-brand routing across 6 isolated WhatsApp instances.',
    popular: false,
    highlight: 'High Throughput · 6 Accounts',
  },
  {
    id: 'business',
    name: 'Enterprise Cloud',
    monthly: 45,
    sessions: 10,
    perSession: '4.50',
    blurb: 'Maximum power for SaaS platforms, CRM integrations, and agency client fleets up to 10 sessions.',
    popular: false,
    highlight: 'Fleet Density · Dedicated Queue',
  },
] as const;

export type MatrixValue = boolean | string | null;
export interface MatrixRow {
  feature: string;
  tooltip?: string;
  values: [MatrixValue, MatrixValue, MatrixValue, MatrixValue]; // starter, pro, plus, enterprise
}
export interface MatrixGroup {
  category: string;
  icon: string;
  rows: MatrixRow[];
}



export const FEATURE_MATRIX: MatrixGroup[] = [
  {
    category: 'Sessions & Accounts',
    icon: '📱',
    rows: [
      {
        feature: 'Linked WhatsApp Accounts',
        tooltip: 'Number of simultaneous WhatsApp numbers you can connect',
        values: ['1 account', '3 accounts', '6 accounts', '10 accounts'],
      },
      {
        feature: 'Session Engine',
        tooltip: 'WebSocket engine used for persistent connections',
        values: ['Baileys', 'Baileys', 'Baileys + WWebJS', 'Baileys + WWebJS'],
      },
      {
        feature: 'Concurrent Active Sessions',
        values: ['1', '3', '6', '10'],
      },
      {
        feature: 'Session Auto-Reconnect',
        tooltip: 'Watchdog automatically restores dropped connections',
        values: [true, true, true, true],
      },
      {
        feature: 'Multi-Device (Linked Devices)',
        values: [true, true, true, true],
      },
    ],
  },
  {
    category: 'Messaging Capabilities',
    icon: '💬',
    rows: [
      {
        feature: 'Monthly Message Throughput',
        tooltip: 'Outbound + inbound messages counted together',
        values: ['10k msgs', '40k msgs', '150k msgs', 'Unlimited'],
      },
      {
        feature: 'Per-Message Fee',
        values: ['$0.00', '$0.00', '$0.00', '$0.00'],
      },
      {
        feature: 'Text & Emoji Messages',
        values: [true, true, true, true],
      },
      {
        feature: 'Media (Images, Video, Audio)',
        values: [true, true, true, true],
      },
      {
        feature: 'Document & PDF Dispatch',
        values: [true, true, true, true],
      },
      {
        feature: 'Voice Note (PTT) Sending',
        values: [true, true, true, true],
      },
      {
        feature: 'Location & Contact Cards',
        values: [true, true, true, true],
      },
      {
        feature: 'Polls & Reactions',
        values: [false, true, true, true],
      },
      {
        feature: 'Interactive Button Messages',
        values: [false, true, true, true],
      },
      {
        feature: 'List Messages / Menu Flows',
        values: [false, true, true, true],
      },
      {
        feature: 'Bulk Group Broadcast',
        tooltip: 'Dispatch to multiple groups or contacts in one API call',
        values: [false, false, true, true],
      },
      {
        feature: 'Channel (Newsletter) Posting',
        values: [false, false, true, true],
      },
    ],
  },
  {
    category: 'API & Integration',
    icon: '🔌',
    rows: [
      {
        feature: 'REST API Access',
        values: [true, true, true, true],
      },
      {
        feature: 'WebSocket Event Stream',
        values: [true, true, true, true],
      },
      {
        feature: 'OpenAPI 3.0 / Swagger UI',
        values: [true, true, true, true],
      },
      {
        feature: 'Inbound Webhooks + HMAC Signing',
        values: [true, true, true, true],
      },
      {
        feature: 'API Key Scoping & IP Allowlist',
        values: [true, true, true, true],
      },
      {
        feature: 'Rate Limit (req / min)',
        values: ['60 rpm', '300 rpm', '1 000 rpm', 'Unlimited'],
      },
      {
        feature: 'n8n / Make / Zapier Plugin',
        values: [false, true, true, true],
      },
      {
        feature: 'MCP Server Connector',
        tooltip: 'Connect LLM agents via the Model Context Protocol',
        values: [false, true, true, true],
      },
      {
        feature: 'Plugin Sandbox Support',
        values: [false, false, true, true],
      },
    ],
  },
  {
    category: 'AI & Automation',
    icon: '🤖',
    rows: [
      {
        feature: 'AI Chatbot Webhook Routing',
        values: [false, true, true, true],
      },
      {
        feature: 'Keyword & Intent Auto-Reply',
        values: [false, true, true, true],
      },
      {
        feature: 'Scheduled Message Queues',
        values: [false, true, true, true],
      },
      {
        feature: 'Flow Builder (Visual)',
        values: [false, false, true, true],
      },
      {
        feature: 'LLM-Powered Response Engine',
        tooltip: 'Use GPT / Gemini / Claude for autonomous bot replies',
        values: [false, false, true, true],
      },
      {
        feature: 'A/B Message Split Testing',
        values: [false, false, false, true],
      },
    ],
  },
  {
    category: 'Security & Compliance',
    icon: '🔐',
    rows: [
      {
        feature: 'AES-256 Session Encryption',
        values: [true, true, true, true],
      },
      {
        feature: 'Isolated API Key Per Session',
        values: [true, true, true, true],
      },
      {
        feature: 'Audit Log Retention',
        values: ['7 days', '30 days', '90 days', '1 year'],
      },
      {
        feature: 'IP Allowlist Enforcement',
        values: [true, true, true, true],
      },
      {
        feature: 'GDPR Data Export & Wipe',
        values: [false, true, true, true],
      },
      {
        feature: 'SOC 2 Report Access',
        values: [false, false, false, true],
      },
    ],
  },
  {
    category: 'Support & SLA',
    icon: '🛟',
    rows: [
      {
        feature: 'Support Channel',
        values: ['Community', 'Email', 'Priority Email', 'Dedicated Slack'],
      },
      {
        feature: 'Response Time SLA',
        values: ['Best effort', '< 24 h', '< 8 h', '< 1 h'],
      },
      {
        feature: 'Uptime SLA',
        values: ['99.5%', '99.9%', '99.95%', '99.99%'],
      },
      {
        feature: 'Onboarding Call',
        values: [false, false, true, true],
      },
      {
        feature: 'Custom Billing & Invoicing',
        values: [false, false, false, true],
      },
    ],
  },
];

export const CODE_SAMPLES: Record<string, { label: string; code: string }> = {
  JS: {
    label: 'Node / JS',
    code: `// Send WhatsApp text or rich media in 3 lines
const response = await fetch('https://zaptura.io/api/sessions/' + sessionId + '/messages/send-text', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.ZAPTURA_API_KEY
  },
  body: JSON.stringify({
    chatId: '15551234567@c.us',
    text: '⚡ Instant notification delivered via Zaptura WA Cloud!'
  })
});
const data = await response.json();
console.log('Dispatched message ID:', data.id);`,
  },
  Python: {
    label: 'Python',
    code: `import os, requests

# Dispatch instant message with Python requests
res = requests.post(
    f"https://zaptura.io/api/sessions/{session_id}/messages/send-text",
    headers={"X-API-Key": os.environ["ZAPTURA_API_KEY"]},
    json={
        "chatId": "15551234567@c.us",
        "text": "⚡ High-throughput alert powered by Zaptura WA!"
    }
)
print("Delivered status:", res.json())`,
  },
  cURL: {
    label: 'cURL',
    code: `curl -X POST "https://zaptura.io/api/sessions/$SESSION_ID/messages/send-text" \\
  -H "X-API-Key: $ZAPTURA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "chatId": "15551234567@c.us",
    "text": "⚡ Hello from Zaptura WhatsApp Cloud Gateway!"
  }'`,
  },
  Go: {
    label: 'Go',
    code: `package main

import (
    "bytes"
    "net/http"
    "os"
)

func main() {
    url := "https://zaptura.io/api/sessions/" + os.Getenv("SESSION_ID") + "/messages/send-text"
    payload := []byte(\`{"chatId":"15551234567@c.us","text":"⚡ Zaptura Go worker active"}\`)
    
    req, _ := http.NewRequest("POST", url, bytes.NewBuffer(payload))
    req.Header.Set("X-API-Key", os.Getenv("ZAPTURA_API_KEY"))
    req.Header.Set("Content-Type", "application/json")
    
    http.DefaultClient.Do(req)
}`,
  },
  PHP: {
    label: 'PHP',
    code: `<?php
$client = new \\GuzzleHttp\\Client();
$response = $client->post('https://zaptura.io/api/sessions/' . $sessionId . '/messages/send-text', [
  'headers' => [
    'X-API-Key' => getenv('ZAPTURA_API_KEY'),
    'Content-Type' => 'application/json'
  ],
  'json' => [
    'chatId' => '15551234567@c.us',
    'text'   => '⚡ Transactional alert dispatched from Zaptura WA.'
  ]
]);`,
  },
};

export const FAQ_ITEMS = [
  {
    q: 'What is Zaptura WA and how does it work?',
    a: 'Zaptura is an autonomous, developer-first WhatsApp gateway and SaaS management platform. It allows businesses and software developers to connect real WhatsApp numbers via multi-device QR authorization, sending and receiving messages programmatically via high-performance REST endpoints and webhooks without paying per-message Meta Cloud fees.',
  },
  {
    q: 'How fast can I get my first session running?',
    a: 'Under 30 seconds. Register your Zaptura account, click "New Session", and scan the instant QR code from your WhatsApp mobile app under "Linked Devices". You receive an isolated API key immediately to start dispatching messages.',
  },
  {
    q: 'Will recipients know I am using an API or Zaptura?',
    a: 'Never. Messages originate directly from your linked WhatsApp phone number. To your customers and clients, it looks completely native and identical to a normal WhatsApp chat.',
  },
  {
    q: 'Can I connect multiple phone numbers simultaneously?',
    a: 'Yes! Zaptura is engineered for multi-tenancy. You can connect from 1 up to 10+ numbers depending on your plan tier. Each session runs in an isolated sandbox with dedicated storage, webhook configuration, and scoped credentials.',
  },
  {
    q: 'How do webhooks and AI agent bots integrate?',
    a: 'Every time an incoming message, media, voice note, or delivery receipt arrives, Zaptura forwards a JSON payload to your configured webhook URL in real time (<40ms). You can connect this directly to n8n, Zapier, Python FastAPI, Node.js, or LLM agents (ChatGPT, Claude, LangChain).',
  },
  {
    q: 'What happens if my phone loses internet or battery?',
    a: 'Zaptura connects via WhatsApp Multi-Device protocol. Your primary phone does not need to stay online 24/7 once linked. Even if the phone is temporarily powered down, your linked sessions continue functioning seamlessly.',
  },
  {
    q: 'Are there any per-message fees or conversation window taxes?',
    a: 'No. Traditional Meta Cloud APIs charge $0.03 to $0.08 per 24-hour conversation window. With Zaptura, you pay a flat predictable subscription with unlimited outbound and inbound messages.',
  },
  {
    q: 'Is my data and communication encrypted?',
    a: 'All WhatsApp transmission relies on native end-to-end encryption. Your API keys are salted and hashed, and session data is isolated per account in encrypted storage.',
  },
];
