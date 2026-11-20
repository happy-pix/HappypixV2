import LegalLayout from './LegalLayout.jsx'
import { privacySections } from './privacySections.js'

export default function Privacy() {
  return (
    <LegalLayout
      kicker="Legal"
      title={<>Privacy <span className="accent-it">Policy</span></>}
      updated="11 November 2026"
      summary="What we collect, why we collect it, who processes it, how long we keep it, and how to make us stop. Written to be read, not to be survived."
      sections={privacySections}
    />
  )
}
