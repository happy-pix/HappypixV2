// ─────────────────────────────────────────────────────────────────
//  "If you have any further doubt, write here, team will contact you."
//
//  Lives on HappyPix 101 only. Submits to the same website-leads
//  flow the marketing site uses, so enquiries land on the platform
//  CRM leads page — with a type the CRM can actually filter on.
// ─────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { api, LEADS_API_BASE } from '../lib/api.js';
import { BRAND_LINKS, CONTACT_TOPICS } from '../content/brand.js';

const EMPTY = { name: '', email: '', phone: '', company: '', message: '', type: 'contact' };

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [state, setState] = useState({ busy: false, message: '', error: false });

  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setState({ busy: true, message: '', error: false });
    try {
      // One path in both modes: LEADS_API_BASE is either the deployed
      // website backend or the dev proxy, both of which mount /api.
      // The old PROD branch produced /api/api/leads against a base
      // that already carried /api.
      const result = await api('/leads', {
        base: LEADS_API_BASE,
        method: 'POST',
        body: JSON.stringify(form),
      });
      setState({
        busy: false,
        message: result.message || 'Thanks — the HappyPix team will be in touch.',
        error: false,
      });
      setForm(EMPTY);
    } catch (error) {
      setState({
        busy: false,
        message: error.message || 'Could not send your message. Please try again.',
        error: true,
      });
    }
  };

  return (
    <section className="contact-panel" id="contact">
      <div className="contact-copy">
        <span className="eyebrow">NEED A HUMAN?</span>
        <h2>If you have any further doubt, write here. The team will contact you.</h2>
        <p>
          Tell us what you are trying to set up — the gear, the venue, the thing that is not behaving. The
          more specific you are, the shorter the reply.
        </p>
        <ul className="contact-points">
          <li>Hardware and compatibility questions get a real answer, not a brochure.</li>
          <li>Your message lands with the HappyPix team, in the same place as every other enquiry.</li>
          <li>
            Prefer the main site?{' '}
            <a href={BRAND_LINKS.contact} target="_blank" rel="noreferrer">
              Write to us there ↗
            </a>
          </li>
        </ul>
      </div>

      <form onSubmit={submit} className="contact-form">
        <div className="form-two">
          <label>
            Your name
            <input required value={form.name} onChange={set('name')} autoComplete="name" />
          </label>
          <label>
            Email address
            <input required type="email" value={form.email} onChange={set('email')} autoComplete="email" />
          </label>
        </div>

        <div className="form-two">
          <label>
            Phone <small>optional</small>
            <input value={form.phone} onChange={set('phone')} autoComplete="tel" />
          </label>
          <label>
            Organisation <small>optional</small>
            <input value={form.company} onChange={set('company')} autoComplete="organization" />
          </label>
        </div>

        <fieldset className="topic-group">
          <legend>What is this about?</legend>
          <div className="chip-row">
            {CONTACT_TOPICS.map((topic) => (
              <label key={topic.id} className={`chip ${form.type === topic.id ? 'chip-on' : ''}`}>
                <input
                  type="radio"
                  name="topic"
                  value={topic.id}
                  checked={form.type === topic.id}
                  onChange={set('type')}
                />
                <span className="chip-face">
                  <b>{topic.label}</b>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <label>
          Your question
          <textarea
            required
            maxLength={4000}
            rows={4}
            value={form.message}
            onChange={set('message')}
            placeholder="We are running two booths at a wedding on the 12th. One is an iPad with a Canon R50…"
          />
        </label>

        <div className="form-bottom">
          <small>Sent to the HappyPix team. We do not pass your details on.</small>
          <button className="button primary" type="submit" disabled={state.busy}>
            {state.busy ? 'Sending…' : 'Send it'} <span aria-hidden="true">↗</span>
          </button>
        </div>

        {state.message && (
          <p className={`form-status ${state.error ? 'error' : 'success'}`} role="status">
            {state.message}
          </p>
        )}
      </form>
    </section>
  );
}
