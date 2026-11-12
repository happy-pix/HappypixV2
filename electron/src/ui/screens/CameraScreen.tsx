import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { BoothTemplate, CapturedPhoto } from '../types'
import { ScreenShell } from '../components/ScreenShell'
import { Icon } from '../components/Icon'
import { bridge } from '../services/bridge'
import { sound } from '../services/sound'

function wait(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds))
}

/**
 * Crops a high-resolution captured JPEG data URL from its center by the given
 * zoom factor, maintaining maximum optical detail on modern 24MP+ camera sensors.
 */
async function cropImageToZoom(dataUrl: string, zoom: number): Promise<string> {
  if (zoom <= 1.0) return dataUrl
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const sw = img.naturalWidth / zoom
      const sh = img.naturalHeight / zoom
      const sx = (img.naturalWidth - sw) / 2
      const sy = (img.naturalHeight - sh) / 2
      canvas.width = Math.round(sw)
      canvas.height = Math.round(sh)
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.95))
      } else {
        resolve(dataUrl)
      }
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

// ── Camera provider detection ────────────────────────────────────────────────

type CameraMode = 'nikon' | 'canon-ccapi' | 'webcam' | 'disconnected'

interface CameraInfo {
  mode:    CameraMode
  label:   string
  battery: number | null
}

