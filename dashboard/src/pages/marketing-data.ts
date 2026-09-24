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

export const NX_PLAN_FEATURES = [
  'Zero Per-Message Fees (Unlimited Throughput)',
  'Multi-Device QR Pairing in <15 Seconds',
  'Automated Bi-directional Webhooks & HMAC Verification',
  'Send Text, Media, Voice, Docs, Locations & Polls',
  '1-on-1 Chats, Group Dispatch & Channel Broadcasts',
  'Full Swagger & OpenAPI 3.0 Interactive Specs',
  'AES-256 Isolated Session-Scoped API Keys',
  '24/7 Automated Health Watchdog & Auto-Reconnect',
];

export const CODE_SAMPLES: Record<string, { label: string; code: string }> = {
  JS: {
    label: 'Node / JS',
    code: `// Send WhatsApp text or rich media in 3 lines
const response = await fetch('https://api.zaptura.io/api/sessions/' + sessionId + '/messages/send-text', {
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
    f"https://api.zaptura.io/api/sessions/{session_id}/messages/send-text",
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
    code: `curl -X POST "https://api.zaptura.io/api/sessions/$SESSION_ID/messages/send-text" \\
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
    url := "https://api.zaptura.io/api/sessions/" + os.Getenv("SESSION_ID") + "/messages/send-text"
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
$response = $client->post('https://api.zaptura.io/api/sessions/' . $sessionId . '/messages/send-text', [
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
