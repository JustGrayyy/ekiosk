import { useEffect, useRef, useState } from "react";
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
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  const [permissionDenied, setPermissionDenied] = useState(false);
  const [starting, setStarting] = useState(false);
  const processedRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      // Cleanup when closing
      const scanner = scannerRef.current;
      if (scanner) {
        scannerRef.current = null;
        scanner.stop().catch(() => {});
      }
      setPermissionDenied(false);
      setStarting(false);
      processedRef.current = false;
      mountedRef.current = false;
      return;
    }

    // Prevent double-start from strict mode or re-renders
    if (mountedRef.current) return;
    mountedRef.current = true;

    const timeout = setTimeout(async () => {
      if (scannerRef.current) return;
      setStarting(true);

      try {
        const scanner = new Html5Qrcode(QR_READER_ID);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "user" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            if (processedRef.current) return;

            // Check 1: URL rejection
            if (decodedText.startsWith("http://") || decodedText.startsWith("https://")) {
              toast({ title: "Invalid QR", description: "Please scan your Student ID, not a website link.", variant: "destructive" });
              return;
            }
            // Check 2: Numeric only
            if (/\D/.test(decodedText)) {
              toast({ title: "Invalid QR", description: "LRN must be a 12-digit number.", variant: "destructive" });
              return;
            }
            // Check 3: Exactly 12 digits
            if (decodedText.length !== 12) {
              toast({ title: "Invalid QR", description: "LRN must be exactly 12 digits.", variant: "destructive" });
              return;
            }

            processedRef.current = true;
            onScanRef.current(decodedText);
          },
          () => {} // silence no-QR-in-frame
        );
      } catch {
        setPermissionDenied(true);
      } finally {
        setStarting(false);
      }
    }, 400);

    return () => {
      clearTimeout(timeout);
      const scanner = scannerRef.current;
      if (scanner) {
        scannerRef.current = null;
        scanner.stop().catch(() => {});
      }
      mountedRef.current = false;
    };
  }, [isOpen]); // only depend on isOpen

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
