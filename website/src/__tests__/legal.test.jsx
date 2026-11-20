// The legal pages and the account-deletion page.
//
// These are the pages an app-store reviewer opens, and the ones a guest
// reaches from the footer. They are static, so what matters is that every
// section really renders, that the footer links point at them, and that
// the deletion page refuses to arm until credentials are entered.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import Privacy from '../pages/legal/Privacy.jsx'
import Terms from '../pages/legal/Terms.jsx'
import Subscription from '../pages/legal/Subscription.jsx'
import DeleteAccount from '../pages/legal/DeleteAccount.jsx'
import SlideToConfirm from '../components/SlideToConfirm.jsx'
import Seo from '../components/Seo.jsx'
import { resolveRouteSeo } from '../lib/seo.js'
import { privacySections } from '../pages/legal/privacySections.js'
import { termsSections } from '../pages/legal/termsSections.js'
import { subscriptionSections } from '../pages/legal/subscriptionSections.js'

// jsdom has no canvas/IntersectionObserver plumbing, which the fx layer uses.
beforeEach(() => {
  global.IntersectionObserver ||= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  global.ResizeObserver ||= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  HTMLCanvasElement.prototype.getContext = () => null
  global.fetch = vi.fn(() => Promise.reject(new Error('offline in tests')))
})

const renderPage = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('the three legal pages', () => {
  it('renders every privacy section heading', () => {
    renderPage(<Privacy />)
    for (const section of privacySections) {
      expect(screen.getAllByText(section.heading).length).toBeGreaterThan(0)
    }
  })

  it('renders every terms section heading', () => {
    renderPage(<Terms />)
    for (const section of termsSections) {
      expect(screen.getAllByText(section.heading).length).toBeGreaterThan(0)
    }
  })

  it('renders every subscription section heading', () => {
    renderPage(<Subscription />)
    for (const section of subscriptionSections) {
      expect(screen.getAllByText(section.heading).length).toBeGreaterThan(0)
    }
  })

  it('gives each section a jump target in the contents rail', () => {
    const { container } = renderPage(<Privacy />)
    for (const section of privacySections) {
      expect(container.querySelector(`#${section.id}`), `missing anchor ${section.id}`).toBeTruthy()
      expect(
        container.querySelector(`.legal-rail a[href="#${section.id}"]`),
        `missing rail link ${section.id}`,
      ).toBeTruthy()
    }
  })

  it('states the deletion window and the way to stop it', () => {
    const { container } = renderPage(<Subscription />)
    const text = container.textContent
    expect(text).toMatch(/scheduled 7 days after you confirm/i)
    expect(text).toMatch(/sign in to the CRM before the 7 days are up/i)
  })
})

describe('the account deletion page', () => {
  it('will not arm until both credentials are present', () => {
    renderPage(<DeleteAccount />)
    const slider = screen.getByRole('slider')
    expect(slider.getAttribute('aria-disabled')).toBe('true')
    expect(screen.getByText(/Enter the organization email and password/i)).toBeTruthy()

    fireEvent.change(screen.getByLabelText(/Organization email/i), { target: { value: 'owner@test.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'hunter22' } })
    expect(screen.getByRole('slider').getAttribute('aria-disabled')).toBe('false')
  })

  it('disarms again if the credentials are edited after confirming', () => {
    renderPage(<DeleteAccount />)
    fireEvent.change(screen.getByLabelText(/Organization email/i), { target: { value: 'owner@test.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'hunter22' } })
    fireEvent.click(screen.getByRole('button', { name: /Delete my account permanently/i }))
    expect(screen.getByText(/this will delete the account/i)).toBeTruthy()

    // Editing the email has to revoke the confirmation: it belonged to
    // the account that was typed in.
    fireEvent.change(screen.getByLabelText(/Organization email/i), { target: { value: 'other@test.com' } })
    expect(screen.queryByText(/this will delete the account/i)).toBeNull()
  })

  it('says what is removed, what is kept, and how to stop it', () => {
    const { container } = renderPage(<DeleteAccount />)
    const text = container.textContent
    expect(text).toMatch(/every team member/i)
    expect(text).toMatch(/Payment records and audit logs/i)
    expect(text).toMatch(/Signing in to the CRM cancels it automatically/i)
  })
})

describe('the slide control', () => {
  it('fires once on activation and reports confirmed', () => {
    const onConfirm = vi.fn()
    render(<SlideToConfirm onConfirm={onConfirm} />)
    fireEvent.click(screen.getByRole('button', { name: /Delete my account permanently/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('Confirmed')
  })

  it('does nothing while disabled', () => {
    const onConfirm = vi.fn()
    render(<SlideToConfirm onConfirm={onConfirm} disabled />)
    expect(screen.getByRole('slider').getAttribute('aria-disabled')).toBe('true')
    const fallback = screen.getByRole('button', { name: /Delete my account permanently/i })
    expect(fallback.disabled).toBe(true)
    fireEvent.click(fallback)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('does not show the action as a visible button under the slide', () => {
    render(<SlideToConfirm onConfirm={() => {}} />)
    // The action is the only button, and it must be hidden: the slide is the
    // single thing on screen, so the destructive action cannot be reached
    // with one stray click.
    const actions = screen.getAllByRole('button')
    expect(actions).toHaveLength(1)
    expect(actions[0].className).toContain('sr-only')
  })

  it('can be completed from the keyboard', () => {
    const onConfirm = vi.fn()
    render(<SlideToConfirm onConfirm={onConfirm} />)
    fireEvent.keyDown(screen.getByRole('slider'), { key: 'Enter' })
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })
})

// A route that has no SEO entry falls through to the 404 branch and the tab
// reads "Page Not Found" while the page renders perfectly. That shipped once;
// this test is what stops it shipping again.
describe('page titles', () => {
  const PAGES = ['/privacy', '/terms', '/subscription', '/account/delete']

  for (const path of PAGES) {
    it(`${path} has its own title, not the 404 one`, () => {
      const seo = resolveRouteSeo(path)
      expect(seo.title).toBeTruthy()
      expect(seo.title).not.toMatch(/not found/i)
      expect(seo.description).toBeTruthy()
    })
  }

  it('keeps the deletion page out of search results', () => {
    expect(resolveRouteSeo('/account/delete').robots).toMatch(/noindex/)
  })

  it('lets the three policies be indexed', () => {
    for (const path of ['/privacy', '/terms', '/subscription']) {
      expect(resolveRouteSeo(path).robots, path).toMatch(/^index/)
    }
  })

  it('still reports a genuine 404 as a 404', () => {
    expect(resolveRouteSeo('/no-such-page').title).toMatch(/not found/i)
  })
})

// resolveRouteSeo returning a title is not the same as that title reaching the
// tab: <Seo/> is what writes document.title, and a page can override it.
describe('the title actually reaches the tab', () => {
  const EXPECTED = {
    '/privacy': /Privacy Policy/,
    '/terms': /Terms of Service/,
    '/subscription': /Subscription & Cancellation/,
    '/account/delete': /Delete Your HappyPix Account/,
  }

  for (const [path, pattern] of Object.entries(EXPECTED)) {
    it(path, () => {
      render(<MemoryRouter initialEntries={[path]}><Seo /></MemoryRouter>)
      expect(document.title).toMatch(pattern)
      expect(document.title).not.toMatch(/not found/i)
    })
  }
})
