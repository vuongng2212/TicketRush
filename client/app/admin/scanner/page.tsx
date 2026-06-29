'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { Camera, CheckCircle, XCircle, AlertTriangle, RefreshCw, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface CheckInResponse {
  status: 'SUCCESS' | 'ALREADY_CHECKED_IN' | 'INVALID_TICKET' | 'UNAUTHORIZED' | 'UNKNOWN';
  ticketId?: string;
  concertTitle?: string;
  seatNumber?: string;
  attendeeName?: string;
  checkedInAt?: string;
  error?: string;
}

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState<CheckInResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerId = 'reader';

  // Fetch available cameras
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          setSelectedCameraId(devices[0].id);
        }
      })
      .catch((err) => {
        console.error('Error fetching cameras', err);
      });

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    if (!selectedCameraId) return;
    setScanResult(null);
    setIsScanning(true);

    try {
      const html5QrCode = new Html5Qrcode(scannerId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        selectedCameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // Found QR code
          stopScanner();
          await processTicket(decodedText);
        },
        (errorMessage) => {
          // Verbose log filter out
        }
      );
    } catch (err) {
      console.error('Failed to start scanner:', err);
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current
        .stop()
        .then(() => {
          setIsScanning(false);
        })
        .catch((err) => {
          console.error('Failed to stop scanner:', err);
        });
    } else {
      setIsScanning(false);
    }
  };

  const processTicket = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketToken: token }),
      });
      const data = await res.json();
      setScanResult(data);
    } catch (err) {
      console.error(err);
      setScanResult({ status: 'UNKNOWN', error: 'API Gateway connection failure' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center gap-1 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-400" /> Ticket Scanner
          </h1>
          <div className="w-12"></div>
        </div>

        {/* Scan box area */}
        <div className="relative w-full aspect-square bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center mb-6">
          <div id={scannerId} className="w-full h-full"></div>
          
          {!isScanning && !loading && !scanResult && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10 bg-slate-950/80">
              <Camera className="w-12 h-12 text-slate-600 mb-2 animate-pulse" />
              <p className="text-slate-400 text-sm mb-4">Allow camera access and click Start Scanning</p>
              
              {cameras.length > 0 && (
                <select
                  value={selectedCameraId}
                  onChange={(e) => setSelectedCameraId(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm w-3/4 mb-4 outline-none focus:border-cyan-500"
                >
                  {cameras.map((cam) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.label || `Camera ${cam.id.substring(0, 5)}`}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={startScanner}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/20"
              >
                Start Scanning
              </button>
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center z-20">
              <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-2" />
              <p className="text-slate-400 text-sm">Verifying ticket via gRPC...</p>
            </div>
          )}
        </div>

        {/* Result Area */}
        {scanResult && (
          <div className="mt-4 p-5 rounded-xl border animate-fade-in bg-slate-950 border-slate-800">
            {scanResult.status === 'SUCCESS' && (
              <div className="flex flex-col items-center text-center">
                <CheckCircle className="w-12 h-12 text-emerald-400 mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Check-In Successful</h3>
                <div className="w-full text-left space-y-2 mt-2 text-sm border-t border-slate-800 pt-3">
                  <div className="flex justify-between"><span className="text-slate-500">Attendee:</span> <span className="font-semibold text-slate-200">{scanResult.attendeeName}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Concert:</span> <span className="font-semibold text-slate-200">{scanResult.concertTitle}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Seat Number:</span> <span className="font-semibold text-cyan-400">{scanResult.seatNumber}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Checked In:</span> <span className="text-slate-300 text-xs">{new Date(scanResult.checkedInAt!).toLocaleTimeString()}</span></div>
                </div>
              </div>
            )}

            {scanResult.status === 'ALREADY_CHECKED_IN' && (
              <div className="flex flex-col items-center text-center">
                <AlertTriangle className="w-12 h-12 text-amber-400 mb-3 animate-bounce" />
                <h3 className="text-lg font-bold text-white mb-2">Already Checked In</h3>
                <p className="text-slate-400 text-xs px-4 mb-2">This ticket has already been used for entry.</p>
                {scanResult.ticketId && (
                  <p className="text-slate-600 text-[10px] select-all mt-1">ID: {scanResult.ticketId}</p>
                )}
              </div>
            )}

            {scanResult.status === 'INVALID_TICKET' && (
              <div className="flex flex-col items-center text-center">
                <XCircle className="w-12 h-12 text-rose-400 mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Invalid Ticket</h3>
                <p className="text-slate-400 text-xs px-4">Verification failed. Ticket code not registered.</p>
              </div>
            )}

            {scanResult.status === 'UNAUTHORIZED' && (
              <div className="flex flex-col items-center text-center">
                <XCircle className="w-12 h-12 text-purple-400 mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Unauthorized Admin</h3>
                <p className="text-slate-400 text-xs px-4">Secret admin authentication token rejected by server.</p>
              </div>
            )}

            {scanResult.status === 'UNKNOWN' && (
              <div className="flex flex-col items-center text-center">
                <AlertTriangle className="w-12 h-12 text-rose-500 mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Connection Error</h3>
                <p className="text-slate-400 text-xs px-4">{scanResult.error || 'Unknown error occurred'}</p>
              </div>
            )}

            <button
              onClick={() => {
                setScanResult(null);
                startScanner();
              }}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-lg transition-colors border border-slate-700"
            >
              <RefreshCw className="w-4 h-4" /> Scan Next Ticket
            </button>
          </div>
        )}

        {isScanning && (
          <button
            onClick={stopScanner}
            className="w-full mt-4 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 font-semibold py-2.5 rounded-lg border border-rose-900/60 transition-colors"
          >
            Cancel Scanning
          </button>
        )}
      </div>
    </div>
  );
}
