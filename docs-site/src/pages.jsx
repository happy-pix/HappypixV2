// ─────────────────────────────────────────────────────────────────
//  The four public pages, assembled from the content modules.
// ─────────────────────────────────────────────────────────────────

import { BRAND_LINKS, WHAT_IT_IS, HOW_IT_WORKS, GUIDE_MAP, FAQ } from './content/brand.js';
import { BOOTH_STEPS, BOOTH_OPERATOR_NOTES } from './content/boothFlow.js';
import { CRM_STEPS, CRM_ROLE_NOTES } from './content/crmFlow.js';
import { Accordion, Badge, Section } from './components/ui.jsx';
import Walkthrough from './components/Walkthrough.jsx';
import BoothScreen from './components/BoothScreen.jsx';
import CrmScreen from './components/CrmScreen.jsx';
import SetupBuilder from './components/SetupBuilder.jsx';
import CompatMatrix from './components/CompatMatrix.jsx';
import ContactForm from './components/ContactForm.jsx';

export function BrandPage({ onNavigate }) {
  return (
    <>
      <Section id="what-it-is" eyebrow="THE SHORT VERSION" title="What HappyPix is">
        <p className="lede-copy">{WHAT_IT_IS.lede}</p>
        {WHAT_IT_IS.paragraphs.map((paragraph) => (
          <p className="body-copy" key={paragraph.slice(0, 32)}>
            {paragraph}
          </p>
        ))}
        <div className="link-cards">
          <a href={BRAND_LINKS.pricing} target="_blank" rel="noreferrer">
            <span>01 / PLANS</span>
            <b>Find a plan that fits →</b>
            <small>Booth and event limits, and checkout</small>
          </a>
          <a href={BRAND_LINKS.crm} target="_blank" rel="noreferrer">
            <span>02 / WORKSPACE</span>
            <b>Open the CRM →</b>
            <small>Sign in to your organisation</small>
          </a>
          <a href={BRAND_LINKS.software} target="_blank" rel="noreferrer">
            <span>03 / BOOTH APPS</span>
            <b>Get the booth app →</b>
            <small>Android, iPad and Windows</small>
          </a>
        </div>
      </Section>

      <Section id="how-it-works" eyebrow="HOW IT WORKS" title="From booking to the last guest">
        <div className="flow-cards">
          {HOW_IT_WORKS.map((item) => (
            <article key={item.n}>
              <span className="flow-n">{item.n}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              {item.link?.href && (
                <a href={item.link.href} target="_blank" rel="noreferrer">
                  {item.link.label} ↗
                </a>
              )}
              {item.link?.page && (
                <button onClick={() => onNavigate(item.link.page)}>{item.link.label} →</button>
              )}
            </article>
          ))}
        </div>
      </Section>

      <Section id="guide-map" eyebrow="HOW THIS GUIDE HELPS" title="Where to go next">
        <p className="body-copy">
          Three sections, each for a different moment. You will probably only ever need one of them at a time.
        </p>
        <div className="map-cards">
          {GUIDE_MAP.map((item) => (
            <button className="map-card" key={item.page} onClick={() => onNavigate(item.page)}>
              <span className="map-for">{item.for}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <span className="map-if">
                <b>Read this if</b> {item.readThisIf}
              </span>
              <span className="map-go">Open →</span>
            </button>
          ))}
        </div>
      </Section>

      <Section id="faq" eyebrow="ASKED MOST OFTEN" title="Frequent questions">
        <Accordion items={FAQ} idPrefix="faq" />
      </Section>

      <ContactForm />
    </>
  );
}

export function BoothPage({ initialStepId }) {
  return (
    <>
      <Section id="booth-intro" eyebrow="THE GUEST FLOW" title="Every screen, in the order guests meet them">
        <p className="body-copy">
          This is a working copy of the booth. Click the highlighted button on the screen, or use the arrow
          keys, and the guide walks you through what each screen is for and what you control from the CRM.
        </p>
        <div className="legend-row">
          <Badge tone="green">11 screens</Badge>
          <Badge>Clickable</Badge>
          <Badge>Arrow keys work</Badge>
        </div>
      </Section>

      <Walkthrough
        steps={BOOTH_STEPS}
        label="Booth"
        initialStepId={initialStepId}
        renderScreen={(step, onAction) => (
          <BoothScreen mock={step.mock} onAction={onAction} actionLabel={step.action} />
        )}
      />

      <Section
        id="booth-trouble"
        eyebrow="WHEN SOMETHING IS OFF"
        title="Quick fixes for the person on the booth"
      >
        <Accordion items={BOOTH_OPERATOR_NOTES} idPrefix="op" />
      </Section>
    </>
  );
}

export function CrmPage({ initialStepId }) {
  return (
    <>
      <Section id="crm-intro" eyebrow="YOUR WORKSPACE" title="A guided tour before you sign in">
        <p className="body-copy">
          The same workspace, screen by screen. Click through it here and the real thing will already feel
          familiar — which matters, because you will be in it the afternoon before an event.
        </p>
        <div className="legend-row">
          <Badge tone="green">13 screens</Badge>
          <Badge>Clickable</Badge>
          <Badge>Arrow keys work</Badge>
        </div>
      </Section>

      <Walkthrough
        steps={CRM_STEPS}
        label="CRM"
        initialStepId={initialStepId}
        renderScreen={(step, onAction, jump) => (
          <CrmScreen mock={step.mock} step={step} onAction={onAction} actionLabel={step.action} jump={jump} />
        )}
      />

      <Section id="crm-roles" eyebrow="PEOPLE" title="Who gets which role">
        <div className="role-cards">
          {CRM_ROLE_NOTES.map((item) => (
            <article key={item.role}>
              <h3>{item.role}</h3>
              <p>
                <b>Can reach:</b> {item.can}
              </p>
              <p>
                <b>Give it to:</b> {item.give}
              </p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}

export function SetupPage({ onGuideChange }) {
  return (
    <>
      <Section id="setup-intro" eyebrow="MAKE IT RUN" title="Start with what is actually in your case">
        <p className="body-copy">
          Answer four questions and this page becomes a setup guide for exactly your hardware — the cables,
          where they go, the settings to change on the camera, and how to get the guest screen running. If a
          piece of gear is not ready yet, it says so plainly rather than letting you find out at the venue.
        </p>
      </Section>

      <SetupBuilder onGuideChange={onGuideChange} />
      <CompatMatrix />
    </>
  );
}
