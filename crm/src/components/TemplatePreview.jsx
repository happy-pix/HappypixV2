// Renders any template (designer or playground/composable) at preview size.
// All templates are SVG at the layout's print proportions — crisp everywhere.

import { layoutById, slotsForLayout } from '../lib/layouts.js'
import { getTemplateRenderer } from '../templates/registry.jsx'

export default function TemplatePreview({ template, width = 120, photos, logos, title, tagline, style, className = '' }) {
  const layout = layoutById(template?.layoutId)
  if (!layout) return <div style={{ width, aspectRatio: '2 / 3', background: 'var(--surface-2)', borderRadius: 8, ...style }} className={className} />
  
  let geo = slotsForLayout(layout.id)
  let mappedTemplate = template

  // Map custom slots and decorations if they exist (from Org Templates)
  if (template?.slots?.length > 0 || template?.design?.decorations?.length > 0) {
    const { w, h } = layout.canvas || { w: 1000, h: 1500 }
    mappedTemplate = { ...template, design: { ...template?.design } }
    
    if (template.slots?.length > 0) {
      geo = {
        ...geo,
        photoSlots: template.slots.map(s => ({
          id: s.id,
          x: s.x <= 1 ? s.x * w : s.x,
          y: s.y <= 1 ? s.y * h : s.y,
          width: s.width <= 1 ? s.width * w : s.width,
          height: s.height <= 1 ? s.height * h : s.height
        }))
      }
    }

    if (template.design?.decorations?.length > 0) {
      mappedTemplate.design.decorations = template.design.decorations.map(dec => {
        if (dec.x !== undefined && dec.x <= 1 && dec.y <= 1) {
          return {
            ...dec,
            x: dec.x * w,
            y: dec.y * h,
            width: dec.width ? dec.width * w : undefined,
            height: dec.height ? dec.height * h : undefined,
            size: dec.width ? dec.width * w : dec.size
          }
        }
        return dec
      })
    }
  }

  const Render = getTemplateRenderer(mappedTemplate)
  return (
    <div style={{ width, lineHeight: 0, ...style }} className={className}>
      <Render layout={layout} geo={geo} template={mappedTemplate} photos={photos} logos={logos} title={title} tagline={tagline} />
    </div>
  )
}
