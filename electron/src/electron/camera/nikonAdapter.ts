// ─────────────────────────────────────────────────────────────────────────────
//  NikonAdapter.ts
//  TypeScript adapter for the Nikon Remote SDK v2.x.
//  Spawns NikonBridge.ps1 as a child process, communicates via stdin/stdout
//  JSON protocol (line-delimited).  Electron main process only — never renderer.
// ─────────────────────────────────────────────────────────────────────────────

import { spawn, type ChildProcess } from 'node:child_process'
import { EventEmitter } from 'node:events'
import path from 'node:path'
import fs from 'node:fs'
import { app } from 'electron'

// ── Public types ──────────────────────────────────────────────────────────────

export interface NikonDeviceInfo {
  id: number
  name: string
  available: boolean
  version: string
}

export interface NikonStatus {
  sdkInitialized: boolean
  connected: boolean
  model: string
  liveView: boolean
  batteryPct: number | null
}

export interface NikonCaptureResult {
  captured: boolean
  path: string | null
  /** dataUrl is populated after readImage() is called on the path */
  dataUrl?: string
  shutterCount?: number
}

export type NikonAdapterEvent =
  | 'ready'           // bridge process started & SDK handshake received
  | 'camera_added'    // a Nikon camera was plugged in
  | 'camera_removed'  // a Nikon camera was unplugged
  | 'error'           // unrecoverable error from bridge
  | 'disconnected'    // bridge process exited

// ── Capability IDs (MAID3-COMMON spec) ───────────────────────────────────────

export const NikonCapability = {
  BatteryLevel: 0x0018,
  ExposureMode: 0x0009,
  ShutterSpeed: 0x000a,
  Aperture:     0x000b,
  ISO:          0x0010,
} as const

// ── NKERROR result codes ──────────────────────────────────────────────────────

export const NKERROR_NO_ERROR = 0

// ── Internal pending-request tracking ────────────────────────────────────────

interface Pending {
  resolve: (data: unknown) => void
  reject:  (err: Error) => void
  timer:   ReturnType<typeof setTimeout>
}

// ── NikonAdapter ──────────────────────────────────────────────────────────────

export class NikonAdapter extends EventEmitter {
  private proc: ChildProcess | null = null
  private pending = new Map<number, Pending>()
  private nextId = 1
  private _ready = false
  private _destroyed = false
  private lineBuffer = ''
  /** Poll interval handle for device-list watching (when no camera connected) */
  private watchTimer: ReturnType<typeof setInterval> | null = null

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  /** Start the bridge process. Resolves when the bridge signals ready. */
  async start(): Promise<void> {
    if (this._ready) return
    const { scriptPath, isUniversal } = this._resolveScript()

    const sysRoot = process.env.SystemRoot || 'C:\\Windows'
    const ps32 = path.join(sysRoot, 'SysWOW64', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
    const powershellBin = isUniversal && process.arch === 'x64' && fs.existsSync(ps32)
      ? ps32
      : 'powershell.exe'

    this.proc = spawn(powershellBin, [
      '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
      '-File', scriptPath,
    ], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: path.dirname(scriptPath),
      windowsHide: true,
    })

    this.proc.stdout!.setEncoding('utf8')
    this.proc.stdout!.on('data', (chunk: string) => this._onData(chunk))

    this.proc.stderr!.setEncoding('utf8')
    this.proc.stderr!.on('data', (data: string) => {
      const trimmed = data.trim()
      if (trimmed) console.error('[NikonAdapter] stderr:', trimmed)
    })

    this.proc.on('exit', (code) => {
      console.warn(`[NikonAdapter] Bridge exited with code ${code}`)
      this._ready = false
      this._rejectAll(new Error(`Nikon bridge exited (code ${code})`))
      this._stopWatch()
      if (!this._destroyed) this.emit('disconnected', code)
    })

    // Wait for the ready handshake (id=0)
    await new Promise<void>((resolve, reject) => {
      const tid = setTimeout(() => reject(new Error('NikonBridge start timeout (10s)')), 10_000)
      this.once('ready', () => { clearTimeout(tid); resolve() })
      this.once('error', (e: Error) => { clearTimeout(tid); reject(e) })
    })

    // Initialize SDK
    await this._send('init')
    this._startWatch()
  }

