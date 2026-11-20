import LegalLayout from './LegalLayout.jsx'
import { termsSections } from './termsSections.js'

export default function Terms() {
  return (
    <LegalLayout
      kicker="Legal"
      title={<>Terms &amp; <span className="accent-it">Conditions</span></>}
      updated="11 November 2026"
      summary="The agreement between you and HappyPix: what you can do with the software, what we owe you, and what happens if either side falls short."
      sections={termsSections}
    />
  )
}
