#Requires -Version 5.1
# ─────────────────────────────────────────────────────────────────────────────
#  UniversalCameraBridge.ps1
#  HappyPix Universal Camera Engine (PowerShell C# host)
#  Runs as a persistent child process managed by universalAdapter.ts / nikonAdapter.ts
#
#  Supports:
#    - Nikon DSLRs (D3000-D3500, D5000-D5600, D7000-D7500, D750, D850, D500, D610, D800...)
#    - Nikon Mirrorless (Z50, Z5, Z6, Z7, Z8, Z9, Z30, Zfc...)
#    - Canon EOS DSLRs & Mirrorless (1500D, 1300D, 200D II, 3000D, R-series...)
#
#  All communication via stdin/stdout line-delimited JSON:
#    IN (from Node):  {"id":1,"cmd":"connect"|"status"|"liveview_start"|...}
#    OUT (to Node):   {"id":1,"ok":true,"data":{...}} or {"id":1,"ok":false,"error":"..."}
# ─────────────────────────────────────────────────────────────────────────────

param()
$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$libDir    = Join-Path $scriptDir 'lib\net46'
$dllPath   = Join-Path $libDir 'CameraControl.Devices.dll'

if (-not (Test-Path $dllPath)) {
    $err = @{ id = 0; ok = $false; error = "CameraControl.Devices.dll not found at: $dllPath" } | ConvertTo-Json -Compress
    Write-Host $err
    exit 1
}

# Ensure working directory is set to libDir so native dependencies (EDSDK, etc.) load correctly
Set-Location $libDir

# Load CameraControl.Devices assembly
try {
    Add-Type -Path $dllPath
} catch {
    $err = @{ id = 0; ok = $false; error = "Failed to load CameraControl.Devices.dll: $($_.Exception.Message)" } | ConvertTo-Json -Compress
    Write-Host $err
    exit 1
}

$csharpHost = @'
using System;
using System.IO;
using System.Text;
using System.Threading;
using System.Collections.Concurrent;
using CameraControl.Devices;
using CameraControl.Devices.Classes;

public static class UniversalCameraHost {
    private static CameraDeviceManager _deviceManager;
    private static ICameraDevice _selectedDevice;
    private static bool _initialized = false;
    private static bool _liveViewRunning = false;
    private static int _lvFrameCount = 0;
    private static string _latestLVFrameB64 = "";
    private static string _lastCapturedFile = "";
    private static readonly object _lvLock = new object();
    private static AutoResetEvent _captureWaitHandle = new AutoResetEvent(false);

    public static string Init(int id) {
        if (_initialized) return Ok(id, "{\"initialized\":true,\"already\":true}");

        try {
            string tempDir = Path.GetTempPath();
            _deviceManager = new CameraDeviceManager(tempDir);
            _deviceManager.DetectWebcams = false;
            _deviceManager.LoadWiaDevices = false;
            _deviceManager.UseExperimentalDrivers = false;

            _deviceManager.CameraConnected += OnCameraConnected;
            _deviceManager.CameraDisconnected += OnCameraDisconnected;
            _deviceManager.PhotoCaptured += OnPhotoCaptured;

            _deviceManager.ConnectToCamera();
            _initialized = true;

            return Ok(id, "{\"initialized\":true}");
        } catch (Exception ex) {
            return Err(id, "Init failed: " + ex.Message);
        }
    }

    private static void OnCameraConnected(ICameraDevice camera) {
        if (_selectedDevice == null) {
            _selectedDevice = camera;
        }
    }

    private static void OnCameraDisconnected(ICameraDevice camera) {
        if (_selectedDevice == camera) {
            _selectedDevice = null;
            _liveViewRunning = false;
        }
    }

    private static void OnPhotoCaptured(object sender, PhotoCapturedEventArgs eventArgs) {
        try {
            string tempDir = Path.GetTempPath();
            string fileName = "happypix_" + DateTime.Now.ToString("yyyyMMdd_HHmmss_fff") + ".jpg";
            string targetPath = Path.Combine(tempDir, fileName);

            if (eventArgs.CameraDevice != null && eventArgs.Handle != null) {
                eventArgs.CameraDevice.TransferFile(eventArgs.Handle, targetPath);
                _lastCapturedFile = targetPath;
            } else if (!string.IsNullOrEmpty(eventArgs.FileName) && File.Exists(eventArgs.FileName)) {
                _lastCapturedFile = eventArgs.FileName;
            }
        } catch {}
        finally {
            _captureWaitHandle.Set();
        }
    }

