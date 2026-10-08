import { useState, useEffect } from 'react'
import { Card, CardHead, Field, TextInput, Button, EmptyState } from '../../components/ui.jsx'
import { api } from '../../api/index.js'

export default function TemplateLayouts() {
  const [codeword, setCodeword] = useState('')
  const [layoutPreview, setLayoutPreview] = useState(null)
  const [savedLayouts, setSavedLayouts] = useState([])

  useEffect(() => {
    // Load global layouts from API
    api.platform.templateLayouts()
      .then(res => {
        if (res.layouts) setSavedLayouts(res.layouts)
      })
      .catch(err => console.error("Failed to fetch template layouts", err))
  }, [])

  const parseCodeword = (rawWord) => {
    // Strip trailing descriptions if user pasted directly from docs (e.g. "P1-46-T04-V-HERO3 — HERO3")
    const cleanWord = rawWord.split(' ')[0].split('—')[0].trim()
    const parts = cleanWord.toUpperCase().split('-')
    if (parts.length < 5) return null

    // Support structures like HERO-R3 which split into 2 parts
    const piece = parts[0]
    const media = parts[1]
    const slotsStr = parts[2]
    const orientation = parts[3]
    const structure = parts.slice(4).join('-')
    const slots = parseInt(slotsStr.replace('T', '')) || 1

    let aspect = '1/1'
    let width = 1200, height = 1200

    if (media === '46') {
      aspect = orientation === 'V' ? '2/3' : '3/2';
      width = orientation === 'V' ? 1200 : 1800; height = orientation === 'V' ? 1800 : 1200;
    }
    else if (media === '26') {
      aspect = orientation === 'V' ? '1/3' : '3/1';
      width = orientation === 'V' ? 600 : 1800; height = orientation === 'V' ? 1800 : 600;
    }
    else if (media === '57') {
      aspect = orientation === 'V' ? '5/7' : '7/5';
      width = orientation === 'V' ? 1500 : 2100; height = orientation === 'V' ? 2100 : 1500;
    }
    else if (media === '68') {
      aspect = orientation === 'V' ? '3/4' : '4/3';
      width = orientation === 'V' ? 1800 : 2400; height = orientation === 'V' ? 2400 : 1800;
    }
    else if (media === '916') {
      aspect = orientation === 'V' ? '9/16' : '16/9';
      width = orientation === 'V' ? 1080 : 1920; height = orientation === 'V' ? 1920 : 1080;
    }
    else if (media === '169') {
      aspect = orientation === 'V' ? '9/16' : '16/9';
      width = orientation === 'V' ? 1080 : 1920; height = orientation === 'V' ? 1920 : 1080;
    }

    let cols = 1, rows = 1
    if (structure.startsWith('GRID')) {
      const d = structure.replace('GRID', '').split('X')
      cols = parseInt(d[0]) || 1
      rows = parseInt(d[1]) || 1
    } else if (structure === 'VSTACK') {
      rows = slots; cols = 1
    } else if (structure === 'HSTACK') {
      cols = slots; rows = 1
    } else if (structure.includes('HERO') && slots > 1) {
      cols = 2; rows = Math.ceil(slots / 2) // Rough approximation for preview
    } else {
      // Fallback
      cols = Math.ceil(Math.sqrt(slots))
      rows = Math.ceil(slots / cols)
    }

    return { aspect, width, height, cols, rows, slots, media, orientation, structure, fullCode: cleanWord }
  }

  const handleGenerate = (e) => {
    e.preventDefault()
    if (!codeword.trim()) return

    const parsed = parseCodeword(codeword)
    if (!parsed) {
      alert("Invalid format! Use format: P1-46-T04-V-GRID2X2")
      return
    }

    const newLayout = {
      id: Date.now().toString(),
      codeword: parsed.fullCode,
      createdAt: new Date().toLocaleDateString(),
      grid: parsed
    }
    setLayoutPreview(newLayout)
  }

  const handleSave = async () => {
    if (layoutPreview) {
      try {
        const res = await api.platform.createTemplateLayout(layoutPreview)
        if (res.layout) {
          setSavedLayouts([res.layout, ...savedLayouts])
          setLayoutPreview(null)
          setCodeword('')
        }
      } catch (err) {
        console.error("Failed to save layout", err)
        alert("Failed to save layout to backend")
      }
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.platform.deleteTemplateLayout(id)
      setSavedLayouts(savedLayouts.filter(l => l.id !== id))
    } catch (err) {
      console.error("Failed to delete layout", err)
    }
  }

  const renderGrid = (layout) => {
    if (!layout || !layout.grid) return <div style={{ padding: '20px', background: 'var(--surface-2)', textAlign: 'center' }}>Invalid Layout Data</div>
    const { aspect, cols, rows, slots, structure } = layout.grid

    const gradients = [
      'linear-gradient(to bottom, #9E8CD0, #7B68B0)',
      'linear-gradient(to bottom, #EDA1C1, #D86B97)',
      'linear-gradient(to bottom, #93BAE5, #658CB6)',
      'linear-gradient(to bottom, #B5E0A1, #84B76C)'
    ];

    const slotStyle = (i, extra = {}) => ({
      background: gradients[i % gradients.length],
      border: '1px solid rgba(212, 175, 55, 0.8)', // Subtle gold border
      borderRadius: '4px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ffffff',
      fontFamily: 'monospace, sans-serif',
      letterSpacing: '1px',
      fontSize: '9px',
      boxSizing: 'border-box',
      textShadow: '0px 1px 2px rgba(0,0,0,0.2)',
      ...extra
    })

    const SlotContent = ({ num }) => (
      <>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.9, marginBottom: '6px' }}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2 L12 12 L20.5 7" />
          <path d="M12 12 L3.5 7" />
          <path d="M12 12 L7 20.5" />
          <path d="M12 12 L17 20.5" />
          <circle cx="12" cy="12" r="2.5" fill="currentColor" />
        </svg>
        <span>PHOTO {num}</span>
      </>
    )

    let content = null;

    if (structure === 'HERO' || structure === 'FULL') {
      content = <div style={slotStyle(0, { width: '100%', height: '100%' })}><SlotContent num={1} /></div>
    }
    else if (structure === 'VSTACK' || structure === 'HSTACK' || structure === 'STACK' || structure === 'SQUARE' || structure === 'FILM' || structure === 'POLAROID') {
      const isV = structure !== 'HSTACK'
      content = (
        <div style={{ display: 'flex', flexDirection: isV ? 'column' : 'row', gap: '6px', width: '100%', height: '100%' }}>
          {Array.from({ length: slots }).map((_, i) => (
            <div key={i} style={slotStyle(i, { flex: 1 })}><SlotContent num={i + 1} /></div>
          ))}
        </div>
      )
    }
    else if (structure.startsWith('GRID') || structure === 'CORNERS') {
      content = (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)`, gap: '6px', width: '100%', height: '100%' }}>
          {Array.from({ length: slots }).map((_, i) => (
            <div key={i} style={slotStyle(i)}><SlotContent num={i + 1} /></div>
          ))}
        </div>
      )
    }
    else if (structure === 'HERO3' || structure === 'HERO5' || structure === 'HERO7') {
      const smallCount = structure === 'HERO3' ? 3 : (structure === 'HERO5' ? 5 : 7)
      content = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', height: '100%' }}>
          <div style={slotStyle(0, { flex: 2 })}><SlotContent num={1} /></div>
          <div style={{ display: 'flex', gap: '6px', flex: 1, flexWrap: 'wrap' }}>
            {Array.from({ length: smallCount }).map((_, i) => (
              <div key={i + 1} style={slotStyle(i + 1, { flex: 1, minWidth: '30%' })}><SlotContent num={i + 2} /></div>
            ))}
          </div>
        </div>
      )
    }
    else if (structure === '3HERO') {
      content = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', height: '100%' }}>
          <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
            <div style={slotStyle(0, { flex: 1 })}><SlotContent num={1} /></div>
            <div style={slotStyle(1, { flex: 1 })}><SlotContent num={2} /></div>
          </div>
          <div style={slotStyle(2, { flex: 1 })}><SlotContent num={3} /></div>
          <div style={slotStyle(3, { flex: 1 })}><SlotContent num={4} /></div>
        </div>
      )
    }
    else if (structure === 'HERO-R3' || structure === 'HERO-R5') {
      const supCount = structure === 'HERO-R3' ? 3 : 5
      content = (
        <div style={{ display: 'flex', gap: '6px', width: '100%', height: '100%' }}>
          <div style={slotStyle(0, { flex: 2 })}><SlotContent num={1} /></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            {Array.from({ length: supCount }).map((_, i) => <div key={i + 1} style={slotStyle(i + 1, { flex: 1 })}><SlotContent num={i + 2} /></div>)}
          </div>
        </div>
      )
    }
    else if (structure === 'HERO-L3' || structure === 'HERO-L5') {
      const supCount = structure === 'HERO-L3' ? 3 : 5
      content = (
        <div style={{ display: 'flex', gap: '6px', width: '100%', height: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            {Array.from({ length: supCount }).map((_, i) => <div key={i + 1} style={slotStyle(i + 1, { flex: 1 })}><SlotContent num={i + 2} /></div>)}
          </div>
          <div style={slotStyle(0, { flex: 2 })}><SlotContent num={1} /></div>
        </div>
      )
    }
    else if (structure === 'TRIPTYCH') {
      content = (
        <div style={{ display: 'flex', gap: '6px', width: '100%', height: '100%' }}>
          <div style={slotStyle(0, { flex: 1 })}><SlotContent num={1} /></div>
          <div style={slotStyle(1, { flex: 1 })}><SlotContent num={2} /></div>
          <div style={slotStyle(2, { flex: 1 })}><SlotContent num={3} /></div>
        </div>
      )
    }
    else if (structure === 'CASCADE' || structure === 'DIAGONAL') {
      content = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', height: '100%', padding: '10px' }}>
          {Array.from({ length: slots }).map((_, i) => (
            <div key={i} style={slotStyle(i, { flex: 1, width: '60%', alignSelf: i % 2 === 0 ? 'flex-start' : 'flex-end' })}><SlotContent num={i + 1} /></div>
          ))}
        </div>
      )
    }
    else if (structure === 'MOSAIC' || structure === 'COLLAGE' || structure === 'MIX') {
      content = (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr 1fr', gap: '6px', width: '100%', height: '100%' }}>
          <div style={slotStyle(0, { gridRow: 'span 2' })}><SlotContent num={1} /></div>
          <div style={slotStyle(1)}><SlotContent num={2} /></div>
          <div style={slotStyle(2)}><SlotContent num={3} /></div>
          <div style={slotStyle(3, { gridColumn: 'span 2' })}><SlotContent num={4} /></div>
        </div>
      )
    }
    else {
      // Fallback grid
      content = (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)`, gap: '6px', width: '100%', height: '100%' }}>
          {Array.from({ length: slots }).map((_, i) => (
            <div key={i} style={slotStyle(i)}><SlotContent num={i + 1} /></div>
          ))}
        </div>
      )
    }

    return (
      <div style={{
        width: '100%',
        aspectRatio: aspect,
        background: '#342F5C', // Deep purple-blue background
        padding: '5%',
        borderRadius: '6px',
        border: '1px solid var(--line-soft)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* The photo structure area (takes 75-80% height) */}
        <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {content}
        </div>

        {/* Title/Logo footer area (takes the remaining 20-25% at bottom) */}
        <div style={{ flex: '0 0 20%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Optional: Add a subtle indicator if needed, or leave completely blank for the "space" effect */}
        </div>
      </div>
    )
  }

  return (
    <div className="page" style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600' }}>Template Layouts (Owner)</h1>
        <p className="muted" style={{ marginTop: '8px' }}>Create structural layouts using codes (e.g. P1-46-T04-V-GRID2X2). These will be available globally.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
        <Card pad>
          <CardHead title="Generate Layout" sub="Enter a standard codeword." />
          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <Field label="Layout Codeword" required hint="Format: [PIECE]-[MEDIA]-[SLOTS]-[ORIENTATION]-[STRUCTURE]">
              <TextInput
                value={codeword}
                onChange={e => setCodeword(e.target.value)}
                placeholder="e.g. P1-46-T04-V-GRID2X2"
              />
            </Field>
            <Button variant="primary" type="submit" disabled={!codeword.trim()}>Generate Preview</Button>
          </form>
        </Card>

        <Card pad style={{ display: 'flex', flexDirection: 'column' }}>
          <CardHead title="Live Preview" />
          <div style={{ flex: 1, minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--line-soft)', borderRadius: '8px', marginTop: '16px', background: 'var(--surface-2)', padding: '24px' }}>
            {layoutPreview ? (
              <div style={{ width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {renderGrid(layoutPreview)}
                <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '12px' }} className="muted">
                  Resolution: {layoutPreview.grid.width} &times; {layoutPreview.grid.height} px ({layoutPreview.grid.aspect})
                </div>
                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                  <Button variant="primary" icon="check" onClick={handleSave}>Publish Globally</Button>
                </div>
              </div>
            ) : (
              <EmptyState icon="image" title="No Preview" message="Enter a codeword to preview its structure." />
            )}
          </div>
        </Card>
      </div>

      <h2 style={{ fontSize: '18px', fontWeight: '600', marginTop: '40px', marginBottom: '16px' }}>Published Global Layouts</h2>
      {savedLayouts.length === 0 ? (
        <Card pad>
          <EmptyState icon="template" title="No Global Layouts" message="Published layouts will appear here." />
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {savedLayouts.map(layout => (
            <Card key={layout.id} pad style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>{layout.codeword}</span>
                <button onClick={() => handleDelete(layout.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>&times;</button>
              </div>
              <div style={{ width: '120px' }}>
                {renderGrid(layout)}
              </div>
              <div className="muted" style={{ fontSize: '11px', marginTop: '16px' }}>Added {layout.createdAt}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
