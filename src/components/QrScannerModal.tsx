import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (lrn: string) => void;
}

const QR_READER_ID = "qr-reader-container";

const QrScannerModal = ({ isOpen, onClose, onScan }: QrScannerModalProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [starting, setStarting] = useState(false);
  const processedRef = useRef(false);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) { // SCANNING
          await scannerRef.current.stop();
        }
      } catch {
        // ignore
      }
      scannerRef.current = null;
    }
  }, []);

  const handleScanSuccess = useCallback((decodedText: string) => {
    if (processedRef.current) return;

    // Check 1: URL rejection
    if (decodedText.startsWith("http://") || decodedText.startsWith("https://")) {
      toast({
        title: "Invalid QR",
        description: "Please scan your Student ID, not a website link.",
        variant: "destructive",
      });
      return;
    }

    // Check 2: Numeric only
    if (/\D/.test(decodedText)) {
      toast({
        title: "Invalid QR",
        description: "LRN must be a 12-digit number.",
        variant: "destructive",
      });
      return;
    }

    // Check 3: Exactly 12 digits
    if (decodedText.length !== 12) {
      toast({
        title: "Invalid QR",
        description: "LRN must be exactly 12 digits.",
        variant: "destructive",
      });
      return;
    }

    // Valid scan
    processedRef.current = true;
    onScan(decodedText);
  }, [onScan]);

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setPermissionDenied(false);
      processedRef.current = false;
      return;
    }

    // Small delay to ensure the DOM element is rendered
    const timeout = setTimeout(async () => {
      if (scannerRef.current || starting) return;
      setStarting(true);

      try {
        const scanner = new Html5Qrcode(QR_READER_ID);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "user" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          handleScanSuccess,
          () => {} // silence scan failures (no QR in frame)
        );
      } catch {
        setPermissionDenied(true);
      } finally {
        setStarting(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      stopScanner();
    };
  }, [isOpen, handleScanSuccess, stopScanner, starting]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-background border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-primary flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan QR Code
          </DialogTitle>
          <DialogDescription>
            Point your camera at the student's QR code to scan their LRN.
          </DialogDescription>
        </DialogHeader>

        {permissionDenied ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <Camera className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Please allow camera access to scan your ID.
            </p>
            <Button variant="secondary" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        ) : (
          <div className="relative w-full overflow-hidden rounded-lg">
            <div id={QR_READER_ID} className="w-full" />
            {starting && (
              <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                Starting camera…
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default QrScannerModal;