    public static string ListDevices(int id) {
        if (!_initialized) return Err(id, "Engine not initialized");

        var sb = new StringBuilder();
        sb.Append("{\"devices\":[");
        int count = 0;

        foreach (var dev in _deviceManager.ConnectedDevices) {
            if (count > 0) sb.Append(",");
            sb.Append("{\"id\":").Append(count)
              .Append(",\"name\":\"").Append(EscJson(dev.DeviceName))
              .Append("\",\"manufacturer\":\"").Append(EscJson(dev.Manufacturer))
              .Append("\",\"serial\":\"").Append(EscJson(dev.SerialNumber ?? ""))
              .Append("\",\"available\":").Append(dev.IsConnected ? "true" : "false")
              .Append("}");
            count++;
        }
        sb.Append("]}");
        return Ok(id, sb.ToString());
    }

    public static string Connect(int id) {
        if (!_initialized) return Err(id, "Engine not initialized");

        if (_selectedDevice != null && _selectedDevice.IsConnected) {
            return Ok(id, "{\"connected\":true,\"name\":\"" + EscJson(_selectedDevice.DeviceName) + "\",\"manufacturer\":\"" + EscJson(_selectedDevice.Manufacturer) + "\"}");
        }

        if (_deviceManager.ConnectedDevices.Count == 0) {
            _deviceManager.ConnectToCamera();
        }

        if (_deviceManager.ConnectedDevices.Count == 0) {
            return Err(id, "No camera detected via USB");
        }

        _selectedDevice = _deviceManager.ConnectedDevices[0];
        return Ok(id, "{\"connected\":true,\"name\":\"" + EscJson(_selectedDevice.DeviceName) + "\",\"manufacturer\":\"" + EscJson(_selectedDevice.Manufacturer) + "\"}");
    }

    public static string Disconnect(int id) {
        if (_liveViewRunning && _selectedDevice != null) {
            try { _selectedDevice.StopLiveView(); } catch {}
            _liveViewRunning = false;
        }
        _selectedDevice = null;
        return Ok(id, "{\"disconnected\":true}");
    }

    public static string Status(int id) {
        bool connected = _selectedDevice != null && _selectedDevice.IsConnected;
        string model = connected ? _selectedDevice.DeviceName : "";
        string manufacturer = connected ? _selectedDevice.Manufacturer : "";
        int? battery = null;

        if (connected) {
            try {
                battery = (int)_selectedDevice.Battery;
            } catch {}
        }

        var sb = new StringBuilder();
        sb.Append("{")
          .Append("\"initialized\":").Append(_initialized ? "true" : "false")
          .Append(",\"connected\":").Append(connected ? "true" : "false")
          .Append(",\"model\":\"").Append(EscJson(model)).Append("\"")
          .Append(",\"manufacturer\":\"").Append(EscJson(manufacturer)).Append("\"")
          .Append(",\"liveView\":").Append(_liveViewRunning ? "true" : "false")
          .Append(",\"batteryPct\":").Append(battery.HasValue ? battery.Value.ToString() : "null")
          .Append("}");

        return Ok(id, sb.ToString());
    }

    public static string StartLiveView(int id) {
        if (_selectedDevice == null || !_selectedDevice.IsConnected)
            return Err(id, "Camera not connected");

        try {
            _selectedDevice.StartLiveView();
            _liveViewRunning = true;
            _lvFrameCount = 0;
            return Ok(id, "{\"started\":true}");
        } catch (Exception ex) {
            return Err(id, "StartLiveView failed: " + ex.Message);
        }
    }

    public static string StopLiveView(int id) {
        if (!_liveViewRunning || _selectedDevice == null)
            return Ok(id, "{\"stopped\":true}");

        try {
            _selectedDevice.StopLiveView();
        } catch {}
        _liveViewRunning = false;
        return Ok(id, "{\"stopped\":true}");
    }

