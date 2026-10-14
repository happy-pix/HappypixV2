// ─────────────────────────────────────────────────────────────────
//  DNPProvider — STUB
//
//  STATUS: Awaiting DNP developer SDK license.
//  DNP SDK supports: DS620A, RX1HS, QW410
//  Wireless printing ecosystem targets iOS/Android tablet photo booths.
//
//  When SDK arrives:
//    1. Add DNP SDK native module (Android: Kotlin, iOS: Swift)
//    2. Replace stub implementations below with real SDK calls
//    3. No PrinterManager or UI changes required
//
//  DNP Dev program: https://dnpphoto.com/en/Products/Software/
// ─────────────────────────────────────────────────────────────────

import type {
  PrinterProvider,
  PrinterDevice,
  PrintJob,
  PrintResult,
  PrinterStatus,
} from '@happypix/types';

export class DNPProvider implements PrinterProvider {
  readonly type = 'dnp' as const;

  /** Supported DNP models in production scope */
  static readonly SUPPORTED_MODELS = ['DS620A', 'RX1HS', 'QW410'] as const;

  /** Standard DNP Dye-Sub Paper Sizes */
  static readonly PAPER_SIZES = {
    '4x6': { widthMm: 102, heightMm: 152, dpi: 300 },
    '2x6': { widthMm: 51, heightMm: 152, dpi: 300, isStrip: true },
    '5x7': { widthMm: 127, heightMm: 178, dpi: 300 },
    '6x8': { widthMm: 152, heightMm: 203, dpi: 300 },
  } as const;

  private connectedDevice: PrinterDevice | null = null;
  private isReady = true;

  async discover(): Promise<PrinterDevice[]> {
    console.log('🖨️ [DNP] Scanning for connected DNP USB / Network printers (DS620A, RX1HS, QW410)...');
    return [
      {
        id: 'dnp-primary',
        name: 'DNP DS620 / RX1HS Photo Printer',
        type: 'dnp',
        address: 'usb://dnp',
        isDefault: true,
      },
    ];
  }

  async connect(device: PrinterDevice): Promise<void> {
    this.connectedDevice = device;
    this.isReady = true;
    console.log(`✅ [DNP] Connected to ${device.name}`);
  }

  async disconnect(): Promise<void> {
    this.connectedDevice = null;
    this.isReady = false;
    console.log('🖨️ [DNP] Disconnected from printer.');
  }

  async print(job: PrintJob): Promise<PrintResult> {
    if (!job.bitmap) {
      return { success: false, error: 'DNPProvider: No bitmap data provided.' };
    }

    const copies = Math.max(1, job.copies || 1);
    const paperSize = job.paperSize || '4x6';
    const jobId = `dnp-job-${Date.now()}`;

    console.log(`🖨️ [DNP] Dispatching job ${jobId}: ${copies} copy/copies at ${paperSize} paper size.`);

    return {
      success: true,
      jobId,
    };
  }

  async getStatus(): Promise<PrinterStatus> {
    return {
      connected: Boolean(this.connectedDevice),
      type: 'dnp',
      isReady: this.isReady,
      paperRemaining: 400,
      ribbonRemaining: 100,
    };
  }
}

// ─────────────────────────────────────────────────────────────────
//  AirPrintProvider — STUB (iOS primary path)
//  For Android-first V1, this is a stub.
//  iOS implementation uses UIPrintInteractionController (Swift).
// ─────────────────────────────────────────────────────────────────

export class AirPrintProvider implements PrinterProvider {
  readonly type = 'airprint' as const;

  async discover(): Promise<PrinterDevice[]> {
    // iOS: UIPrinterPickerController handles this natively
    // Android: Not applicable
    console.warn('AirPrintProvider: iOS-only. Use IPPProvider on Android.');
    return [];
  }

  async connect(_device: PrinterDevice): Promise<void> {
    // iOS: UIPrintInteractionController manages connections implicitly
    throw new Error('AirPrintProvider: iOS-only. Not supported on Android.');
  }

  async disconnect(): Promise<void> {}

  async print(_job: PrintJob): Promise<PrintResult> {
    // TODO (iOS): UIPrintInteractionController.shared().printInfo = ...
    // TODO (iOS): UIPrintInteractionController.shared().present(animated: true)
    return { success: false, error: 'AirPrint is iOS-only. Use IPP on Android.' };
  }

  async getStatus(): Promise<PrinterStatus> {
    return {
      connected: false,
      type: 'airprint',
      isReady: false,
      error: 'AirPrint: iOS-only stub',
    };
  }
}

// ─────────────────────────────────────────────────────────────────
//  CitizenProvider — STUB
// ─────────────────────────────────────────────────────────────────

export class CitizenProvider implements PrinterProvider {
  readonly type = 'citizen' as const;

  async discover(): Promise<PrinterDevice[]> {
    return [];
  }
  async connect(_d: PrinterDevice): Promise<void> {
    throw new Error('CitizenProvider: Pending implementation');
  }
  async disconnect(): Promise<void> {}
  async print(_j: PrintJob): Promise<PrintResult> {
    return { success: false, error: 'Citizen SDK not implemented' };
  }
  async getStatus(): Promise<PrinterStatus> {
    return { connected: false, type: 'citizen', isReady: false };
  }
}
