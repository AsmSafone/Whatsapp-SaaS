import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Star, ArrowRight } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { MarketingShell } from './MarketingShell';
import { NX_PLAN_FEATURES, NX_PLANS } from './marketing-data';
import './Marketing.css';

export function Pricing() {
  useDocumentTitle('Pricing Plans — Zaptura WA');
  const [yearly, setYearly] = useState(false);

  return (
    <MarketingShell>
      <section className="zp-section zp-pricing-page-hero">
        <div className="zp-section-header">
          <p className="zp-section-eyebrow">Transparent Cloud Pricing</p>
          <h2 className="zp-section-title">
            Simple, Predictable Plans for <span>Every Scale</span>
          </h2>
          <p className="zp-section-desc">
            No per-message markup. No conversation expiration windows. Pay one low monthly or annual subscription and
            automate WhatsApp with total peace of mind.
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

        {/* Feature Comparison Matrix */}
        <div className="zp-matrix-section">
          <h3 className="zp-matrix-title">Detailed Feature Matrix</h3>
          <div className="zp-matrix-table-wrap">
            <table className="zp-matrix-table">
              <thead>
                <tr>
                  <th>Capability</th>
                  <th>Starter</th>
                  <th>Pro</th>
                  <th>Plus</th>
                  <th>Business</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Concurrent WhatsApp Sessions</td>
                  <td>1 Number</td>
                  <td>3 Numbers</td>
                  <td>6 Numbers</td>
                  <td>10 Numbers</td>
                </tr>
                <tr>
                  <td>Monthly Outbound Messages</td>
                  <td>
                    <span className="zp-text-emerald">Unlimited</span>
                  </td>
                  <td>
                    <span className="zp-text-emerald">Unlimited</span>
                  </td>
                  <td>
                    <span className="zp-text-emerald">Unlimited</span>
                  </td>
                  <td>
                    <span className="zp-text-emerald">Unlimited</span>
                  </td>
                </tr>
                <tr>
                  <td>Inbound Webhooks & Events</td>
                  <td>Instant</td>
                  <td>Instant</td>
                  <td>Instant</td>
                  <td>Instant</td>
                </tr>
                <tr>
                  <td>Multi-Device QR Pairing</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                </tr>
                <tr>
                  <td>AI Copilot / LLM Hooks</td>
                  <td>Standard</td>
                  <td>Priority</td>
                  <td>Priority</td>
                  <td>Dedicated</td>
                </tr>
                <tr>
                  <td>API Key Scoping & Isolation</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                </tr>
                <tr>
                  <td>Auto-Healing Session Watchdog</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                  <td>✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
