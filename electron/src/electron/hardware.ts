import { screen } from 'electron'
import os from 'node:os'
import fs from 'node:fs/promises'
import path from 'node:path'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { getCounters, incrementCounter } from './store.js'

const execAsync = promisify(exec)

export interface CameraReport {
  connected: boolean
  working: boolean
  batteryPct: number | null
  model: string | null
  error: string | null
}

let cameraReport: CameraReport = {
  connected: false,
  working: false,
  batteryPct: null,
  model: null,
  error: 'Waiting for camera discovery',
}

export function updateCameraReport(report: CameraReport): void {
  cameraReport = { ...report }
}

export async function recordCapture(): Promise<number> {
  return incrementCounter('shutterCount')
}

export async function hardwareSnapshot() {
  const displays = screen.getAllDisplays()
  const primary = screen.getPrimaryDisplay()
  const counters = await getCounters()
  const kioskDisplay = displays.find((display) => display.id !== primary.id) ?? primary
  const isWindows = process.platform === 'win32'

  return {
    capturedAt: new Date().toISOString(),
    platform: process.platform,
    release: os.release(),
    camera: {
      ...cameraReport,
      provider: cameraReport.model ? 'media-device' : 'canon-sdk-pending',
      shutterCount: counters.shutterCount,
    },
    printer: {
      connected: true,
      working: true,
      provider: isWindows ? 'windows-driver-spooler' : 'dnp-sdk-simulator',
      model: isWindows ? 'Windows Photo Printer (DNP / Default)' : 'DNP adapter simulator',
      printsTotal: counters.printsTotal,
      queueDepth: 0,
      error: null,
    },
    kioskScreen: {
      connected: displays.length > 0,
      external: displays.length > 1 && kioskDisplay.id !== primary.id,
      displayCount: displays.length,
      width: kioskDisplay.size.width,
      height: kioskDisplay.size.height,
      scaleFactor: kioskDisplay.scaleFactor,
      error: null,
    },
  }
}

export interface PrintRequest {
  copies: number
  layoutId: string
  templateName: string
  bitmapDataUrl?: string
  printerName?: string
}

/**
 * Real silent printing on Windows using PowerShell and System.Drawing.
 * Sends the image directly to the installed Windows printer (DNP, Citizen, Canon SELPHY, etc.)
 */
async function printViaWindowsPowerShell(filePath: string, copies: number, printerName = ''): Promise<void> {
  const absolutePath = path.resolve(filePath).replace(/\\/g, '\\\\')
  const psScript = `
Add-Type -AssemblyName System.Drawing
$doc = New-Object System.Drawing.Printing.PrintDocument
if ("${printerName}") {
    $doc.PrinterSettings.PrinterName = "${printerName}"
}
$doc.add_PrintPage({
    param($sender, $e)
    $img = [System.Drawing.Image]::FromFile("${absolutePath}")
    $e.Graphics.DrawImage($img, $e.Graphics.VisibleClipBounds)
    $img.Dispose()
})
for ($i = 0; $i -lt ${copies}; $i++) {
    $doc.Print()
}
`
  const buffer = Buffer.from(psScript, 'utf16le')
  const base64Script = buffer.toString('base64')
  await execAsync(`powershell -NoProfile -NonInteractive -EncodedCommand ${base64Script}`)
}

export async function printJob(request: PrintRequest) {
  const copies = Math.max(1, Math.min(10, Math.round(request.copies)))
  const printsTotal = await incrementCounter('printsTotal', copies)

  if (request.bitmapDataUrl && process.platform === 'win32') {
    const tempFile = path.join(os.tmpdir(), `happypix-print-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`)
    try {
      const base64Data = request.bitmapDataUrl.includes(',')
        ? request.bitmapDataUrl.split(',')[1]
        : request.bitmapDataUrl
      await fs.writeFile(tempFile, Buffer.from(base64Data, 'base64'))

      console.log(`🖨️ [Hardware] Dispatching real print job (${copies} copies) to Windows spooler...`)
      await printViaWindowsPowerShell(tempFile, copies, request.printerName || '')
      console.log(`✅ [Hardware] Real print job dispatched successfully.`)

      return {
        success: true,
        jobId: `PRINT-${Date.now()}`,
        provider: 'windows-driver-spooler',
        copies,
        printsTotal,
      }
    } catch (err: any) {
      console.error('❌ [Hardware] Windows print failed:', err)
      return {
        success: false,
        error: err.message || 'Windows print spooler error',
        jobId: `ERR-${Date.now()}`,
        provider: 'windows-driver-spooler',
        copies,
        printsTotal,
      }
    } finally {
      await fs.unlink(tempFile).catch(() => {})
    }
  }

  // Fallback for dev / non-Windows environments
  return {
    success: true,
    jobId: `SIM-${Date.now()}`,
    provider: process.platform === 'win32' ? 'windows-driver-spooler' : 'dnp-sdk-simulator',
    copies,
    printsTotal,
    warning: request.bitmapDataUrl
      ? 'Non-Windows system or simulator mode.'
      : 'No bitmap supplied; print counter incremented.',
  }
}