export function CameraScreen({ template, onComplete }: {
  template: BoothTemplate
  onComplete: (photos: CapturedPhoto[]) => void
}) {
  const videoRef        = useRef<HTMLVideoElement>(null)
  const canvasRef       = useRef<HTMLCanvasElement>(null)
  const streamRef       = useRef<MediaStream | null>(null)
  const photosRef       = useRef<CapturedPhoto[]>([])
  const lvUnsubRef      = useRef<(() => void) | null>(null)
  const nikonLvImgRef   = useRef<string | null>(null)   // latest Nikon LV frame

  const [cameraInfo, setCameraInfo]     = useState<CameraInfo>({ mode: 'disconnected', label: 'Detecting camera…', battery: null })
  const [cameraReady, setCameraReady]   = useState(false)
  const [hasLiveStream, setHasLiveStream] = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [running, setRunning]           = useState(false)
  const [countdown, setCountdown]       = useState<number | null>(null)
  const [photos, setPhotos]             = useState<CapturedPhoto[]>([])
  const totalShots = Math.max(3, Math.min(10, template.layout.slots * 2))

  // ── Digital Zoom & Focus controls ─────────────────────────────────────────
  const [zoom, setZoom]                 = useState<number>(1.0)
  const zoomRef                         = useRef<number>(1.0)
  zoomRef.current = zoom

  const [focusPoint, setFocusPoint]     = useState<{ x: number; y: number } | null>(null)
  const [focusStatus, setFocusStatus]   = useState<'focusing' | 'locked' | null>(null)
  const focusTimerRef                   = useRef<number | null>(null)

  // Paint Nikon LV JPEG onto overlay canvas with active digital zoom center-crop
  const drawNikonFrame = useCallback((frameDataUrl: string) => {
    nikonLvImgRef.current = frameDataUrl
    const canvas = canvasRef.current
    if (!canvas) return
    const img = new Image()
    img.onload = () => {
      canvas.width  = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const z = zoomRef.current
      if (z <= 1.0) {
        ctx.drawImage(img, 0, 0)
      } else {
        const sw = img.naturalWidth / z
        const sh = img.naturalHeight / z
        const sx = (img.naturalWidth - sw) / 2
        const sy = (img.naturalHeight - sh) / 2
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
      }
    }
    img.src = frameDataUrl
  }, [])

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom)
    zoomRef.current = newZoom
    if (nikonLvImgRef.current) {
      drawNikonFrame(nikonLvImgRef.current)
    }
  }

  const handleViewfinderClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (running) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setFocusPoint({ x, y })
    setFocusStatus('focusing')

    if (focusTimerRef.current) {
      window.clearTimeout(focusTimerRef.current)
    }

    // Trigger hardware autofocus if Nikon
    if (cameraInfo.mode === 'nikon' && window.booth?.nikon?.autoFocus) {
      void window.booth.nikon.autoFocus().catch(() => {})
    }

    // Visual lock confirmation after 450ms
    focusTimerRef.current = window.setTimeout(() => {
      setFocusStatus('locked')
      focusTimerRef.current = window.setTimeout(() => {
        setFocusPoint(null)
        setFocusStatus(null)
      }, 750)
    }, 450)
  }, [running, cameraInfo.mode])

  // ── Camera initialization ────────────────────────────────────────────────

  useEffect(() => {
    let active = true

    async function connect() {
      // ── 1. Try Nikon SDK ────────────────────────────────────────────────
      if (window.booth?.nikon) {
        const st = await window.booth.nikon.getStatus().catch(() => null)

        if (st?.connected && st.provider === 'nikon-sdk') {
          // Camera already connected (hot-start)
          if (!active) return
          const info: CameraInfo = {
            mode:    'nikon',
            label:   st.model ? `${st.model} (Nikon SDK)` : 'Nikon Camera (SDK)',
            battery: st.batteryPct,
          }
          setCameraInfo(info)
          setHasLiveStream(false)
          setCameraReady(true)
          setError(null)
          await bridge.reportCamera({ connected: true, working: true, provider: 'nikon-sdk', livePreview: false, batteryPct: st.batteryPct, model: st.model, error: null })

          let previewReported = false
          lvUnsubRef.current = window.booth.nikon.onLiveViewFrame(({ frameDataUrl }) => {
            drawNikonFrame(frameDataUrl)
            setHasLiveStream(true)
            if (!previewReported) {
              previewReported = true
              void bridge.reportCamera({ connected: true, working: true, provider: 'nikon-sdk', livePreview: true, batteryPct: st.batteryPct, model: st.model, error: null })
            }
          })
          const liveView = await window.booth.nikon.startLiveView().catch((reason) => ({ ok: false, error: reason instanceof Error ? reason.message : String(reason) }))
          if (!liveView?.ok) setError(liveView?.error || 'Nikon connected, but Live View could not start.')
          return
        }

        // Not connected yet — try connecting
        const connectResult = await window.booth.nikon.connect().catch(() => null)
        if (connectResult?.ok && connectResult.connected && active) {
          const newSt = await window.booth.nikon.getStatus().catch(() => null)
          const info: CameraInfo = {
            mode:    'nikon',
            label:   connectResult.name ? `${connectResult.name} (Nikon SDK)` : 'Nikon Camera (SDK)',
            battery: newSt?.batteryPct ?? null,
          }
          setCameraInfo(info)
          setHasLiveStream(false)
          setCameraReady(true)
          setError(null)
          await bridge.reportCamera({ connected: true, working: true, provider: 'nikon-sdk', livePreview: false, batteryPct: info.battery, model: info.label, error: null })

          let previewReported = false
          lvUnsubRef.current = window.booth.nikon.onLiveViewFrame(({ frameDataUrl }) => {
            drawNikonFrame(frameDataUrl)
            setHasLiveStream(true)
            if (!previewReported) {
              previewReported = true
              void bridge.reportCamera({ connected: true, working: true, provider: 'nikon-sdk', livePreview: true, batteryPct: info.battery, model: info.label, error: null })
            }
          })
          const liveView = await window.booth.nikon.startLiveView().catch((reason) => ({ ok: false, error: reason instanceof Error ? reason.message : String(reason) }))
          if (!liveView?.ok) setError(liveView?.error || 'Nikon connected, but Live View could not start.')
          return
        }
      }

      // ── 2. Try Canon CCAPI (Wi-Fi) ──────────────────────────────────────
      const ccapi = await bridge.canonProbe().catch(() => null)
      if (ccapi?.connected && active) {
        const info: CameraInfo = {
          mode:    'canon-ccapi',
          label:   `${ccapi.model || 'Canon EOS'} (Wi-Fi CCAPI)`,
          battery: ccapi.batteryPct,
        }
        setCameraInfo(info)
      }

      // ── 3. Try webcam / UVC ─────────────────────────────────────────────
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('Media camera API not available.')
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        })
        if (!active) { stream.getTracks().forEach((t) => t.stop()); return }

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        const trackLabel = stream.getVideoTracks()[0]?.label || 'Connected camera'
        const isCcapi = ccapi?.connected
        const label = isCcapi ? `${ccapi!.model || 'Canon EOS'} (Wi-Fi CCAPI)` : trackLabel
        const info: CameraInfo = {
          mode:    isCcapi ? 'canon-ccapi' : 'webcam',
          label,
          battery: ccapi?.batteryPct ?? null,
        }
        setCameraInfo(info)
        setHasLiveStream(true)
        setCameraReady(true)
        setError(null)
        await bridge.reportCamera({ connected: true, working: true, provider: isCcapi ? 'canon-ccapi-wifi' : 'webcam', livePreview: true, batteryPct: info.battery, model: label, error: null })
      } catch (reason) {
        if (ccapi?.connected && active) {
          // CCAPI is connected even without webcam
          setCameraReady(true)
          setError(null)
          await bridge.reportCamera({ connected: true, working: true, provider: 'canon-ccapi-wifi', livePreview: false, batteryPct: ccapi.batteryPct, model: ccapi.model, error: null })
        } else {
          const message = reason instanceof Error ? reason.message : 'Camera could not be opened.'
          setError(message)
          setCameraInfo({ mode: 'disconnected', label: 'Camera Disconnected', battery: null })
          setCameraReady(false)
          await bridge.reportCamera({ connected: false, working: false, batteryPct: null, model: null, error: message })
        }
      }
    }

    void connect()

    return () => {
      active = false
      if (focusTimerRef.current) {
        window.clearTimeout(focusTimerRef.current)
      }
      // Cleanup webcam stream
      streamRef.current?.getTracks().forEach((t) => t.stop())
      // Cleanup Nikon LV subscription
      lvUnsubRef.current?.()
      lvUnsubRef.current = null
      if (window.booth?.nikon) {
        void window.booth.nikon.stopLiveView().catch(() => {})
      }
      void bridge.reportCamera({ connected: false, working: false, provider: 'none', livePreview: false, batteryPct: null, model: null, error: 'Camera preview closed' })
    }
  }, [drawNikonFrame])

  // ── Capture logic ────────────────────────────────────────────────────────

  const captureFrame = useCallback(async (index: number): Promise<CapturedPhoto> => {
    const id = `photo-${Date.now()}-${index}`

    // ── Nikon SDK capture ──────────────────────────────────────────────────
    if (cameraInfo.mode === 'nikon') {
      if (!window.booth?.nikon) {
        throw new Error('Nikon camera bridge is not available.')
      }
      const result = await window.booth.nikon.capture()
      if (result.success && result.dataUrl) {
        const finalDataUrl = zoomRef.current > 1.0
          ? await cropImageToZoom(result.dataUrl, zoomRef.current)
          : result.dataUrl
        return { id, dataUrl: finalDataUrl, capturedAt: new Date().toISOString() }
      }
      throw new Error('Nikon camera capture failed. Please verify camera USB connection and memory card.')
    }

    // ── Canon CCAPI shutter ────────────────────────────────────────────────
    if (cameraInfo.mode === 'canon-ccapi') {
      await bridge.canonCapture().catch(() => ({ success: false, error: 'Capture failed' }))
    }

    // ── Webcam canvas capture ──────────────────────────────────────────────
    const video = videoRef.current
    let dataUrl = ''

    if (video && video.videoWidth > 0 && video.videoHeight > 0) {
      const canvas = document.createElement('canvas')
      canvas.width  = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d')?.drawImage(video, 0, 0)
      dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    }

    if (!dataUrl) throw new Error('Camera capture returned no image. Please verify camera connection.')
    const finalDataUrl = zoomRef.current > 1.0
      ? await cropImageToZoom(dataUrl, zoomRef.current)
      : dataUrl
    return { id, dataUrl: finalDataUrl, capturedAt: new Date().toISOString() }
  }, [cameraInfo.mode])

  const startCapture = async () => {
    if (running || !cameraReady) return
    setRunning(true)
    setPhotos([])
    photosRef.current = []

    for (let shot = 0; shot < totalShots; shot += 1) {
      for (let value = 3; value >= 1; value -= 1) {
        setCountdown(value)
        sound.countdown()
        // Pre-focus camera at countdown 1 for sharp focus
        if (value === 1 && cameraInfo.mode === 'nikon' && window.booth?.nikon?.autoFocus) {
          void window.booth.nikon.autoFocus().catch(() => {})
        }
        await wait(700)
      }
      setCountdown(0)
      sound.shutter()

      try {
        const photo = await captureFrame(shot)
        photosRef.current = [...photosRef.current, photo]
        setPhotos([...photosRef.current])
        void bridge.recordCapture()
        await wait(450)
        setCountdown(null)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Camera capture failed'
        setError(msg)
        setRunning(false)
        setCountdown(null)
        return
      }
    }

    await wait(850)
    onComplete(photosRef.current)
  }

  // ── UI helpers ────────────────────────────────────────────────────────────

  const currentShot = Math.min(photos.length + 1, totalShots)
  const filmItems = useMemo(() => Array.from({ length: totalShots }, (_, i) => photos[i] ?? null), [photos, totalShots])

  const providerBadge =
    cameraInfo.mode === 'nikon'       ? (cameraInfo.battery !== null ? `DSLR / Mirrorless · 🔋 ${cameraInfo.battery}%` : 'DSLR / Mirrorless · USB') :
    cameraInfo.mode === 'canon-ccapi' ? (cameraInfo.battery !== null ? `Canon EOS · 🔋 ${cameraInfo.battery}%` : 'Canon EOS · Wi-Fi') :
    cameraInfo.mode === 'webcam'      ? 'Webcam / UVC · ready' :
    'Camera Offline'

  return (
    <ScreenShell screen="camera" className="camera-screen">
      <div className="camera-hud">
        <div>
          <span className={`hardware-dot ${error ? 'warning' : ''}`}/>
          <span>
            <b>{cameraInfo.label}</b>
            <small>{error ? error : providerBadge}</small>
          </span>
        </div>
        <div className="capture-progress">
          <span>CAPTURE</span>
          <strong>{photos.length} / {totalShots}</strong>
          <i><b style={{ width: `${photos.length / totalShots * 100}%` }}/></i>
        </div>
      </div>

      <div className="camera-workspace">
        <aside className="film-reel">
          <div className="film-label">YOUR SHOTS</div>
          <div className="film-track">
            {filmItems.map((photo, index) => (
              <div key={index} className={`film-cell ${index === photos.length && running ? 'is-current' : ''}`}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                {photo
                  ? <img src={photo.dataUrl} alt={`Capture ${index + 1}`}/>
                  : <div><Icon name="camera" size={20}/></div>}
              </div>
            ))}
          </div>
        </aside>

        <section className="viewfinder">
          <div className="viewfinder-rebate top">
            <span>KODAK PORTRA 400</span>
            <span>HAPPYPIX LIVE</span>
            <span>{cameraInfo.battery !== null ? `🔋 ${cameraInfo.battery}%` : ''}</span>
          </div>
          <div
            className="video-wrap"
            onClick={handleViewfinderClick}
            style={{ cursor: running ? 'default' : 'crosshair' }}
          >
            {/* Webcam stream */}
            <video
              ref={videoRef}
              muted
              playsInline
              style={{
                transform: zoom > 1 ? `scaleX(-1) scale(${zoom})` : 'scaleX(-1)',
                transition: 'transform 0.2s ease-out',
              }}
            />
            {/* Nikon Live View overlay canvas — sits on top of <video> */}
            {cameraInfo.mode === 'nikon' && (
              <canvas
                ref={canvasRef}
                style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  objectFit: 'cover', display: hasLiveStream ? 'block' : 'none',
                }}
              />
            )}

            {!hasLiveStream && (
              <div className="camera-fallback">
                <Icon name="camera" size={52}/>
                <span>
                  {cameraInfo.mode === 'nikon'
                    ? 'Connecting camera stream…'
                    : 'Camera Offline'}
                </span>
                <small>Please verify camera power and USB cable</small>
              </div>
            )}

            <i className="focus-corner corner-tl"/>
            <i className="focus-corner corner-tr"/>
            <i className="focus-corner corner-bl"/>
            <i className="focus-corner corner-br"/>

            {/* Interactive Tap-to-Focus reticle */}
            {focusPoint && (
              <div
                className={`tap-focus-reticle ${focusStatus || ''}`}
                style={{ left: `${focusPoint.x}px`, top: `${focusPoint.y}px` }}
              />
            )}

            {/* Smart Digital Zoom Controls */}
            {hasLiveStream && !running && (
              <div className="zoom-controls" onClick={(e) => e.stopPropagation()}>
                {[1.0, 1.2, 1.5, 2.0].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    className={`zoom-btn ${zoom === lvl ? 'active' : ''}`}
                    onClick={() => handleZoomChange(lvl)}
                  >
                    {lvl === 1.0 ? '1.0x' : `${lvl.toFixed(1)}x`}
                  </button>
                ))}
              </div>
            )}

            {countdown !== null && (
              <div className={`countdown-flash ${countdown === 0 ? 'is-flash' : ''}`}>
                {countdown > 0 ? countdown : ''}
              </div>
            )}

            {!running && (
              <button
                className="shutter-button"
                onClick={(e) => {
                  e.stopPropagation()
                  void startCapture()
                }}
                disabled={!cameraReady}
              >
                <span><Icon name="camera" size={27}/></span>
                <b>Start shooting</b>
                <small>{totalShots} photos · includes extra choices</small>
              </button>
            )}
          </div>

          <div className="viewfinder-rebate bottom">
            <span>EXP {currentShot}/{totalShots}</span>
            <span>LOOK HERE &amp; SMILE</span>
            <span>SAFETY FILM</span>
          </div>
        </section>
      </div>
    </ScreenShell>
  )
}
