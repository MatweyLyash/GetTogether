import { useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Box } from '@chakra-ui/react';

interface QRCodeReaderProps {
  onScanSuccess: (decodedText: string) => Promise<void>;
  isActive: boolean;
}

/**
 * QR Code camera reader component
 * Handles camera initialization and scanning
 */
export function QRCodeReader({ onScanSuccess, isActive }: QRCodeReaderProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode('reader', {
        verbose: false,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      });
    }

    const startScanning = async () => {
      if (scannerRef.current && isActive && !isProcessingRef.current) {
        try {
          await scannerRef.current.start(
            { facingMode: 'environment' },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            handleScanSuccess,
            handleScanFailure
          );
        } catch (err) {
          console.error('Error starting scanner:', err);
        }
      }
    };

    const stopScanning = async () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        try {
          await scannerRef.current.stop();
        } catch (err) {
          console.error('Error stopping scanner:', err);
        }
      }
    };

    if (isActive) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch((err) =>
          console.error('Failed to stop scanner on cleanup', err)
        );
      }
    };
  }, [isActive]);

  const handleScanSuccess = async (decodedText: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error('Failed to stop scanner on success', err);
      }
    }

    await onScanSuccess(decodedText);
    isProcessingRef.current = false;
  };

  const handleScanFailure = (_error: any) => {
    // Ignore scan failures - they happen frequently during normal operation
  };

  return (
    <Box
      id="reader"
      width="100%"
      height="500px"
      overflow="hidden"
      borderRadius="md"
      display={isActive ? 'block' : 'none'}
    />
  );
}
