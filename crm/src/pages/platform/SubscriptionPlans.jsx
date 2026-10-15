import { useEffect, useState } from 'react'
import { api } from '../../api/index.js'
import { useApp } from '../../context/AppContext.jsx'
import { Button, Card, Chip, EmptyState, Field, Modal, PageLoader, Select, TextArea, TextInput, Toggle } from '../../components/ui.jsx'
import { Icon } from '../../lib/icons.jsx'
import { inr, relativeTime } from '../../lib/format.js'

const emptyPlan = {
  key: '', name: '', description: '', price: '', durationMonths: 1,
  durationLabel: 'per month', devices: 2, events: 1, active: true,
  kind: 'plan', priceMonthly: '', priceAnnual: '',
  billingNote: '', aiCredits: 0,
  discountType: 'none', discountValue: '', discountLabel: '', discountStartsAt: '', discountEndsAt: '',
  discountMaxRedemptions: '', 
}

// Mirror of backend services/planService.js planPricing() — used ONLY for
// instant preview in the editor; the server remains the source of truth and
// returns `plan.pricing` which the cards prefer when present.
export function computePricing(plan, now = new Date()) {
  const price = plan.price === '' || plan.price == null ? null : Number(plan.price)
  const type = ['percent', 'flat'].includes(plan.discountType) ? plan.discountType : 'none'
  const value = Number(plan.discountValue) || 0
  const starts = plan.discountStartsAt ? new Date(plan.discountStartsAt) : null
  const ends = plan.discountEndsAt ? new Date(plan.discountEndsAt) : null
  const maxRedemptions = Number(plan.discountMaxRedemptions) || 0
  const redemptions = Number(plan.discountRedemptions) || 0
  let active = type !== 'none' && value > 0 && price != null && price > 0
  if (active && starts && now < starts) active = false
  if (active && ends && now > ends) active = false
  if (active && maxRedemptions > 0 && redemptions >= maxRedemptions) active = false
  const scheduled = type !== 'none' && value > 0 && price != null && price > 0 && starts && now < starts
  const amount = active ? (type === 'percent' ? Math.round((price * Math.min(100, value)) / 100) : Math.min(price, Math.round(value))) : 0
  return {
    price, effectivePrice: price == null ? null : price - amount, discountAmount: amount,
    discountPercent: price && amount ? Math.round((amount / price) * 100) : 0,
    active, scheduled, type, value, starts, ends, maxRedemptions, redemptions,
    slotsLeft: maxRedemptions > 0 ? Math.max(0, maxRedemptions - redemptions) : null,
  }
}

const toLocalInput = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d)) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
const fromLocalInput = (value) => (value ? new Date(value).toISOString() : null)

