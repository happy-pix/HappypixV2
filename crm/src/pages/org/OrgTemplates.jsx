import { useState, useEffect } from 'react'
import { Card, CardHead, Field, TextInput, Button, EmptyState } from '../../components/ui.jsx'
import { api } from '../../api/index.js'
import TemplateRenderer from '../../components/TemplateRenderer.jsx'
import { cacheAsset, getCachedAssetUrl } from '../../utils/indexedDbCache.js'

export default function OrgTemplates() {
  const [globalLayouts, setGlobalLayouts] = useState([])
  const [selectedLayout, setSelectedLayout] = useState(null)
  
  const [prompt, setPrompt] = useState('')
  const [currentDesign, setCurrentDesign] = useState({})
  const [currentAssets, setCurrentAssets] = useState([])
  const [cachedUrls, setCachedUrls] = useState({})
  
  const [savedOrgTemplates, setSavedOrgTemplates] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [viewingTemplate, setViewingTemplate] = useState(null) // for View modal

  useEffect(() => {
    const loadData = async () => {
      try {
        const globalRes = await api.org.templateLayouts()
        if (globalRes.layouts) {
          // Normalize layouts to have geometric slots for the renderer
          const normalized = globalRes.layouts.map(l => ({
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

        const orgRes = await api.org.aiTemplates()
        if (orgRes.templates) {
            setSavedOrgTemplates(orgRes.templates.filter(t => t.source !== 'manual'))
        }
      } catch (err) {
        console.error("Failed to fetch templates", err)
      }
    }
    loadData()
  }, [])

  // Helper to generate precise coordinates for the Layout Engine
  const generateMockSlots = (count, structure) => {
    const slots = [];
    if (structure === 'VSTACK' || structure === 'STACK' || structure === 'FILM') {
      const h = 0.9 / count;
      for(let i=0; i<count; i++) {
        slots.push({ id: `photo-${i+1}`, x: 0.05, y: 0.05 + (i * h), width: 0.9, height: h - 0.02 })
      }
    } else if (structure.startsWith('HERO3')) {
      // 1 big on top, 3 small at bottom
      slots.push({ id: 'photo-1', x: 0.05, y: 0.05, width: 0.9, height: 0.6 });
      slots.push({ id: 'photo-2', x: 0.05, y: 0.7, width: 0.28, height: 0.25 });
      slots.push({ id: 'photo-3', x: 0.36, y: 0.7, width: 0.28, height: 0.25 });
      slots.push({ id: 'photo-4', x: 0.67, y: 0.7, width: 0.28, height: 0.25 });
    } else {
      // Generic fallback: cascade them so they don't overlap fully
      for(let i=0; i<count; i++) {
        const offset = i * 0.05;
        slots.push({ id: `photo-${i+1}`, x: 0.1 + offset, y: 0.1 + offset, width: 0.6, height: 0.6 })
      }
    }
    return slots;
  }

  const handleAiGenerate = async (e) => {
    e.preventDefault()
    if (!prompt.trim() || !selectedLayout) return
    
    setIsGenerating(true)
    
    try {
      const res = await api.org.generateAiTemplate({
        prompt,
        layout: {
          code: selectedLayout.codeword,
          width: selectedLayout.width,
          height: selectedLayout.height,
          orientation: selectedLayout.aspect > 1 ? 'landscape' : 'portrait',
          slotCount: selectedLayout.slotCount
        },
        currentDesign: currentDesign,
        currentAssets: currentAssets
      })
      
      const { updatedDesign, newAssets, layout: returnedLayout } = res;
      
      setCurrentDesign(updatedDesign);
      
      // Update assets list
      const mergedAssets = [...currentAssets];
      for (const na of newAssets) {
         if (!mergedAssets.find(a => a.assetId === na.assetId)) {
           mergedAssets.push(na);
         }
      }
      setCurrentAssets(mergedAssets);

      // Cache new assets in IndexedDB via backend proxy (avoids S3 CORS)
      const newUrls = { ...cachedUrls };
      for (const asset of newAssets) {
        if (asset.assetId) {
          let fetchUrl = `/api/org/asset-proxy?key=${encodeURIComponent(asset.assetId)}`;
          if (asset.isTemp && asset.url && asset.url.startsWith('data:')) {
            fetchUrl = asset.url; // Use data URL directly
          }
          await cacheAsset(asset.assetId, fetchUrl, asset.mimeType || 'image/jpeg');
          newUrls[asset.assetId] = await getCachedAssetUrl(asset.assetId);
          // Fallback: use fetchUrl directly if IndexedDB fails
          if (!newUrls[asset.assetId]) newUrls[asset.assetId] = fetchUrl;
        }
      }
      setCachedUrls(newUrls);
      setHasUnsavedChanges(true);

    } catch (err) {
      console.error("AI Generation Error", err)
      alert(err?.response?.data?.error || err.message || "Failed to generate AI template.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (Object.keys(currentDesign).length > 0) {
      const suggestedName = currentDesign?.theme?.name || 'AI Generated Template';
      const templateName = window.prompt("Enter a name for this template:", suggestedName);
      
      if (!templateName || !templateName.trim()) {
        return; // Cancelled or empty name
      }

      try {
        const payload = {
          name: templateName.trim(),
          layout: {
             code: selectedLayout.codeword,
             width: selectedLayout.width,
             height: selectedLayout.height,
             orientation: selectedLayout.aspect > 1 ? 'landscape' : 'portrait',
             slotCount: selectedLayout.slotCount
          },
          slots: selectedLayout.slots,
          design: currentDesign,
          assets: currentAssets,
          prompt: prompt
        };
        
        const res = await api.org.saveAiTemplate(payload)
        if (res.template) {
          setSavedOrgTemplates([res.template, ...savedOrgTemplates])
          setHasUnsavedChanges(false)
          alert("Template Saved Successfully!")
        }
      } catch (err) {
        console.error("Failed to save template", err)
        const msg = err?.response?.data?.error || err?.data?.error || err.message || 'Failed to save template to backend';
        alert(`Save failed: ${msg}`)
      }
    }
  }

  const handleReset = () => {
    setCurrentDesign({})
    setCurrentAssets([])
    setHasUnsavedChanges(false)
    setPrompt('')
  }

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    try {
      await api.org.deleteAiTemplate(id);
      setSavedOrgTemplates(savedOrgTemplates.filter(t => (t.id || t._id) !== id));
    } catch (err) {
      console.error("Failed to delete template", err);
      alert(err?.response?.data?.error || err.message || "Failed to delete template.");
    }
  }

  return (
    <div className="page" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '600' }}>AI Template Studio</h1>
        <p className="muted" style={{ marginTop: '8px' }}>Select a global layout and use AI to generate beautiful customized templates for your organization.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card pad>
            <CardHead title="1. Select Global Layout (Immutable)" sub="Choose a structural base layout created by the platform." />
            {globalLayouts.length === 0 ? (
              <EmptyState icon="layout" title="No Layouts Found" message="The platform owner hasn't published any global layouts yet." />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px', marginTop: '16px', maxHeight: '300px', overflowY: 'auto', padding: '4px' }}>
                {globalLayouts.map((layout, index) => (
                  <div 
                    key={layout.id ? `${layout.id}-${index}` : index} 
                    onClick={() => {
                       if (hasUnsavedChanges && !window.confirm("You have unsaved changes. Discard and switch layout?")) return;
                       setSelectedLayout(layout);
                       handleReset();
                    }}
                    style={{ 
                      cursor: 'pointer',
                      border: selectedLayout?.id === layout.id ? '2px solid var(--hp-pink)' : '1px solid var(--line-soft)',
                      borderRadius: '8px',
                      padding: '8px',
                      background: selectedLayout?.id === layout.id ? 'var(--hp-pink-soft)' : 'var(--surface-2)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ width: '100%', marginBottom: '8px', opacity: 0.5 }}>
                       {/* Mini preview for layouts (wireframe) */}
                       <div style={{ width: '100%', aspectRatio: layout.aspect, border: '1px solid #ccc', position: 'relative' }}>
                          {layout.slots.map(s => (
                             <div key={s.id} style={{ position: 'absolute', left: s.x*100+'%', top: s.y*100+'%', width: s.width*100+'%', height: s.height*100+'%', background: '#ccc' }} />
                          ))}
                       </div>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '600', textAlign: 'center', wordBreak: 'break-all' }}>{layout.codeword}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card pad style={{ opacity: selectedLayout ? 1 : 0.5, pointerEvents: selectedLayout ? 'auto' : 'none' }}>
            <CardHead title="2. Design Modification (AI)" sub="Enter intent (e.g. 'Make it Marvel themed', 'Change background to gold')" />
            <form onSubmit={handleAiGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <Field label="AI Prompt" required>
                <TextInput 
                  value={prompt} 
                  onChange={e => setPrompt(e.target.value)} 
                  placeholder="e.g. Superhero theme with dark blue and red" 
                />
              </Field>
              <div style={{ display: 'flex', gap: '8px' }}>
                 <Button variant="primary" type="submit" disabled={!prompt.trim() || isGenerating} style={{ flex: 1 }}>
                   {isGenerating ? 'Applying AI Patches...' : (hasUnsavedChanges ? 'Regenerate / Refine' : 'Generate Initial Design')}
                 </Button>
                 {hasUnsavedChanges && (
                   <Button variant="secondary" onClick={handleReset} type="button">Reset</Button>
                 )}
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column */}
        <Card pad style={{ display: 'flex', flexDirection: 'column' }}>
          <CardHead title="Live Renderer Preview" sub="Layered preview using Cached Assets." />
          <div style={{ flex: 1, minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--line-soft)', borderRadius: '8px', marginTop: '16px', background: 'var(--surface-2)', padding: '24px' }}>
            {selectedLayout ? (
              <div style={{ width: '100%', maxWidth: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                
                {/* The new layered Renderer */}
                <TemplateRenderer 
                  layout={selectedLayout} 
                  design={currentDesign} 
                  cachedAssets={cachedUrls} 
                  onSlotChange={(updatedSlot) => {
                    const newSlots = selectedLayout.slots.map(s => 
                      s.id === updatedSlot.id ? updatedSlot : s
                    );
                    setSelectedLayout({ ...selectedLayout, slots: newSlots });
                    setHasUnsavedChanges(true);
                  }}
                />
                
                {hasUnsavedChanges && (
                  <div style={{ marginTop: '24px', width: '100%', background: 'var(--surface-1)', padding: '16px', borderRadius: '8px', border: '1px solid var(--line-soft)' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Design State</h4>
                    <p className="muted" style={{ margin: 0, fontSize: '12px' }}>Theme: {currentDesign?.theme?.name || 'Unset'}</p>
                    <p className="muted" style={{ margin: '4px 0 0 0', fontSize: '12px' }}>Assets loaded: {currentAssets.length}</p>
                    <p className="muted" style={{ margin: '4px 0 0 0', fontSize: '12px' }}>Base Layout: <strong>{selectedLayout.codeword}</strong></p>
                  </div>
                )}

                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                  <Button variant="primary" icon="check" onClick={handleSave} disabled={!hasUnsavedChanges}>Save to Organization</Button>
                </div>
              </div>
            ) : (
              <EmptyState icon="sparkles" title="Select Layout" message="Choose a layout structure to begin." />
            )}
          </div>
        </Card>
      </div>

      <h2 style={{ fontSize: '18px', fontWeight: '600', marginTop: '40px', marginBottom: '16px' }}>Organization Templates (Saved)</h2>
      {savedOrgTemplates.length === 0 ? (
        <Card pad>
           <EmptyState icon="template" title="No Templates Yet" message="Your AI-generated templates will appear here." />
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {savedOrgTemplates.map(template => (
            <Card key={template.id || template._id} pad style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                 <span style={{ fontWeight: '600', fontSize: '14px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{template.name}</span>
                 <div style={{ display: 'flex', gap: '8px', flexShrink: 0, marginLeft: '8px' }}>
                   <button
                     onClick={() => setViewingTemplate(template)}
                     style={{
                       background: 'var(--hp-pink)',
                       color: '#fff',
                       border: 'none',
                       borderRadius: '6px',
                       padding: '4px 12px',
                       fontSize: '12px',
                       cursor: 'pointer',
                       fontWeight: '600'
                     }}
                   >
                     View
                   </button>
                   <button
                     onClick={() => handleDeleteTemplate(template.id || template._id)}
                     style={{
                       background: '#ef4444',
                       color: '#fff',
                       border: 'none',
                       borderRadius: '6px',
                       padding: '4px 12px',
                       fontSize: '12px',
                       cursor: 'pointer',
                       fontWeight: '600'
                     }}
                   >
                     Delete
                   </button>
                 </div>
               </div>
               <div style={{ width: '120px' }}>
                  <TemplateRenderer 
                    layout={{ aspect: template.layout?.width / template.layout?.height, slots: template.slots }} 
                    design={template.design} 
                    cachedAssets={{}}
                  />
               </div>
               <div className="muted" style={{ fontSize: '11px', marginTop: '12px', textAlign: 'center' }}>
                 Layout: {template.layout?.code || template.layoutCode}
               </div>
               <div className="muted" style={{ fontSize: '11px', marginTop: '4px' }}>
                 Added {new Date(template.createdAt).toLocaleDateString()}
               </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── View Template Modal ────────────────────────────── */}
      {viewingTemplate && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setViewingTemplate(null); }}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
        >
          <div style={{
            background: 'var(--surface-1)',
            borderRadius: '16px',
            border: '1px solid var(--line-soft)',
            width: '100%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--line-soft)' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>{viewingTemplate.name}</h2>
                <p className="muted" style={{ margin: '4px 0 0 0', fontSize: '13px' }}>Layout: <strong>{viewingTemplate.layout?.code}</strong> · {viewingTemplate.layout?.slotCount} photo slots</p>
              </div>
              <button
                onClick={() => setViewingTemplate(null)}
                style={{ background: 'none', border: '1px solid var(--line-soft)', borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer', fontSize: '18px', color: 'var(--text-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >✕</button>
            </div>

            {/* Modal Body */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', padding: '24px' }}>
              {/* Left: Full Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <p style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600', color: 'var(--text-2)' }}>FULL PREVIEW</p>
                <div style={{ width: '100%', maxWidth: '300px' }}>
                  <TemplateRenderer
                    layout={{ 
                      aspect: viewingTemplate.layout?.width / viewingTemplate.layout?.height || (2/3), 
                      slots: viewingTemplate.slots || [] 
                    }}
                    design={viewingTemplate.design}
                    cachedAssets={{}}
                  />
                </div>
              </div>

              {/* Right: Design Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '600', color: 'var(--text-2)' }}>DESIGN DETAILS</p>

                {viewingTemplate.design?.theme && (
                  <div style={{ background: 'var(--surface-2)', borderRadius: '10px', padding: '14px' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: '700', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Theme</p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>{viewingTemplate.design.theme.name}</p>
                    {viewingTemplate.design.theme.mood?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                        {viewingTemplate.design.theme.mood.map((m, i) => (
                          <span key={i} style={{ background: 'var(--hp-pink-soft)', color: 'var(--hp-pink)', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>{m}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {viewingTemplate.design?.palette && (
                  <div style={{ background: 'var(--surface-2)', borderRadius: '10px', padding: '14px' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: '700', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Color Palette</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {Object.entries(viewingTemplate.design.palette).map(([key, val]) => (
                        <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: val, border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }} />
                          <span style={{ fontSize: '10px', color: 'var(--text-3)', textTransform: 'capitalize' }}>{key}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ background: 'var(--surface-2)', borderRadius: '10px', padding: '14px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: '700', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Canvas</p>
                  <p style={{ margin: '0', fontSize: '13px' }}>{viewingTemplate.layout?.width || 1200} × {viewingTemplate.layout?.height || 1800} px</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>Orientation: <strong>{viewingTemplate.layout?.orientation || 'Portrait'}</strong></p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>Photo Slots: <strong>{viewingTemplate.slots?.length || 0}</strong></p>
                </div>

                {viewingTemplate.assets?.length > 0 && (
                  <div style={{ background: 'var(--surface-2)', borderRadius: '10px', padding: '14px' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: '700', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Generated Assets ({viewingTemplate.assets.length})</p>
                    {viewingTemplate.assets.map((a, i) => (
                      <p key={i} style={{ margin: '2px 0', fontSize: '12px', color: 'var(--text-2)' }}>• {a.type} — {a.role}</p>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                  <p className="muted" style={{ fontSize: '12px', margin: 0 }}>Saved: {new Date(viewingTemplate.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
