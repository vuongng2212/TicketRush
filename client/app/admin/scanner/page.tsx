'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Link from 'next/link';

interface CameraDevice {
  id: string;
  label: string;
}

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
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerId = 'reader';

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
        () => {
          // Verbose log filter out - ignore scan errors
        }
      );
    } catch (err) {
      console.error('Failed to start scanner:', err);
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-paper flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md border border-hairline bg-ink p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-hairline pb-6">
          <Link 
            href="/" 
            className="font-mono text-label uppercase text-muted hover:text-coral tracking-[0.15em]"
          >
            ← Quay lại
          </Link>
          <h1 className="font-label text-label uppercase tracking-[0.2em] text-paper">
            SCANNER
          </h1>
          <div className="w-20"></div>
        </div>

        {/* Scan box area */}
        <div className="relative w-full aspect-square bg-ink-2 border border-hairline flex flex-col items-center justify-center mb-8">
          <div id={scannerId} className="w-full h-full"></div>
          
          {!isScanning && !loading && !scanResult && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10 bg-ink">
              <p className="font-mono text-label uppercase text-muted tracking-[0.15em] mb-6">
                CHỌN CAMERA VÀ BẮT ĐẦU
              </p>
              
              {cameras.length > 0 && (
                <select
                  value={selectedCameraId}
                  onChange={(e) => setSelectedCameraId(e.target.value)}
                  className="bg-ink-2 border border-hairline text-paper font-mono text-small px-4 py-3 w-full mb-6 outline-none focus:border-coral"
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
                className="font-label uppercase tracking-[0.2em] text-label bg-coral text-ink px-8 py-3 hover:bg-paper w-full"
              >
                Bắt đầu quét
              </button>
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 bg-ink flex flex-col items-center justify-center z-20">
              <p className="font-mono text-label uppercase text-muted tracking-[0.2em]">
                ĐANG XÁC MINH...
              </p>
            </div>
          )}
        </div>

        {/* Result Area */}
        {scanResult && (
          <div className="border border-hairline p-6 bg-ink-2">
            {scanResult.status === 'SUCCESS' && (
              <div className="flex flex-col">
                <p className="font-mono text-label uppercase text-coral tracking-[0.2em] mb-6 text-center">
                  CHECK-IN THÀNH CÔNG
                </p>
                <div className="space-y-3 border-t border-hairline pt-4">
                  <div className="flex justify-between">
                    <span className="font-mono text-small uppercase text-muted tracking-wider">Người tham dự:</span>
                    <span className="font-mono text-small text-paper">{scanResult.attendeeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-small uppercase text-muted tracking-wider">Concert:</span>
                    <span className="font-mono text-small text-paper">{scanResult.concertTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-small uppercase text-muted tracking-wider">Ghế số:</span>
                    <span className="font-mono text-small text-coral">{scanResult.seatNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-small uppercase text-muted tracking-wider">Giờ check-in:</span>
                    <span className="font-mono text-[11px] text-muted">{scanResult.checkedInAt && new Date(scanResult.checkedInAt).toLocaleTimeString('vi-VN')}</span>
                  </div>
                </div>
              </div>
            )}

            {scanResult.status === 'ALREADY_CHECKED_IN' && (
              <div className="flex flex-col text-center">
                <p className="font-mono text-label uppercase text-coral tracking-[0.2em] mb-4">
                  ĐÃ CHECK-IN
                </p>
                <p className="font-body text-small text-muted">
                  Vé này đã được sử dụng để vào cửa.
                </p>
                {scanResult.ticketId && (
                  <p className="font-mono text-[10px] text-muted mt-3">ID: {scanResult.ticketId}</p>
                )}
              </div>
            )}

            {scanResult.status === 'INVALID_TICKET' && (
              <div className="flex flex-col text-center">
                <p className="font-mono text-label uppercase text-coral tracking-[0.2em] mb-4">
                  VÉ KHÔNG HỢP LỆ
                </p>
                <p className="font-body text-small text-muted">
                  Xác thực thất bại. Mã vé không được đăng ký.
                </p>
              </div>
            )}

            {scanResult.status === 'UNAUTHORIZED' && (
              <div className="flex flex-col text-center">
                <p className="font-mono text-label uppercase text-coral tracking-[0.2em] mb-4">
                  KHÔNG CÓ QUYỀN
                </p>
                <p className="font-body text-small text-muted">
                  Token admin bị từ chối bởi máy chủ.
                </p>
              </div>
            )}

            {scanResult.status === 'UNKNOWN' && (
              <div className="flex flex-col text-center">
                <p className="font-mono text-label uppercase text-coral tracking-[0.2em] mb-4">
                  LỖI KẾT NỐI
                </p>
                <p className="font-body text-small text-muted">
                  {scanResult.error || 'Đã xảy ra lỗi không xác định'}
                </p>
              </div>
            )}

            <button
              onClick={() => {
                setScanResult(null);
                startScanner();
              }}
              className="w-full mt-6 font-label uppercase tracking-[0.2em] text-label border border-paper px-6 py-3 hover:bg-paper hover:text-ink"
            >
              Quét vé tiếp theo
            </button>
          </div>
        )}

        {isScanning && (
          <button
            onClick={stopScanner}
            className="w-full mt-4 font-label uppercase tracking-[0.2em] text-label border border-coral text-coral px-6 py-3 hover:bg-coral hover:text-ink"
          >
            Hủy quét
          </button>
        )}
      </div>
    </div>
  );
}