export default function SubscriptionPlans() {
  const { toast } = useApp()
  const [plans, setPlans] = useState(null)
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = () => api.platform.plans()
    .then((result) => setPlans(result.plans))
    .catch((e) => toast(e.message, 'error'))

  useEffect(() => { load() }, [])

  const openNew = () => {
    setError('')
    setEditing('new')
    setDraft({ ...emptyPlan })
  }

  const openEdit = (plan) => {
    setError('')
    setEditing(plan)
    setDraft({
      ...plan,
      price: plan.price == null ? '' : plan.price,
      kind: plan.kind || 'plan',
      priceMonthly: plan.priceMonthly == null ? '' : plan.priceMonthly,
      priceAnnual: plan.priceAnnual == null ? '' : plan.priceAnnual,
      discountMaxRedemptions: plan.discountMaxRedemptions || '',
      discountRedemptions: Number(plan.discountRedemptions) || 0,
      billingNote: plan.billingNote || '',
      aiCredits: plan.aiCredits || 0,
      discountType: plan.discountType || 'none',
      discountValue: plan.discountValue || '',
      discountLabel: plan.discountLabel || '',
      discountStartsAt: toLocalInput(plan.discountStartsAt),
      discountEndsAt: toLocalInput(plan.discountEndsAt),
    })
  }

  const save = async () => {
    setError('')
    if (!draft?.name.trim() || (editing === 'new' && !draft.key.trim())) {
      return setError('Plan name and key are required.')
    }
    // Discount validation mirrors the backend (planService.parseDiscountInput).
    if (draft.discountType !== 'none') {
      const value = Number(draft.discountValue)
      const price = draft.price === '' ? null : Number(draft.price)
      if (!value || value <= 0) return setError('Enter a discount value, or set the discount type to None.')
      if (draft.discountType === 'percent' && value > 100) return setError('Percent discount must be between 1 and 100.')
      if (draft.discountType === 'flat' && (price == null || price === 0)) return setError('A flat (₹) discount needs a priced plan.')
      if (draft.discountType === 'flat' && price != null && value >= price) return setError('Flat discount must be less than the plan price.')
      if (draft.discountType === 'percent' && (price == null || price === 0)) return setError('A percent discount needs a priced plan.')
      if (draft.discountStartsAt && draft.discountEndsAt && new Date(draft.discountEndsAt) <= new Date(draft.discountStartsAt)) {
        return setError('Discount end must be after its start.')
      }
    }
    setBusy(true)
    try {
      const body = {
        ...draft,
        name: draft.name.trim(),
        key: draft.key.trim().toLowerCase(),
        description: draft.description.trim(),
        price: draft.price === '' ? null : Number(draft.price),
        durationMonths: Number(draft.durationMonths),
        devices: Number(draft.devices),
        events: Number(draft.events),
        kind: draft.kind === 'addon' ? 'addon' : 'plan',
        priceMonthly: draft.priceMonthly === '' || draft.priceMonthly == null ? null : Number(draft.priceMonthly),
        priceAnnual: draft.priceAnnual === '' || draft.priceAnnual == null ? null : Number(draft.priceAnnual),
        discountMaxRedemptions: Math.max(0, Math.floor(Number(draft.discountMaxRedemptions) || 0)),
        discountRedemptions: Number(draft.discountRedemptions) || 0,
        billingNote: (draft.billingNote || '').trim(),
        aiCredits: Math.max(0, Number(draft.aiCredits) || 0),
        discountType: draft.discountType || 'none',
        discountValue: draft.discountType === 'none' ? 0 : Number(draft.discountValue) || 0,
        discountLabel: (draft.discountLabel || '').trim(),
        discountStartsAt: draft.discountType === 'none' ? null : fromLocalInput(draft.discountStartsAt),
        discountEndsAt: draft.discountType === 'none' ? null : fromLocalInput(draft.discountEndsAt),
      }
      if (editing === 'new') await api.platform.createPlan(body)
      else await api.platform.updatePlan(editing.id, body)
      toast(editing === 'new' ? `Plan “${body.name}” added` : `Plan “${body.name}” updated`)
      setEditing(null)
      load()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-title">Subscription Plans</div>
          <div className="page-sub">Owner-managed plan catalogue. Limits edited here are enforced for organizations using that plan.</div>
        </div>
        <Button variant="primary" icon="plus" onClick={openNew}>Add plan</Button>
      </div>

      {!plans ? <PageLoader /> : plans.length === 0 ? (
        <Card><EmptyState icon="tag" title="No subscription plans" message="Add the first plan offered to organizations." /></Card>
      ) : (
        <div className="plan-grid">
          {plans.map((plan) => (
            <Card key={plan.id} style={{ overflow: 'hidden', opacity: plan.active ? 1 : 0.66 }}>
              <div style={{ padding: '17px 18px 14px', borderBottom: '1px solid var(--line-soft)' }}>
                <div className="row between gap-12">
                  <div className="row gap-8" style={{ minWidth: 0 }}>
                    <span className="stat-ico" style={{ background: 'var(--hp-pink-soft)', color: 'var(--hp-pink-deep)' }}><Icon name="tag" size={15} /></span>
                    <div style={{ minWidth: 0 }}>
                      <div className="t13 fw7 ellipsis">{plan.name}</div>
                      <div className="t11 faint">{plan.key}</div>
                    </div>
                  </div>
                  <Chip tone={plan.active ? 'active' : 'neutral'} dot>{plan.active ? 'Active' : 'Hidden'}</Chip>
                </div>
                {(() => {
                  const pricing = plan.pricing
                    ? { price: plan.pricing.originalPrice, effectivePrice: plan.pricing.effectivePrice, discountAmount: plan.pricing.discountAmount, discountPercent: plan.pricing.discountPercent, active: plan.pricing.discount.active, scheduled: false, type: plan.pricing.discount.discountType, ends: plan.pricing.discount.discountEndsAt ? new Date(plan.pricing.discount.discountEndsAt) : null, starts: plan.pricing.discount.discountStartsAt ? new Date(plan.pricing.discount.discountStartsAt) : null, redemptions: Number(plan.pricing.discount.discountRedemptions) || 0, slotsLeft: plan.pricing.discount.discountMaxRedemptions > 0 ? Math.max(0, Number(plan.pricing.discount.discountMaxRedemptions) - (Number(plan.pricing.discount.discountRedemptions) || 0)) : null }
                    : computePricing(plan)
                  return (
                    <>
                      <div className="row gap-8" style={{ alignItems: 'baseline', marginTop: 14, flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 24, fontWeight: 730, letterSpacing: '-.03em' }}>
                          {pricing.price == null ? 'Contact sales' : inr(pricing.active ? pricing.effectivePrice : pricing.price)}
                        </div>
                        {pricing.active ? <div className="t13 faint" style={{ textDecoration: 'line-through' }}>{inr(pricing.price)}</div> : null}
                        {pricing.active ? <Chip tone="pink">−{pricing.discountPercent}%</Chip> : pricing.scheduled ? <Chip tone="info">Discount scheduled</Chip> : null}
                      </div>
                      <div className="t11 muted">
                        {plan.durationLabel || `${plan.durationMonths} months`}
                        {pricing.active ? ` · You save ${inr(pricing.discountAmount)}${pricing.ends ? ` · ends ${relativeTime(pricing.ends.toISOString())}` : ''}` : ''}
                        {pricing.scheduled && pricing.starts ? ` · ${plan.discountType === 'percent' ? `${plan.discountValue}%` : inr(Number(plan.discountValue))} off from ${relativeTime(pricing.starts.toISOString())}` : ''}
                        {!pricing.active && !pricing.scheduled && plan.discountLabel ? ` · ${plan.discountLabel}` : ''}
                        {pricing.active && pricing.slotsLeft != null ? ` · ${pricing.slotsLeft} discounted slot${pricing.slotsLeft === 1 ? '' : 's'} left (${pricing.redemptions} used)` : ''}
                        {pricing.active && pricing.slotsLeft == null ? ` · ${pricing.redemptions} discounted checkout${pricing.redemptions === 1 ? '' : 's'} so far` : ''}
                      </div>
                    </>
                  )
                })()}
              </div>
              <div style={{ padding: '14px 18px' }}>
                <p className="t12 muted" style={{ lineHeight: 1.55, minHeight: 38 }}>{plan.description || 'No description.'}</p>
                <div className="row gap-8 wrap mt-12">
                  <Chip tone={plan.kind === 'addon' ? 'pink' : 'info'}>{plan.kind === 'addon' ? 'Add-on' : 'Plan'}</Chip>
                  {plan.kind !== 'addon' ? <Chip tone="info">{plan.devices} device{plan.devices === 1 ? '' : 's'}</Chip> : null}
                  {plan.kind !== 'addon' ? <Chip tone="purple">{plan.events} parallel event{plan.events === 1 ? '' : 's'}</Chip> : null}
                  {plan.aiCredits ? <Chip tone="warn">{plan.aiCredits} AI credits</Chip> : null}
                </div>
                {plan.billing ? (
                  <div className="t11 muted" style={{ marginTop: 10, lineHeight: 1.6 }}>
                    {plan.billing.inr.monthly != null ? <>Monthly {inr(plan.billing.inr.monthly)}</> : null}
                    {plan.billing.inr.annual != null ? <> · Annual {inr(plan.billing.inr.annual)} ({inr(plan.billing.inr.annualPerMonth)}/mo)</> : null}
                    {plan.billingNote ? <> · {plan.billingNote}</> : null}
                  </div>
                ) : null}
                <div className="row between mt-16" style={{ paddingTop: 12, borderTop: '1px solid var(--line-soft)' }}>
                  <div className="t11 faint">
                    {plan.organizations} org{plan.organizations === 1 ? '' : 's'} · updated {relativeTime(plan.updatedAt)}
                  </div>
                  <Button size="sm" variant="outline" icon="edit" onClick={() => openEdit(plan)}>Edit</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Add subscription plan' : `Edit ${editing?.name}`}
        sub={editing === 'new' ? 'The permanent key is used by billing and organization records.' : 'Existing organizations immediately use updated device and parallel-event limits.'}
        width="wide"
        footer={
          <>
            {error ? <span className="input-error" style={{ marginRight: 'auto' }}>{error}</span> : null}
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="primary" onClick={save} disabled={busy}>{busy ? 'Saving…' : editing === 'new' ? 'Add plan' : 'Save changes'}</Button>
          </>
        }
      >
        {draft ? (
          <div>
            <div className="form-grid-2">
              <Field label="Plan name" required>
                <TextInput value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Growth" />
              </Field>
              <Field label="Permanent key" required hint={editing === 'new' ? 'Lowercase letters, numbers and hyphens.' : 'Cannot be changed after creation.'}>
                <TextInput value={draft.key} disabled={editing !== 'new'} onChange={(e) => setDraft({ ...draft, key: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} placeholder="growth" />
              </Field>
            </div>
            <Field label="Description">
              <TextArea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Who this plan is designed for" />
            </Field>
            <div className="form-grid-2">
              <Field label="Kind">
                <Select value={draft.kind || 'plan'} onChange={(e) => setDraft({ ...draft, kind: e.target.value })}>
                  <option value="plan">Plan (Basic / Pro / Premium / Custom)</option>
                  <option value="addon">Add-on (₹299 extras)</option>
                </Select>
              </Field>
              <Field label="AI credits / period" hint="Premium includes 500.">
                <TextInput type="number" min="0" value={draft.aiCredits} onChange={(e) => setDraft({ ...draft, aiCredits: e.target.value })} />
              </Field>
              <Field label="Monthly price ₹" hint="Billed monthly. Mirrors the legacy price field.">
                <TextInput type="number" min="0" value={draft.priceMonthly} onChange={(e) => setDraft({ ...draft, priceMonthly: e.target.value, price: e.target.value })} placeholder="799" />
              </Field>
              <Field label="Annual price ₹ (12 months)" hint="Total billed upfront, e.g. 5988 = ₹499/mo.">
                <TextInput type="number" min="0" value={draft.priceAnnual} onChange={(e) => setDraft({ ...draft, priceAnnual: e.target.value })} placeholder="5988" />
              </Field>
              <Field label="Billing note" hint="e.g. per user / month, one-time.">
                <TextInput value={draft.billingNote} onChange={(e) => setDraft({ ...draft, billingNote: e.target.value })} placeholder="" />
              </Field>
              <Field label="Base list price (₹)" hint="Leave blank for Contact sales.">
                <TextInput type="number" min="0" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} placeholder="Contact sales" />
              </Field>
              <Field label="Duration label" hint="Shown exactly as written.">
                <TextInput value={draft.durationLabel} onChange={(e) => setDraft({ ...draft, durationLabel: e.target.value })} placeholder="6 months" />
              </Field>
              <Field label="Duration (months)" hint="Use 0 for a trial/custom period.">
                <TextInput type="number" min="0" max="120" value={draft.durationMonths} onChange={(e) => setDraft({ ...draft, durationMonths: e.target.value })} />
              </Field>
              <Field label="Device limit" required>
                <TextInput type="number" min="1" max="1000" value={draft.devices} onChange={(e) => setDraft({ ...draft, devices: e.target.value })} />
              </Field>
              <Field label="Parallel event limit" required>
                <TextInput type="number" min="1" max="1000" value={draft.events} onChange={(e) => setDraft({ ...draft, events: e.target.value })} />
              </Field>
            </div>
            <div style={{ padding: '13px', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', background: 'var(--hp-pink-softer)', marginBottom: 14 }}>
              <div className="t13 fw7" style={{ marginBottom: 2 }}>Discount campaign</div>
              <div className="t11 muted" style={{ marginBottom: 12 }}>
                Percent (%) or a flat ₹ amount off. The discount is live only between its start and end — leave either date empty for an open-ended side. The public pricing page and checkout use the discounted price automatically while it is live.
              </div>
              <div className="form-grid-2">
                <Field label="Discount type">
                  <Select value={draft.discountType} onChange={(e) => setDraft({ ...draft, discountType: e.target.value })}>
                    <option value="none">No discount</option>
                    <option value="percent">Percent off (%)</option>
                    <option value="flat">Flat amount off (₹)</option>
                  </Select>
                </Field>
                <Field label={draft.discountType === 'percent' ? 'Percent off' : 'Amount off (₹)'} hint={draft.discountType === 'flat' ? 'A static ₹ amount, e.g. 500.' : draft.discountType === 'percent' ? 'e.g. 20 means 20% off.' : 'Pick a discount type first.'}>
                  <TextInput type="number" min="0" max={draft.discountType === 'percent' ? '100' : undefined} value={draft.discountValue} disabled={draft.discountType === 'none'} onChange={(e) => setDraft({ ...draft, discountValue: e.target.value })} placeholder="0" />
                </Field>
                <Field label="Campaign label" hint="Shown to buyers, e.g. Launch Week.">
                  <TextInput value={draft.discountLabel} disabled={draft.discountType === 'none'} onChange={(e) => setDraft({ ...draft, discountLabel: e.target.value })} placeholder="Launch Week" />
                </Field>
                <Field label="Max discounted clients (0 = unlimited)" hint="Campaign stops after this many discounted checkouts. Manual stop: set Discount type to None.">
                  <TextInput type="number" min="0" value={draft.discountMaxRedemptions} disabled={draft.discountType === 'none'} onChange={(e) => setDraft({ ...draft, discountMaxRedemptions: e.target.value })} placeholder="0 = unlimited" />
                </Field>
                <Field label="Discounted checkouts so far" hint="Live counter from completed discounted orders.">
                  <TextInput type="number" value={draft.discountRedemptions} disabled onChange={() => {}} />
                </Field>
                <Field label="Discount starts" hint="Discount duration — start.">
                  <TextInput type="datetime-local" value={draft.discountStartsAt} disabled={draft.discountType === 'none'} onChange={(e) => setDraft({ ...draft, discountStartsAt: e.target.value })} />
                </Field>
                <Field label="Discount ends" hint="Discount duration — end.">
                  <TextInput type="datetime-local" value={draft.discountEndsAt} disabled={draft.discountType === 'none'} onChange={(e) => setDraft({ ...draft, discountEndsAt: e.target.value })} />
                </Field>
              </div>
              {draft.discountType !== 'none' && draft.price !== '' && Number(draft.price) > 0 ? (() => {
                const preview = computePricing({ ...draft, price: Number(draft.price), discountValue: Number(draft.discountValue) || 0, discountStartsAt: fromLocalInput(draft.discountStartsAt), discountEndsAt: fromLocalInput(draft.discountEndsAt) })
                return (
                  <div className="t12" style={{ marginTop: 10, padding: '9px 11px', borderRadius: 'var(--r-sm)', background: 'var(--surface)', border: '1px solid var(--line-soft)' }}>
                    {preview.active
                      ? <>Live now: <b>{inr(preview.price)}</b> → <b style={{ color: 'var(--hp-pink-deep)' }}>{inr(preview.effectivePrice)}</b> (saves {inr(preview.discountAmount)}, −{preview.discountPercent}%)</>
                      : preview.scheduled
                        ? <>Scheduled: becomes <b>{inr(preview.price - (preview.type === 'percent' ? Math.round((preview.price * Math.min(100, preview.value || Number(draft.discountValue))) / 100) : Math.min(preview.price, Number(draft.discountValue))))}</b> when the window starts.</>
                        : <>Not live at the current price/dates — check the value and the discount duration.</>}
                  </div>
                )
              })() : null}
            </div>
            <div className="row between gap-12" style={{ padding: '11px 13px', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', background: 'var(--surface-2)' }}>
              <div>
                <div className="t13 fw6">Available for sale</div>
                <div className="t11 muted">Hidden plans continue to work for organizations already subscribed.</div>
              </div>
              <Toggle on={draft.active} onChange={(active) => setDraft({ ...draft, active })} />
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
