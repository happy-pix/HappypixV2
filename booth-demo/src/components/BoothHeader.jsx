import React from 'react'
import Logo from './Logo'

function Clock(){
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7.6V12l3 1.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function progressFor(step){
  if(step === 'SELECT SHOTS') return 6
  if(step === 'FINAL STEP') return 7
  const match = String(step || '').match(/STEP\s+(\d+)/i)
  return match ? Math.min(7, Number(match[1])) : 0
}

export default function BoothHeader({ title, subtitle, step, secondsLeft = 60, showTimer = true }){
  const current = progressFor(step)
  const urgent = secondsLeft <= 10
  const warn = secondsLeft <= 20 && !urgent
  const display = secondsLeft >= 60
    ? `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2,'0')}`
    : `${secondsLeft}s`

  return (
    <>
      <header className="booth-header">
        <div className="booth-header-left"><Logo height={27} color="#6f4bc5" /></div>
        <div className="flow-progress" role="progressbar" aria-label="Guest journey progress" aria-valuemin={0} aria-valuemax={7} aria-valuenow={current}>
          {Array.from({ length: 7 }, (_, index) => <span key={index} className={index < current - 1 ? 'is-done' : index === current - 1 ? 'is-current' : ''} />)}
        </div>
        <div className="header-status">
          <span className="demo-state"><i /> Demo</span>
          {showTimer && secondsLeft > 0
            ? <div className={`booth-timer ${urgent ? 'urgent' : warn ? 'warn' : ''}`}><Clock />{display}</div>
            : null}
        </div>
      </header>
      <section className="screen-heading" aria-live="polite">
        {step && <div className="screen-heading-kicker">GUEST FLOW · {step}</div>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </section>
    </>
  )
}