  /** Cleanly shut down the bridge. */
  async stop(): Promise<void> {
    this._destroyed = true
    this._stopWatch()
    if (this.proc && !this.proc.killed) {
      try { await this._send('shutdown') } catch { /* best-effort */ }
      this.proc.stdin?.end()
      this.proc.kill()
      this.proc = null
    }
    this._rejectAll(new Error('NikonAdapter stopped'))
    this._ready = false
  }

  get isReady(): boolean { return this._ready }

  // ── Camera operations ─────────────────────────────────────────────────────

  /** List currently detected Nikon cameras. */
  async listDevices(): Promise<NikonDeviceInfo[]> {
    const r = await this._send<{ devices: NikonDeviceInfo[] }>('devices')
    return r.devices ?? []
  }

  /** Connect to the first available Nikon camera. */
  async connect(): Promise<{ connected: boolean; name: string; id: number }> {
    return this._send('connect')
  }

  /** Disconnect from camera. */
  async disconnect(): Promise<void> {
    await this._send('disconnect')
  }

  /** Get current SDK + camera status. */
  async getStatus(): Promise<NikonStatus> {
    return this._send('status')
  }

  // ── Live View ─────────────────────────────────────────────────────────────

  async startLiveView(): Promise<void> {
    await this._send('liveview_start')
  }

  async stopLiveView(): Promise<void> {
    await this._send('liveview_stop')
  }

  /**
   * Fetch the latest Live View JPEG frame.
   * Returns base64-encoded JPEG data or null if no frame ready yet.
   */
  async getLiveViewFrame(): Promise<string | null> {
    const r = await this._send<{ frame: string | null; count: number }>('liveview_frame')
    return r.frame ?? null
  }

  // ── Capture ───────────────────────────────────────────────────────────────

  /**
   * Trigger shutter and wait for image to be saved to disk.
   * Returns the captured image as a data URL (JPEG).
   */
  async capture(): Promise<NikonCaptureResult> {
    const r = await this._send<{ captured: boolean; path: string; status: number; shutterCount?: number }>('capture')
    if (!r.captured || !r.path) {
      return { captured: false, path: null }
    }
    try {
      const img = await this._send<{ dataUrl: string; size: number; ext: string; shutterCount?: number }>(
        'read_image', { path: r.path },
      )
      const count = img.shutterCount || r.shutterCount
      return { captured: true, path: r.path, dataUrl: img.dataUrl, shutterCount: count }
    } catch {
      return { captured: true, path: r.path, shutterCount: r.shutterCount }
    }
  }

  // ── Settings ──────────────────────────────────────────────────────────────

  async getCapability(capId: number): Promise<{ capId: number; value: number; dataType: number }> {
    return this._send('get_cap', { capId })
  }

  async setCapability(capId: number, value: number): Promise<void> {
    await this._send('set_cap', { capId, value })
  }

  async getBatteryPercent(): Promise<number | null> {
    try {
      const st = await this.getStatus()
      return st.batteryPct
    } catch {
      return null
    }
  }