    public static string GetLiveViewFrame(int id) {
        if (!_liveViewRunning || _selectedDevice == null)
            return Ok(id, "{\"frame\":null,\"count\":0}");

        try {
            LiveViewData lvData = _selectedDevice.GetLiveViewImage();
            if (lvData != null && lvData.ImageData != null && lvData.ImageData.Length > 0) {
                string b64 = Convert.ToBase64String(lvData.ImageData);
                _latestLVFrameB64 = b64;
                _lvFrameCount++;
                return Ok(id, "{\"frame\":\"" + b64 + "\",\"count\":" + _lvFrameCount + ",\"focused\":" + (lvData.Focused ? "true" : "false") + "}");
            }
        } catch {}

        return Ok(id, "{\"frame\":null,\"count\":" + _lvFrameCount + "}");
    }

    public static string AutoFocus(int id) {
        if (_selectedDevice == null || !_selectedDevice.IsConnected)
            return Err(id, "Camera not connected");

        try {
            _selectedDevice.AutoFocus();
            return Ok(id, "{\"focused\":true}");
        } catch (Exception ex) {
            return Err(id, "AutoFocus failed: " + ex.Message);
        }
    }

    public static string Capture(int id) {
        if (_selectedDevice == null || !_selectedDevice.IsConnected)
            return Err(id, "Camera not connected");

        try {
            _lastCapturedFile = "";
            _captureWaitHandle.Reset();

            // Fire AutoFocus first for sharpness if supported
            try { _selectedDevice.AutoFocus(); } catch {}

            // Trigger shutter capture
            _selectedDevice.CapturePhoto();

            // Wait up to 6 seconds for the PhotoCaptured event and transfer to complete
            bool transferred = _captureWaitHandle.WaitOne(6000);

            if (!transferred || string.IsNullOrEmpty(_lastCapturedFile) || !File.Exists(_lastCapturedFile)) {
                // Fallback: check temp directory for most recently created file in last 10 seconds
                _lastCapturedFile = FindLatestImageFile(Path.GetTempPath(), 10);
            }

            if (string.IsNullOrEmpty(_lastCapturedFile) || !File.Exists(_lastCapturedFile)) {
                return Err(id, "Capture timed out or image transfer failed");
            }

            int sc = -1;
            try {
                byte[] sample = File.ReadAllBytes(_lastCapturedFile);
                sc = ParseNikonShutterCount(sample, Math.Min(sample.Length, 128 * 1024));
            } catch {}

            return Ok(id, "{\"captured\":true,\"path\":\"" + EscJson(_lastCapturedFile) + "\""
                + (sc > 0 ? ",\"shutterCount\":" + sc : "") + "}");
        } catch (Exception ex) {
            return Err(id, "Capture failed: " + ex.Message);
        }
    }

    public static string ReadSettings(int id) {
        if (_selectedDevice == null || !_selectedDevice.IsConnected)
            return Err(id, "Camera not connected");

        try {
            string iso = _selectedDevice.IsoNumber != null ? _selectedDevice.IsoNumber.Value : "";
            string shutter = _selectedDevice.ShutterSpeed != null ? _selectedDevice.ShutterSpeed.Value : "";
            string aperture = _selectedDevice.FNumber != null ? _selectedDevice.FNumber.Value : "";
            string mode = _selectedDevice.Mode != null ? _selectedDevice.Mode.Value : "";
            int battery = (int)_selectedDevice.Battery;

            var sb = new StringBuilder();
            sb.Append("{")
              .Append("\"iso\":\"").Append(EscJson(iso)).Append("\"")
              .Append(",\"shutterSpeed\":\"").Append(EscJson(shutter)).Append("\"")
              .Append(",\"aperture\":\"").Append(EscJson(aperture)).Append("\"")
              .Append(",\"exposureMode\":\"").Append(EscJson(mode)).Append("\"")
              .Append(",\"batteryPct\":").Append(battery)
              .Append("}");

            return Ok(id, sb.ToString());
        } catch (Exception ex) {
            return Err(id, "ReadSettings failed: " + ex.Message);
        }
    }

    public static string SetSetting(int id, string propertyName, string value) {
        if (_selectedDevice == null || !_selectedDevice.IsConnected)
            return Err(id, "Camera not connected");

        try {
            switch (propertyName.ToLower()) {
                case "iso":
                    if (_selectedDevice.IsoNumber != null) _selectedDevice.IsoNumber.Value = value;
                    break;
                case "shutter":
                    if (_selectedDevice.ShutterSpeed != null) _selectedDevice.ShutterSpeed.Value = value;
                    break;
                case "aperture":
                    if (_selectedDevice.FNumber != null) _selectedDevice.FNumber.Value = value;
                    break;
                case "mode":
                    if (_selectedDevice.Mode != null) _selectedDevice.Mode.Value = value;
                    break;
                default:
                    return Err(id, "Unknown setting property: " + propertyName);
            }
            return Ok(id, "{\"set\":true,\"property\":\"" + EscJson(propertyName) + "\",\"value\":\"" + EscJson(value) + "\"}");
        } catch (Exception ex) {
            return Err(id, "SetSetting failed: " + ex.Message);
        }
    }

