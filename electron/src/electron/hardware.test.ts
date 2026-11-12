import { describe, expect, it, vi } from 'vitest'

vi.mock('electron', () => ({
  screen: {
    getAllDisplays: vi.fn(() => [{ id: 1, size: { width: 1920, height: 1080 }, scaleFactor: 1, bounds: { x: 0, y: 0, width: 1920, height: 1080 } }]),
    getPrimaryDisplay: vi.fn(() => ({ id: 1, size: { width: 1920, height: 1080 }, scaleFactor: 1, bounds: { x: 0, y: 0, width: 1920, height: 1080 } })),
  },
  app: {
    getPath: vi.fn(() => './test-tmp'),
  },
}))

vi.mock('./store.js', () => ({
  getCounters: vi.fn(async () => ({ printsTotal: 10, shutterCount: 50 })),
  incrementCounter: vi.fn(async (_k, amount = 1) => 10 + amount),
  setCounter: vi.fn(async () => {}),
}))

vi.mock('./dnpTelemetry.js', () => ({
  getDnpTelemetry: vi.fn(async () => ({
    connected: false,
    status: 'offline',
    printerName: null,
    paperRemaining: null,
    ribbonPercent: null,
    initialMediaCount: null,
    lifetimePrints: null,
    error: 'Offline',
  })),
}))

vi.mock('./camera/cameraManager.js', () => ({
  cameraManager: {
    getState: vi.fn(() => ({
      provider: 'nikon-sdk',
      connected: false,
      working: false,
      model: null,
      liveView: false,
      batteryPct: null,
      error: null,
    })),
  },
}))

import { isVirtualPrinter, printJob } from './hardware.js'

describe('Hardware Printing & Virtual Printer Blocking', () => {
  it('correctly identifies virtual printers and blocks them', () => {
    // Virtual printer types found on Windows / guest PCs
    expect(isVirtualPrinter('Microsoft Print to PDF')).toBe(true)
    expect(isVirtualPrinter('OneNote (Desktop)')).toBe(true)
    expect(isVirtualPrinter('OneNote for Windows 10')).toBe(true)
    expect(isVirtualPrinter('Fax')).toBe(true)
    expect(isVirtualPrinter('Export to WPS PDF')).toBe(true)
    expect(isVirtualPrinter('Microsoft XPS Document Writer')).toBe(true)
    expect(isVirtualPrinter('Adobe PDF')).toBe(true)
    expect(isVirtualPrinter('CutePDF Writer')).toBe(true)
    expect(isVirtualPrinter('Default System Printer')).toBe(true)
    expect(isVirtualPrinter('')).toBe(true)
    expect(isVirtualPrinter(null as any)).toBe(true)
    expect(isVirtualPrinter(undefined as any)).toBe(true)

    // Real physical photo printers must NOT be blocked
    expect(isVirtualPrinter('DNP DS-RX1HS')).toBe(false)
    expect(isVirtualPrinter('DNP DS-RX1 (Copy 1)')).toBe(false)
    expect(isVirtualPrinter('Citizen CY-02')).toBe(false)
    expect(isVirtualPrinter('HiTi P525L Photo Printer')).toBe(false)
    expect(isVirtualPrinter('Canon SELPHY CP1300')).toBe(false)
    expect(isVirtualPrinter('Canon SELPHY CP1500 (Photo)')).toBe(false)
    expect(isVirtualPrinter('Dai Nippon Printing DS620')).toBe(false)
  })

  it('immediately blocks print jobs targeting virtual printers without executing powershell', async () => {
    const SAMPLE_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
    const res = await printJob({
      copies: 1,
      layoutId: 'strip',
      templateName: 'classic',
      bitmapDataUrl: SAMPLE_BASE64,
      printerName: 'Microsoft Print to PDF',
    })

    expect(res.success).toBe(false)
    expect(res.error).toContain('No physical photo printer connected')
    expect(res.jobId).toBeNull()
  })

  it('rejects empty bitmap print jobs safely', async () => {
    const res = await printJob({
      copies: 1,
      layoutId: 'strip',
      templateName: 'classic',
      bitmapDataUrl: '',
    })

    expect(res.success).toBe(false)
    expect(res.error).toContain('No print image was supplied')
  })
})