  /** Trigger autofocus on the connected camera. */
  async autoFocus(): Promise<{ focused: boolean }> {
    return this._send('autofocus')
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private _resolveScript(): { scriptPath: string; isUniversal: boolean } {
    // 1. Universal Camera Engine (supports all Nikon D-series D3xxx/D5xxx/D7xxx/D8xx + Canon)
    const universalBase = app.isPackaged
      ? path.join(process.resourcesPath, 'resources', 'camera-engine')
      : path.resolve(process.cwd(), 'resources', 'camera-engine')
    const universalScript = path.join(universalBase, 'UniversalCameraBridge.ps1')

    if (fs.existsSync(universalScript)) {
      return { scriptPath: universalScript, isUniversal: true }
    }

    // 2. Fallback to Nikon Remote SDK
    const base = app.isPackaged
      ? path.join(process.resourcesPath, 'resources', 'nikon')
      : path.resolve(process.cwd(), 'resources', 'nikon')
    return { scriptPath: path.join(base, 'NikonBridge.ps1'), isUniversal: false }
  }

  private _send<T = Record<string, unknown>>(cmd: string, extra?: Record<string, unknown>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.proc || this.proc.killed) {
        reject(new Error('NikonBridge not running'))
        return
      }
      const id = this.nextId++
      const msg = JSON.stringify({ id, cmd, ...extra }) + '\n'
      const timer = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`NikonAdapter command "${cmd}" timed out (${id})`))
      }, cmd === 'init' ? 15_000 : cmd === 'capture' ? 12_000 : 5_000)

      this.pending.set(id, {
        resolve: (data) => resolve(data as T),
        reject,
        timer,
      })

      this.proc!.stdin!.write(msg, 'utf8')
    })
  }

  private _onData(chunk: string): void {
    this.lineBuffer += chunk
    const lines = this.lineBuffer.split('\n')
    this.lineBuffer = lines.pop() ?? ''
    for (const raw of lines) {
      const line = raw.trim()
      if (!line) continue
      this._handleLine(line)
    }
  }

  private _handleLine(line: string): void {
    let msg: { id: number; ok: boolean; data?: unknown; error?: string }
    try {
      msg = JSON.parse(line) as typeof msg
    } catch {
      console.warn('[NikonAdapter] Non-JSON from bridge:', line.slice(0, 120))
      return
    }

    // id=0: ready handshake
    if (msg.id === 0) {
      if (msg.ok) {
        this._ready = true
        this.emit('ready')
      } else {
        this.emit('error', new Error(msg.error ?? 'Bridge init error'))
      }
      return
    }

    const p = this.pending.get(msg.id)
    if (!p) return
    clearTimeout(p.timer)
    this.pending.delete(msg.id)

    if (msg.ok) {
      p.resolve(msg.data ?? {})
    } else {
      p.reject(new Error(msg.error ?? `NikonBridge error (id=${msg.id})`))
    }
  }

  private _rejectAll(err: Error): void {
    for (const [, p] of this.pending) {
      clearTimeout(p.timer)
      p.reject(err)
    }
    this.pending.clear()
  }

  /** Poll for device list when no camera is connected, emit events on changes. */
  private _knownDeviceIds = new Set<number>()

  private _startWatch(): void {
    if (this.watchTimer) return
    this.watchTimer = setInterval(() => void this._pollDevices(), 3_000)
  }

  private _stopWatch(): void {
    if (this.watchTimer) {
      clearInterval(this.watchTimer)
      this.watchTimer = null
    }
  }

  private async _pollDevices(): Promise<void> {
    if (!this._ready || this._destroyed) return
    try {
      const devices = await this.listDevices()
      const currentIds = new Set(devices.filter((d) => d.available).map((d) => d.id))

      for (const id of currentIds) {
        if (!this._knownDeviceIds.has(id)) {
          const dev = devices.find((d) => d.id === id)
          console.log(`[NikonAdapter] Camera added: ${dev?.name} (id=${id})`)
          this.emit('camera_added', dev)
        }
      }
      for (const id of this._knownDeviceIds) {
        if (!currentIds.has(id)) {
          console.log(`[NikonAdapter] Camera removed (id=${id})`)
          this.emit('camera_removed', id)
        }
      }
      this._knownDeviceIds = currentIds
    } catch {
      /* Ignore transient errors during polling */
    }
  }
}

// Singleton instance
export const nikonAdapter = new NikonAdapter()

