
import React, { useEffect, useMemo, useState, useRef } from 'react'
import { api } from '../../api/index.js'
import { useApp } from '../../context/AppContext.jsx'
import { Card, Chip, PageLoader, SearchInput, Select, Button, Modal, Field, TextInput, Toggle, EmptyState, ConfirmDialog } from '../../components/ui.jsx'
import { Icon } from '../../lib/icons.jsx'
import TemplateRenderer from '../../components/TemplateRenderer.jsx'
import { dateShort } from '../../lib/format.js'

// Helper to generate precise coordinates for the Layout Engine
const generateMockSlots = (count, structure) => {
  const slots = [];
  if (structure === 'VSTACK' || structure === 'STACK' || structure === 'FILM') {
    const h = 0.9 / count;
    for(let i=0; i<count; i++) {
      slots.push({ id: `photo-${i+1}`, x: 0.05, y: 0.05 + (i * h), width: 0.9, height: h - 0.02 })
    }
  } else if (structure.startsWith('HERO3')) {
    slots.push({ id: 'photo-1', x: 0.05, y: 0.05, width: 0.9, height: 0.6 });
    slots.push({ id: 'photo-2', x: 0.05, y: 0.7, width: 0.28, height: 0.25 });
    slots.push({ id: 'photo-3', x: 0.36, y: 0.7, width: 0.28, height: 0.25 });
    slots.push({ id: 'photo-4', x: 0.67, y: 0.7, width: 0.28, height: 0.25 });
  } else {
    for(let i=0; i<count; i++) {
      const offset = i * 0.05;
      slots.push({ id: `photo-${i+1}`, x: 0.1 + offset, y: 0.1 + offset, width: 0.6, height: 0.6 })
    }
  }
  return slots;
}

