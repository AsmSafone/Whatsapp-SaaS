import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Star } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { MarketingShell } from './MarketingShell';
import { FEATURE_MATRIX, NX_PLANS } from './marketing-data';
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
                  <li>
                    <Check size={14} className="zp-text-emerald" />
                    <span>Zero per-message fees</span>
                  </li>
                  <li>
                    <Check size={14} className="zp-text-emerald" />
                    <span>Full REST + WebSocket API</span>
                  </li>
                  <li>
                    <Check size={14} className="zp-text-emerald" />
                    <span>OpenAPI 3.0 / Swagger UI</span>
                  </li>
                  <li>
                    <Check size={14} className="zp-text-emerald" />
                    <span>HMAC-signed webhooks</span>
                  </li>
                  <li>
                    <Check size={14} className="zp-text-emerald" />
                    <span>AES-256 session encryption</span>
                  </li>
                  <li>
                    <Check size={14} className="zp-text-emerald" />
                    <span>Auto-reconnect watchdog</span>
                  </li>
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

        {/* ─── Detailed Feature Comparison Matrix ─── */}
        <div className="zp-matrix-section">
          <h3 className="zp-matrix-title">
            Full Feature <span>Comparison</span>
          </h3>
          <p className="zp-matrix-subtitle">Every capability, every plan — no asterisks hidden in fine print.</p>

          <div className="zp-matrix-table-wrap">
            <table className="zp-matrix-table" role="table">
              <thead>
                <tr>
                  <th className="zp-matrix-feature-col">Feature</th>
                  {NX_PLANS.map(p => (
                    <th key={p.id} className={`zp-matrix-plan-col ${p.popular ? 'zp-matrix-popular-col' : ''}`}>
                      <span className="zp-matrix-plan-name">{p.name}</span>
                      {p.popular && <span className="zp-matrix-popular-tag">Popular</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_MATRIX.map(group => (
                  <Fragment key={group.category}>
                    <tr className="zp-matrix-group-row">
                      <td colSpan={5} className="zp-matrix-group-label">
                        <span className="zp-matrix-group-icon">{group.icon}</span>
                        {group.category}
                      </td>
                    </tr>
                    {group.rows.map(row => (
                      <tr key={row.feature} className="zp-matrix-data-row">
                        <td className="zp-matrix-feature-name">
                          {row.feature}
                          {row.tooltip && (
                            <span className="zp-matrix-tooltip" title={row.tooltip}>
                              ?
                            </span>
                          )}
                        </td>
                        {row.values.map((val, i) => (
                          <td
                            key={i}
                            className={`zp-matrix-cell ${NX_PLANS[i]?.popular ? 'zp-matrix-popular-cell' : ''}`}
                          >
                            {val === true ? (
                              <span className="zp-matrix-check" aria-label="Included">
                                ✓
                              </span>
                            ) : val === false ? (
                              <span className="zp-matrix-cross" aria-label="Not included">
                                —
                              </span>
                            ) : (
                              <span className="zp-matrix-value">{val}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
