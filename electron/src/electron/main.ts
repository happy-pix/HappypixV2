import { app, BrowserWindow, ipcMain, screen, session, shell } from 'electron'
import { spawn } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'

// On Windows 11, Chromium renderer sandbox hits STATUS_BREAKPOINT (0x80000003)
// without --no-sandbox due to restricted token creation restrictions.
// Ensure the application always runs with --no-sandbox transparently.
if (process.platform === 'win32' && !process.argv.includes('--no-sandbox')) {
  const child = spawn(process.execPath, [...process.argv.slice(1), '--no-sandbox'], {
    detached: true,
    stdio: 'ignore',
  })
  child.unref()
  app.exit(0)
}
import { clearDeviceIdentity, clearInstallation, getDeviceUuid, getInstallation, saveInstallation, type StoredInstallation } from './store.js'
import { hardwareSnapshot, printJob, recordCapture, updateCameraReport, type CameraReport, type PrintRequest } from './hardware.js'
import { canonCcapi } from './canonCcapi.js'
import { getPreloadPath } from './pathResolver.js'
import { isDev } from './util.js'
import { startPrintServer, stopPrintServer } from './printServer.js'
import {
  enqueueSession,
  getQueueStatus,
  getSessionStatus,
  markSessionUploaded,
  processQueueTick,
  startQueueWorker,
  stopQueueWorker,
  type EnqueueSessionPayload,
} from './uploadQueue.js'
import { cameraManager } from './camera/cameraManager.js'
import { liveViewService } from './camera/liveViewService.js'
import { registerCameraIpc } from './camera/cameraIpc.js'
import { autoUpdater } from 'electron-updater'

// Prevent Chromium GPU cache Access Denied (0x5) & STATUS_BREAKPOINT crashes on Windows 11
app.commandLine.appendSwitch('no-sandbox')
app.commandLine.appendSwitch('disable-gpu-process-crash-limit')
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache')

function getLogPath(): string {
  try {
    return path.join(app.getPath('userData'), 'booth-runtime.log')
  } catch {
    return path.join(process.cwd(), 'booth-runtime.log')
  }
}

export function logRuntime(...args: unknown[]): void {
  const line = `[${new Date().toISOString()}] ${args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')}\n`
  try {
    fs.appendFileSync(getLogPath(), line)
  } catch {}
  console.log(...args)
}

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  const primaryDisplay = screen.getPrimaryDisplay()
  const displays = screen.getAllDisplays()
  const targetDisplay = displays.find((display) => display.id !== primaryDisplay.id) ?? primaryDisplay
  const bounds = targetDisplay.workArea
  logRuntime('[main] createWindow displays count:', displays.length, 'bounds:', bounds)

  mainWindow = new BrowserWindow({
    title: 'HappyPix Booth',
    x: bounds.x,
    y: bounds.y,
    width: isDev() ? Math.min(1280, bounds.width) : bounds.width,
    height: isDev() ? Math.min(800, bounds.height) : bounds.height,
    minWidth: 720,
    minHeight: 720,
    backgroundColor: '#0b0714',
    autoHideMenuBar: true,
    kiosk: !isDev(),
    fullscreen: !isDev(),
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      devTools: isDev(),
    },
  })

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    logRuntime('[main] Render process gone:', details)
  })

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    logRuntime('[main] Failed to load:', errorCode, errorDescription, validatedURL)
  })

  mainWindow.webContents.on('dom-ready', () => {
    logRuntime('[main] Window dom-ready')
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) void shell.openExternal(url)
    return { action: 'deny' }
  })
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const allowed = isDev() ? url.startsWith('http://localhost:8888') : url.startsWith('file://')
    if (!allowed) event.preventDefault()
  })

  if (isDev()) {
    logRuntime('[main] Loading dev URL: http://localhost:8888')
    void mainWindow.loadURL('http://localhost:8888')
  } else {
    const targetFile = path.join(app.getAppPath(), 'dist-react', 'index.html')
    logRuntime('[main] Loading production file:', targetFile)
    void mainWindow.loadFile(targetFile)
  }
}