export default function OrgCustomTemplates() {
  const { toast } = useApp()
  const [templates, setTemplates] = useState(null)
  const [globalLayouts, setGlobalLayouts] = useState([])
  const [search, setSearch] = useState('')
  const [playground, setPlayground] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = () => {
    api.org.templateLayouts().then((r) => {
      if (r.layouts) {
        const normalized = r.layouts.map(l => ({
           id: l._id || l.id,
           codeword: l.codeword,
           width: l.grid?.width || 1200,
           height: l.grid?.height || 1800,
           aspect: l.grid?.aspect || (1200/1800),
           slotCount: l.grid?.slots || 1,
           slots: generateMockSlots(l.grid?.slots || 1, l.grid?.structure || 'VSTACK')
        }))
        setGlobalLayouts(normalized)
      }
    }).catch(e => console.error(e))

    api.org.aiTemplates().then((r) => {
      setTemplates(r.templates.filter(t => t.source === 'manual'))
    }).catch((e) => toast(e.message, 'error'))
  }
  
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    if (!templates) return []
    let r = templates
    if (search) {
      const s = search.toLowerCase()
      r = r.filter((t) => t.name.toLowerCase().includes(s) || (t.description || '').toLowerCase().includes(s))
    }
    return r
  }, [templates, search])

  const confirmDelete = async () => {
    if (!deleting) return
    setBusy(true)
    try {
      await api.org.deleteAiTemplate(deleting.id || deleting._id)
      toast(`Deleted “${deleting.name}”`)
      setDeleting(null)
      load()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  if (playground) {
    return (
      <ManualBuilder
        globalLayouts={globalLayouts}
        onClose={() => setPlayground(null)}
        onSaved={() => { setPlayground(null); load() }}
      />
    )
  }

  return (
    <div className="page" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-head" style={{ marginBottom: 24 }}>
        <div>
          <div className="page-title" style={{ fontSize: 24, fontWeight: 600 }}>Custom Templates (Manual Builder)</div>
          <div className="page-sub" style={{ marginTop: 8, color: 'var(--muted)' }}>
            Manually build templates using Global Layouts. Move slots, upload backgrounds, and draw overlays with a brush!
          </div>
        </div>
        <Button variant="primary" icon="plus" onClick={() => setPlayground({ mode: 'new' })}>
          Create Custom Template
        </Button>
      </div>

      <Card style={{ paddingTop: 0 }}>
        <div className="row wrap gap-12" style={{ padding: '14px 16px', borderBottom: '1px solid var(--line-soft)' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search custom templates…" style={{ width: 210 }} />
          <div className="grow" />
          <span className="chip chip-neutral">{filtered.length} of {templates?.length || 0}</span>
        </div>

        {!templates ? (
          <PageLoader />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="template"
            title="No custom templates yet"
            message="Create your first manual template with custom backgrounds, overlays, and resizable slots."
            action={<Button variant="primary" icon="plus" onClick={() => setPlayground({ mode: 'new' })}>Create template</Button>}
          />
        ) : (
          <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(258px, 1fr))', gap: 14 }}>
            {filtered.map((t) => {
              const lId = t.layout?.code || t.layoutId
              const aspect = t.layout?.width && t.layout?.height ? t.layout.width / t.layout.height : 2/3
              return (
                <div key={t.id || t._id} className="card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="row between" style={{ alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <div className="t13 fw6 ellipsis" title={t.name}>{t.name}</div>
                      <div className="t11 faint ellipsis">Global Layout: {lId}</div>
                    </div>
                    <span className="chip chip-info" style={{ flex: 'none' }} title="Manual Builder">Manual</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', border: '1px solid var(--line-soft)' }}>
                    <div style={{ width: 120 }}>
                      <TemplateRenderer 
                        layout={{ aspect: aspect, slots: t.slots || [] }} 
                        design={t.design} 
                        cachedAssets={{}}
                      />
                    </div>
                  </div>
                  <div className="row wrap gap-6">
                    <Chip tone="info">{lId}</Chip>
                  </div>
                  <div className="row between" style={{ marginTop: 'auto', borderTop: '1px solid var(--line-soft)', paddingTop: 10 }}>
                    <Button size="sm" variant="ghost" icon="trash" style={{ color: 'var(--danger)' }} title="Delete template" onClick={() => setDeleting(t)} />
                  </div>
                  <div className="t10 faint">added {dateShort(t.createdAt)}</div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        danger
        loading={busy}
        title={`Delete “${deleting?.name}”?`}
        message="Are you sure you want to delete this custom template?"
        confirmLabel="Delete template"
      />
    </div>
  )
}

// ---------------- Manual Builder ----------------

function defaultDesign() {
  return {
    bg: { type: 'solid', colors: ['#222222'] },
    palette: { primary: '#EA097F', background: '#222222', text: '#ffffff' },
    photoTreatment: { border: true, borderWidth: 4, shadow: true },
    decorations: []
  }
}

function ManualBuilder({ globalLayouts, onClose, onSaved }) {
  const { toast } = useApp()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [f, setF] = useState({
    name: 'My Custom Template',
    description: '',
    category: 'Custom',
    layoutId: globalLayouts[0]?.id || '',
    layoutObj: globalLayouts[0] || { slots: [], aspect: 2/3, width: 1000, height: 1500, orientation: 'portrait' },
    design: defaultDesign(),
    assets: []
  })
  
  const [drawMode, setDrawMode] = useState(false)
  const [brushMode, setBrushMode] = useState('theme') // 'color' or 'theme'
  const [brushColor, setBrushColor] = useState('#EA097F')
  const [brushSize, setBrushSize] = useState(25)
  const [bgPattern, setBgPattern] = useState(null)
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const historyRef = useRef([])
  const [isDrawing, setIsDrawing] = useState(false)

  // Initialize Layout when changed
  useEffect(() => {
    const l = globalLayouts.find(gl => gl.id === f.layoutId)
    if (l) {
      setF(x => ({ ...x, layoutObj: l }))
    }
  }, [f.layoutId, globalLayouts])

  useEffect(() => {
    if (drawMode && canvasRef.current) {
      const canvas = canvasRef.current
      canvas.width = canvas.offsetWidth * 2
      canvas.height = canvas.offsetHeight * 2
      const ctx = canvas.getContext('2d')
      ctx.scale(2, 2)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctxRef.current = ctx
      historyRef.current = [] // clear history on open
      
      // Load background pattern for "Bring Theme Forward" mode
      if (f.design.bg?.type === 'image' && f.design.bg?.url) {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          const cw = canvas.offsetWidth
          const ch = canvas.offsetHeight
          const offscreen = document.createElement('canvas')
          // Use DOM dimensions so when drawn in the scaled ctx, it perfectly matches the screen
          offscreen.width = cw
          offscreen.height = ch
          const octx = offscreen.getContext('2d')
          
          const canvasAspect = cw / ch
          const imgAspect = img.width / img.height
          let dx = 0, dy = 0, dw = cw, dh = ch
          if (canvasAspect > imgAspect) {
             dh = cw / imgAspect
             dy = (ch - dh) / 2
          } else {
             dw = ch * imgAspect
             dx = (cw - dw) / 2
          }
          octx.drawImage(img, dx, dy, dw, dh)
          setBgPattern(ctx.createPattern(offscreen, 'no-repeat'))
        }
        img.src = f.design.bg.url
      } else {
        setBgPattern(null)
      }
    }
  }, [drawMode, f.design.bg])

  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
  const setD = (k, v) => setF((x) => ({ ...x, design: { ...x.design, [k]: v } }))

  const save = async () => {
    if (!f.name.trim()) return setError('Template name is required.')
    if (!f.layoutId) return setError('Please select a layout.')
    setBusy(true)
    setError('')
    try {
      const body = {
        name: f.name.trim(),
        description: f.description.trim(),
        category: f.category,
        source: 'manual', // Distinguish from 'ai'
        layout: {
          code: f.layoutObj.codeword,
          width: f.layoutObj.width,
          height: f.layoutObj.height,
          orientation: f.layoutObj.aspect > 1 ? 'landscape' : 'portrait',
          slotCount: f.layoutObj.slotCount
        },
        slots: f.layoutObj.slots, // the custom dragged/resized slots!
        design: f.design,
        assets: f.assets
      }
      await api.org.saveAiTemplate(body)
      toast(`Template “${body.name}” created!`)
      onSaved()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  // --- Upload Handlers ---
  const handleUploadBg = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
        const dataUrl = ev.target.result
        const tempId = `temp-bg-${Date.now()}`
        setF(x => {
            const newAssets = x.assets.filter(a => a.role !== 'background')
            newAssets.push({ assetId: tempId, url: dataUrl, type: 'background', role: 'background', mimeType: file.type, isTemp: true })
            return {
                ...x,
                assets: newAssets,
                design: {
                    ...x.design,
                    bg: { type: 'image', url: dataUrl, assetId: tempId },
                    background: { type: 'image', url: dataUrl, assetId: tempId } // Compatibility for AI backend
                }
            }
        })
    }
    reader.readAsDataURL(file)
  }

  const handleUploadSticker = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
        const dataUrl = ev.target.result
        const tempId = `temp-dec-${Date.now()}-${Math.random().toString(36).slice(2)}`
        setF(x => {
            const newAssets = [...x.assets]
            newAssets.push({ assetId: tempId, url: dataUrl, type: 'decoration', role: 'decoration', mimeType: file.type, isTemp: true })
            const newDecs = [...(x.design.decorations || [])]
            newDecs.push({
                assetId: tempId,
                url: dataUrl,
                type: 'decoration',
                x: 0.25, y: 0.25, width: 0.5, height: 0.5, // Percentages
                overlay: true // Overlays slots by default
            })
            return { ...x, assets: newAssets, design: { ...x.design, decorations: newDecs } }
        })
    }
    reader.readAsDataURL(file)
  }

  const updateDec = (i, k, v) => {
      setF(x => {
          const decs = [...(x.design.decorations || [])]
          decs[i] = { ...decs[i], [k]: v }
          return { ...x, design: { ...x.design, decorations: decs } }
      })
  }

  const removeDec = (i) => {
      setF(x => {
          const decs = [...(x.design.decorations || [])]
          decs.splice(i, 1)
          return { ...x, design: { ...x.design, decorations: decs } }
      })
  }

  // --- Draw Handlers ---
  const saveStateToHistory = () => {
    if (!canvasRef.current || !ctxRef.current) return;
    const canvas = canvasRef.current;
    // Don't use scaling ctx reference for getImageData
    const rawCtx = canvas.getContext('2d');
    historyRef.current.push(rawCtx.getImageData(0, 0, canvas.width, canvas.height));
  }

  const undoDraw = () => {
    if (!canvasRef.current) return;
    const rawCtx = canvasRef.current.getContext('2d');
    if (historyRef.current.length > 0) {
      const lastState = historyRef.current.pop();
      rawCtx.putImageData(lastState, 0, 0);
    } else {
      rawCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }

  const getCanvasCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const startDrawing = (e) => {
    if (!ctxRef.current) return
    saveStateToHistory()
    const { x, y } = getCanvasCoords(e)
    ctxRef.current.beginPath()
    ctxRef.current.moveTo(x, y)
    
    if (brushMode === 'theme') {
      if (f.design.bg?.type === 'image' && bgPattern) {
        ctxRef.current.strokeStyle = bgPattern
      } else if (f.design.bg?.type === 'solid') {
        ctxRef.current.strokeStyle = f.design.bg.colors?.[0] || '#222222'
      } else {
        ctxRef.current.strokeStyle = 'transparent'
      }
    } else {
      ctxRef.current.strokeStyle = brushColor
    }
    
    ctxRef.current.lineWidth = brushSize
    setIsDrawing(true)
  }
  
  const draw = (e) => {
    if (!isDrawing || !ctxRef.current) return
    const { x, y } = getCanvasCoords(e)
    ctxRef.current.lineTo(x, y)
    ctxRef.current.stroke()
  }

  const stopDrawing = () => {
    if (!ctxRef.current) return
    ctxRef.current.closePath()
    setIsDrawing(false)
  }

  const saveDrawing = () => {
    if (!canvasRef.current) return
    const dataUrl = canvasRef.current.toDataURL('image/png')
    const tempId = `temp-draw-${Date.now()}`
    
    setF(x => {
        const newAssets = [...x.assets]
        newAssets.push({ assetId: tempId, url: dataUrl, type: 'decoration', role: 'decoration', mimeType: 'image/png', isTemp: true })
        const newDecs = [...(x.design.decorations || [])]
        // Save drawing as a full-screen overlay decoration
        newDecs.push({
            assetId: tempId,
            url: dataUrl,
            type: 'decoration',
            x: 0, y: 0, width: 1, height: 1, // Full size percentages
            overlay: true
        })
        return { ...x, assets: newAssets, design: { ...x.design, decorations: newDecs } }
    })
    setDrawMode(false)
  }

  return (
    <div className="page" style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100vh', boxSizing: 'border-box' }}>
      <div className="page-head" style={{ marginBottom: 24, flexShrink: 0 }}>
        <div>
          <div className="page-title" style={{ fontSize: 24, fontWeight: 600 }}>Custom Template Builder</div>
          <div className="page-sub" style={{ marginTop: 8, color: 'var(--muted)' }}>
            Manually design your template layout. Move/resize slots, upload backgrounds, and draw overlays!
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {error ? <span className="input-error">{error}</span> : null}
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon="check" onClick={save} disabled={busy || drawMode}>{busy ? 'Saving…' : 'Save Template'}</Button>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: 24, flex: 1, minHeight: 0, alignItems: 'stretch' }}>
        {/* ---- left: config ---- */}
        <Card style={{ flex: '1 1 50%', overflowY: 'auto', padding: '24px' }}>
          <div className="sess-block-title"><Icon name="template" size={12} /> 1 · Select Global Layout Variant</div>
          
          {globalLayouts.length === 0 ? (
             <div className="t12 muted mt-8">No global layouts have been created by the platform owner yet!</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, maxHeight: 120, overflowY: 'auto', padding: '2px', marginBottom: 14 }}>
              {globalLayouts.map((l) => {
                const sel = l.id === f.layoutId
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => set('layoutId', l.id)}
                    title={l.codeword}
                    style={{
                      cursor: 'pointer', borderRadius: 8, padding: '7px 6px 6px', textAlign: 'center',
                      border: `1.5px solid ${sel ? 'var(--hp-pink)' : 'var(--line)'}`,
                      background: sel ? 'var(--hp-pink-soft)' : 'var(--surface)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <div style={{ aspectRatio: l.aspect, height: 30, background: sel ? 'var(--hp-pink)' : 'var(--line)', borderRadius: 4, opacity: sel ? 1 : 0.7 }} />
                    </div>
                    <div className="t10" style={{ fontSize: 9.5, fontWeight: 600, marginTop: 4, color: sel ? 'var(--hp-pink-deep)' : 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {l.codeword}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          <div className="sess-block-title"><Icon name="sliders" size={12} /> 2 · Background & Details</div>
          <Field label="Template name" required>
            <TextInput value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Corporate Gala 2026" />
          </Field>
          
          <div className="row gap-12 mt-12">
            <Field label="Background Mode">
              <Select
                value={f.design.bg?.type || 'solid'}
                onChange={(e) => {
                  const t = e.target.value
                  const d = t === 'image' 
                    ? { type: 'image', url: f.design.bg?.url || null } 
                    : { type: 'solid', colors: [f.design.bg?.colors?.[0] || '#222222'] }
                  setF(x => ({ ...x, design: { ...x.design, bg: d, background: d } }))
                }}
                style={{ height: 38, minWidth: 130 }}
              >
                <option value="solid">Solid Colour</option>
                <option value="image">Custom Upload</option>
              </Select>
            </Field>

            {f.design.bg?.type === 'solid' ? (
              <Field label="Colour">
                <input type="color" value={f.design.bg.colors[0]} onChange={(e) => {
                  const d = { type: 'solid', colors: [e.target.value] }
                  setF(x => ({ ...x, design: { ...x.design, bg: d, background: d, palette: { ...x.design.palette, background: e.target.value } } }))
                }} style={colorBoxStyle} />
              </Field>
            ) : (
              <Field label="Upload Image">
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUploadBg} />
              </Field>
            )}
          </div>
          
          <div className="row gap-12 mt-12">
            <Field label="Border Colour">
              <input type="color" value={f.design.palette?.primary || '#EA097F'} onChange={(e) => setF(x => ({ ...x, design: { ...x.design, palette: { ...x.design.palette, primary: e.target.value } } }))} style={colorBoxStyle} />
            </Field>
            <Field label="Slot Border Width">
              <input type="number" min="0" max="20" value={f.design.photoTreatment?.borderWidth || 4} onChange={(e) => setF(x => ({ ...x, design: { ...x.design, photoTreatment: { ...x.design.photoTreatment, borderWidth: Number(e.target.value), border: Number(e.target.value) > 0 } } }))} style={{ height: 38, width: 80, padding: 8 }} />
            </Field>
          </div>

          <div className="sess-block-title mt-24">
             <div className="row between" style={{ width: '100%' }}>
                <span><Icon name="brush" size={12} /> 3 · Add Overlays & Draw</span>
                <Button variant="outline" size="sm" onClick={() => {
                   setF(x => {
                      const newId = `photo-${x.layoutObj.slots.length + 1}-${Math.random().toString(36).slice(2, 6)}`
                      const newSlot = { id: newId, x: 0.1, y: 0.1, width: 0.2, height: 0.2 }
                      return { ...x, layoutObj: { ...x.layoutObj, slots: [...(x.layoutObj.slots || []), newSlot] } }
                   })
                }}>Add Photo Slot</Button>
             </div>
          </div>
          <div className="row gap-12">
             <input type="file" id="sticker-upload" accept="image/png" style={{display:'none'}} onChange={handleUploadSticker} />
             <Button variant="outline" icon="image" onClick={() => document.getElementById('sticker-upload').click()}>
                 Add Sticker (PNG)
             </Button>
             <Button variant={drawMode ? "primary" : "outline"} icon="brush" onClick={() => setDrawMode(!drawMode)}>
                 {drawMode ? "Cancel Drawing" : "Draw Brush Overlay"}
             </Button>
          </div>
          
          {drawMode && (
             <div className="mt-12 p-12" style={{ background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--hp-pink)' }}>
                <div className="fw6 mb-8 t12" style={{ color: 'var(--hp-pink)' }}>Brush Settings</div>
                <div className="row gap-12 mb-12">
                   <Field label="Brush Style">
                      <Select value={brushMode} onChange={e => setBrushMode(e.target.value)} style={{ height: 38 }}>
                        <option value="theme">Background Theme</option>
                        <option value="color">Solid Color</option>
                      </Select>
                   </Field>
                   {brushMode === 'color' && (
                     <Field label="Brush Color"><input type="color" value={brushColor} onChange={e => setBrushColor(e.target.value)} style={colorBoxStyle} /></Field>
                   )}
                   <Field label="Brush Size">
                      <div className="row gap-8">
                        <input type="range" min="2" max="100" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} />
                        <span className="t12 fw6">{brushSize}px</span>
                      </div>
                   </Field>
                </div>
                <div className="t11 faint mb-12">
                   {brushMode === 'theme' ? 'Painting with this brush brings the background theme forward over the slots.' : 'Draw directly on the preview to the right.'}
                </div>
                <div className="row gap-8">
                   <Button variant="outline" size="sm" onClick={undoDraw}>Undo Last Stroke</Button>
                   <Button variant="primary" size="sm" onClick={saveDrawing}>Save Drawing</Button>
                </div>
             </div>
          )}

          <div style={{ maxHeight: 250, overflowY: 'auto' }} className="mt-12">
             {(f.design.decorations || []).map((dec, i) => (
               <div key={i} style={{ background: 'var(--surface-2)', padding: 12, borderRadius: 8, marginBottom: 8, display: 'flex', gap: 16 }}>
                  <div style={{ width: 40, height: 40, background: 'var(--line-soft)', borderRadius: 4, flexShrink: 0, overflow: 'hidden' }}>
                      <img src={dec.url} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
                  </div>
                  <div style={{ flex: 1 }}>
                     <div className="row gap-12">
                        <div style={{flex: 1}}>
                            <div className="t10 faint mb-4">X Position ({Math.round(dec.x * 100)}%)</div>
                            <input type="range" min="-50" max="150" value={dec.x * 100} onChange={e => updateDec(i, 'x', Number(e.target.value) / 100)} style={{width: '100%'}}/>
                        </div>
                        <div style={{flex: 1}}>
                            <div className="t10 faint mb-4">Y Position ({Math.round(dec.y * 100)}%)</div>
                            <input type="range" min="-50" max="150" value={dec.y * 100} onChange={e => updateDec(i, 'y', Number(e.target.value) / 100)} style={{width: '100%'}}/>
                        </div>
                     </div>
                     <div className="row gap-12 mt-8">
                        <div style={{flex: 1}}>
                            <div className="t10 faint mb-4">Size ({Math.round(dec.width * 100)}%)</div>
                            <input type="range" min="5" max="300" value={dec.width * 100} onChange={e => { updateDec(i, 'width', Number(e.target.value) / 100); updateDec(i, 'height', Number(e.target.value) / 100); }} style={{width: '100%'}}/>
                        </div>
                        <div style={{flex: 1}} className="row gap-6">
                            <Toggle on={dec.overlay} onChange={v => updateDec(i, 'overlay', v)} />
                            <span className="t10">Overlay foreground</span>
                        </div>
                     </div>
                  </div>
                  <button type="button" onClick={() => removeDec(i)} style={{background:'none', border:'none', color:'var(--danger)', cursor:'pointer'}}>
                      <Icon name="trash" size={16} />
                  </button>
               </div>
             ))}
          </div>

        </Card>

        {/* ---- right: live preview ---- */}
        <Card style={{ flex: '1 1 50%', overflowY: 'hidden', padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div className="sess-block-title" style={{ flexShrink: 0 }}><Icon name="camera" size={12} /> Live Preview (Editable)</div>
          <div style={{
            flex: 1, display: 'flex', justifyContent: 'center', padding: '18px',
            background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)',
            alignItems: 'center', minHeight: 0 // Allow container to shrink
          }}>
            <div style={{ height: '100%', maxHeight: '70vh', aspectRatio: f.layoutObj?.aspect || (2/3), position: 'relative' }}>
              {f.layoutObj ? (
                <TemplateRenderer 
                  layout={f.layoutObj} 
                  design={f.design} 
                  cachedAssets={{}}
                  onSlotChange={(updatedSlot) => {
                    if (drawMode) return // Disable dragging while drawing
                    const newSlots = f.layoutObj.slots.map(s => s.id === updatedSlot.id ? updatedSlot : s);
                    setF(x => ({ ...x, layoutObj: { ...x.layoutObj, slots: newSlots } }));
                  }}
                  onSlotDelete={(id) => {
                    const newSlots = f.layoutObj.slots.filter(s => s.id !== id);
                    setF(x => ({ ...x, layoutObj: { ...x.layoutObj, slots: newSlots } }));
                  }}
                />
              ) : null}
              
              {/* Canvas Overlay for Brush tool */}
              {drawMode && (
                <canvas 
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: '100%', height: '100%',
                    zIndex: 9999, // On top of everything to draw
                    cursor: 'crosshair',
                    touchAction: 'none'
                  }}
                />
              )}
            </div>
          </div>
          <p className="t11 faint mt-12" style={{ lineHeight: 1.55 }}>
            {drawMode ? (
               <span style={{ color: 'var(--hp-pink)' }}><b>Draw Mode Active:</b> Use your mouse to draw over the template. Click "Save Drawing" when done.</span>
            ) : (
               <span><b>Interactive Slots:</b> You can drag the photo slots (rectangles) to move them, and drag their bottom-right corner to resize them!</span>
            )}
          </p>
        </Card>
      </div>
    </div>
  )
}

const colorBoxStyle = {
  width: 46, height: 38, border: '1px solid var(--line)', borderRadius: 7, background: 'var(--surface)', cursor: 'pointer', padding: 2,
}
