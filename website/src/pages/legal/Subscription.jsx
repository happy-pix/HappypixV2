import LegalLayout from './LegalLayout.jsx'
import { subscriptionSections } from './subscriptionSections.js'

export default function Subscription() {
  return (
    <LegalLayout
      kicker="Legal"
      title={<>Subscription &amp; Cancellation <span className="accent-it">Policy</span></>}
      updated="11 November 2026"
      summary="How plans renew, how to cancel, how storage overage and AI credits are charged, and exactly what deleting your account does — and when."
      sections={subscriptionSections}
    />
  )
}