    public static string ReadImage(int id, string path) {
        try {
            if (string.IsNullOrEmpty(path) || !File.Exists(path))
                return Err(id, "File not found: " + path);

            byte[] bytes = File.ReadAllBytes(path);
            string b64 = Convert.ToBase64String(bytes);
            string ext = Path.GetExtension(path).ToLower().TrimStart('.');
            string mime = (ext == "jpg" || ext == "jpeg") ? "image/jpeg" : "image/" + ext;

            int shutterCount = ParseNikonShutterCount(bytes, Math.Min(bytes.Length, 128 * 1024));

            return Ok(id, "{\"size\":" + bytes.Length
                + ",\"ext\":\"" + ext + "\""
                + (shutterCount > 0 ? ",\"shutterCount\":" + shutterCount : "")
                + ",\"dataUrl\":\"data:" + mime + ";base64," + b64 + "\"}");
        } catch (Exception ex) {
            return Err(id, ex.Message);
        }
    }

    private static int ParseNikonShutterCount(byte[] data, int length) {
        try {
            for (int i = 0; i < length - 32; i++) {
                if (data[i] == 'N' && data[i+1] == 'i' && data[i+2] == 'k' && data[i+3] == 'o' && data[i+4] == 'n' && data[i+5] == 0) {
                    int start = i + 10;
                    if (start >= length - 12) continue;
                    bool isLittleEndian = (data[start] == 0x49 && data[start+1] == 0x49);
                    int ifdOffset = ReadUInt16(data, start + 2, isLittleEndian) == 0x002A ? 8 : 0;
                    int dirStart = start + ifdOffset;
                    if (dirStart >= length - 4) continue;
                    int tagCount = ReadUInt16(data, dirStart, isLittleEndian);
                    int p = dirStart + 2;
                    for (int t = 0; t < tagCount && p < length - 12; t++, p += 12) {
                        int tagId = ReadUInt16(data, p, isLittleEndian);
                        if (tagId == 0x00A7) { // TotalShutterReleases
                            int type = ReadUInt16(data, p + 2, isLittleEndian);
                            if (type == 3) return ReadUInt16(data, p + 8, isLittleEndian);
                            return ReadInt32(data, p + 8, isLittleEndian);
                        }
                    }
                }
            }
        } catch {}
        return -1;
    }

    private static ushort ReadUInt16(byte[] data, int idx, bool le) {
        if (idx + 2 > data.Length) return 0;
        return le ? (ushort)(data[idx] | (data[idx+1] << 8)) : (ushort)((data[idx] << 8) | data[idx+1]);
    }

    private static int ReadInt32(byte[] data, int idx, bool le) {
        if (idx + 4 > data.Length) return 0;
        return le ? (data[idx] | (data[idx+1] << 8) | (data[idx+2] << 16) | (data[idx+3] << 24))
                  : ((data[idx] << 24) | (data[idx+1] << 16) | (data[idx+2] << 8) | data[idx+3]);
    }

    private static string FindLatestImageFile(string dir, int maxAgeSec) {
        try {
            string[] exts = { "*.jpg", "*.jpeg", "*.nef", "*.cr2", "*.cr3" };
            DateTime best = DateTime.MinValue;
            string bestFile = null;
            foreach (var ext in exts) {
                foreach (var f in Directory.GetFiles(dir, ext)) {
                    var t = File.GetLastWriteTime(f);
                    if (t > best && (DateTime.Now - t).TotalSeconds < maxAgeSec) {
                        best = t;
                        bestFile = f;
                    }
                }
            }
            return bestFile;
        } catch { return null; }
    }

    private static string EscJson(string s) {
        return s == null ? "" : s.Replace("\\","\\\\").Replace("\"","\\\"").Replace("\n","\\n").Replace("\r","");
    }

    private static string Ok(int id, string dataJson) {
        return "{\"id\":" + id + ",\"ok\":true,\"data\":" + dataJson + "}";
    }