function registerIpc(): void {
  // ── Existing booth IPC (unchanged) ──────────────────────────────────────
  ipcMain.handle('booth:get-installation', () => getInstallation())
  ipcMain.handle('booth:save-installation', (_event, value: StoredInstallation) => saveInstallation(value))
  ipcMain.handle('booth:clear-installation', () => clearInstallation())
  ipcMain.handle('booth:get-device-uuid', () => getDeviceUuid())
  ipcMain.handle('booth:clear-device-identity', () => clearDeviceIdentity())
  ipcMain.handle('booth:system-snapshot', () => hardwareSnapshot())
  ipcMain.handle('booth:camera-report', (_event, value: CameraReport) => updateCameraReport(value))
  ipcMain.handle('booth:record-capture', () => recordCapture())
  ipcMain.handle('booth:print', (_event, value: PrintRequest) => printJob(value))
  ipcMain.handle('booth:enqueue-session', (_event, value: EnqueueSessionPayload) => enqueueSession(value))
  ipcMain.handle('booth:get-queue-status', () => getQueueStatus())
  ipcMain.handle('booth:get-session-status', (_event, sessionId: string) => getSessionStatus(sessionId))
  ipcMain.handle('booth:mark-session-uploaded', (_event, sessionId: string, details?: any) => markSessionUploaded(sessionId, details))
  ipcMain.handle('booth:trigger-queue-tick', () => processQueueTick())
  ipcMain.handle('booth:set-kiosk', (_event, enabled: boolean) => {
    if (!mainWindow) return false
    mainWindow.setKiosk(enabled)
    mainWindow.setFullScreen(enabled)
    return mainWindow.isKiosk()
  })
  ipcMain.handle('booth:canon-probe', (_event, ip?: string) => {
    if (ip) canonCcapi.setIp(ip)
    return canonCcapi.probe()
  })
  ipcMain.handle('booth:canon-capture', () => canonCcapi.triggerShutter())
  ipcMain.handle('booth:app-info', () => ({
    version: app.getVersion(),
    platform: process.platform,
    packaged: app.isPackaged,
  }))
  ipcMain.handle('booth:check-for-updates', async () => {
    if (!isDev() && app.isPackaged) {
      try {
        const result = await autoUpdater.checkForUpdates()
        return { success: true, updateInfo: result?.updateInfo || null }
      } catch (err: any) {
        return { success: false, error: err?.message || String(err) }
      }
    }
    return { success: true, status: 'dev-mode-skipped' }
  })

  // ── Nikon SDK IPC (new) ─────────────────────────────────────────────────
  registerCameraIpc()
}

app.whenReady().then(() => {
  logRuntime('[main] app.whenReady started, version:', app.getVersion(), 'packaged:', app.isPackaged)
  registerIpc()
  startPrintServer()
  startQueueWorker()
  session.defaultSession.setPermissionCheckHandler((_webContents, permission) => permission === 'media')
  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    callback(permission === 'media')
  })
  createWindow()

  // Auto-updater check (Issue #12)
  if (!isDev() && app.isPackaged) {
    try {
      autoUpdater.logger = {
        info: (...args: unknown[]) => logRuntime('[autoUpdater:info]', ...args),
        warn: (...args: unknown[]) => logRuntime('[autoUpdater:warn]', ...args),
        error: (...args: unknown[]) => logRuntime('[autoUpdater:error]', ...args),
        debug: (...args: unknown[]) => logRuntime('[autoUpdater:debug]', ...args),
      }
      autoUpdater.checkForUpdatesAndNotify().catch((err: unknown) => {
        logRuntime('[autoUpdater] Check error:', err)
      })
    } catch (err: unknown) {
      logRuntime('[autoUpdater] Initialization error:', err)
    }
  } else {
    logRuntime('[autoUpdater] Skipped auto-update check in dev / unpackaged mode')
  }

  // Initialize Nikon SDK after window is created (non-blocking)
  void cameraManager.initialize().catch((err: unknown) => {
    logRuntime('[main] CameraManager init error:', err)
  })
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('window-all-closed', () => {
  logRuntime('[main] window-all-closed triggered, quitting app')
  stopPrintServer()
  stopQueueWorker()
  void liveViewService.shutdown()
  void cameraManager.shutdown()
  if (process.platform !== 'darwin') app.quit()
})

process.on('uncaughtException', (err: any) => {
  logRuntime('[main] Uncaught Exception:', err?.stack || err)
})

process.on('unhandledRejection', (reason: any) => {
  logRuntime('[main] Unhandled Rejection:', reason?.stack || reason)
})

