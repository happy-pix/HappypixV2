// Renders a section list as prose. Each section is plain data — heading,
// optional lead line, then paragraphs and bullet lists — so the three
// policies stay readable as text files and cannot drift into markup soup.
//
// `note` renders as a highlighted aside; `list` as a bullet list. Nothing
// here needs to know which policy it is showing.

export default function LegalBody({ sections }) {
  return (
    <>
      {sections.map((section) => (
        <section key={section.id} id={section.id} className="legal-section">
          <h2>{section.heading}</h2>
          {section.lead && <p className="legal-lead">{section.lead}</p>}

          {(section.paragraphs || []).map((text, index) => (
            <p key={index}>{text}</p>
          ))}

          {(section.list || []).length > 0 && (
            <ul>
              {section.list.map((item, index) => (
                <li key={index}>
                  {typeof item === 'string' ? item : (
                    <>
                      <b>{item.strong}</b> {item.text}
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}

          {(section.notes || []).map((note, index) => (
            <aside key={index} className={`legal-note ${note.tone || ''}`}>
              {note.title && <b>{note.title}</b>}
              <span>{note.text}</span>
            </aside>
          ))}

          {(section.paragraphsAfter || []).map((text, index) => (
            <p key={`after-${index}`}>{text}</p>
          ))}
        </section>
      ))}
    </>
  )
}