    private static string Err(int id, string msg) {
        return "{\"id\":" + id + ",\"ok\":false,\"error\":\"" + EscJson(msg) + "\"}";
    }

    public static void Run() {
        Console.WriteLine("{\"id\":0,\"ok\":true,\"data\":{\"ready\":true,\"engine\":\"UniversalCameraEngine\"}}");
        Console.Out.Flush();

        string line;
        while ((line = Console.In.ReadLine()) != null) {
            line = line.Trim();
            if (line.Length == 0) continue;
            string response = Dispatch(line);
            Console.WriteLine(response);
            Console.Out.Flush();
        }

        try {
            if (_liveViewRunning && _selectedDevice != null) {
                try { _selectedDevice.StopLiveView(); } catch {}
            }
            if (_selectedDevice != null) {
                try { _selectedDevice.Close(); } catch {}
            }
        } catch {}
    }

    private static string Dispatch(string line) {
        int id = ExtractInt(line, "\"id\"");
        string cmd = ExtractStr(line, "\"cmd\"");

        switch (cmd) {
            case "init":            return Init(id);
            case "devices":         return ListDevices(id);
            case "connect":         return Connect(id);
            case "disconnect":      return Disconnect(id);
            case "status":          return Status(id);
            case "liveview_start":  return StartLiveView(id);
            case "liveview_stop":   return StopLiveView(id);
            case "liveview_frame":  return GetLiveViewFrame(id);
            case "get_cap": {
                uint capId = (uint)ExtractInt(line, "\"capId\"");
                uint val = 0;
                if (_selectedDevice != null && _selectedDevice.IsConnected) {
                    if (capId == 0x0018) val = (uint)_selectedDevice.Battery;
                }
                return Ok(id, "{\"capId\":" + capId + ",\"value\":" + val + ",\"dataType\":4}");
            }
            case "set_cap": {
                uint capId = (uint)ExtractInt(line, "\"capId\"");
                return Ok(id, "{\"capId\":" + capId + ",\"set\":true}");
            }
            case "autofocus":       return AutoFocus(id);
            case "capture":         return Capture(id);
            case "settings_read":   return ReadSettings(id);
            case "settings_set": {
                string prop = ExtractStr(line, "\"property\"");
                string val  = ExtractStr(line, "\"value\"");
                return SetSetting(id, prop, val);
            }
            case "read_image": {
                string path = ExtractStr(line, "\"path\"");
                return ReadImage(id, path);
            }
            case "shutdown":
                Disconnect(id);
                return Ok(id, "{\"shutdown\":true}");
            default:
                return Err(id, "Unknown command: " + cmd);
        }
    }

    private static int ExtractInt(string json, string key) {
        int ki = json.IndexOf(key);
        if (ki < 0) return 0;
        int ci = json.IndexOf(':', ki + key.Length);
        if (ci < 0) return 0;
        int start = ci + 1;
        while (start < json.Length && (json[start] == ' ' || json[start] == '\t')) start++;
        int end = start;
        if (end < json.Length && json[end] == '-') end++;
        while (end < json.Length && char.IsDigit(json[end])) end++;
        if (start == end) return 0;
        return int.Parse(json.Substring(start, end - start));
    }

    private static string ExtractStr(string json, string key) {
        int ki = json.IndexOf(key);
        if (ki < 0) return "";
        int ci = json.IndexOf(':', ki + key.Length);
        if (ci < 0) return "";
        int q1 = json.IndexOf('"', ci + 1);
        if (q1 < 0) return "";
        int q2 = q1 + 1;
        while (q2 < json.Length) {
            if (json[q2] == '\\') { q2 += 2; continue; }
            if (json[q2] == '"') break;
            q2++;
        }
        return json.Substring(q1 + 1, q2 - q1 - 1).Replace("\\\"","\"").Replace("\\\\","\\");
    }
}
'@

try {
    Add-Type -TypeDefinition $csharpHost -ReferencedAssemblies @(
        'System.dll',
        'System.Core.dll',
        'System.Drawing.dll',
        'System.Windows.Forms.dll',
        $dllPath
    ) -Language CSharp -ErrorAction Stop
} catch {
    $err = @{ id = 0; ok = $false; error = "C# compilation error: $($_.Exception.Message)" } | ConvertTo-Json -Compress
    Write-Host $err
    exit 1
}

[UniversalCameraHost]::Run()
