

# QR Code Scanner for Point Checking

## Overview

Add a QR code scanning option to the Check Points screen so students can scan their LRN from a QR code instead of typing it manually. The scanner opens in a modal, validates the scanned data, and auto-triggers the point lookup.

## New Dependency

- **html5-qrcode**: A well-maintained, lightweight QR scanning library that works directly with the browser's camera API. No heavy native dependencies required.

## New Files

### 1. `src/components/QrScannerModal.tsx`

A modal component that:
- Opens the device camera using `html5-qrcode` (prefers front-facing camera for kiosk use)
- Displays a scanning frame/guide overlay
- Validates scanned data with three checks before accepting:
  1. **URL rejection**: If data starts with `http://` or `https://`, show toast warning: "Invalid QR: Please scan your Student ID, not a website link."
  2. **Numeric check**: If data contains non-digit characters, reject with toast: "Invalid QR: LRN must be a 12-digit number."
  3. **Length check**: Must be exactly 12 digits
- On valid scan: calls an `onScan(lrn: string)` callback, closes the modal
- Handles camera permission denial gracefully with a helpful message
- Stops/cleans up the camera when modal closes

**Props**: `isOpen: boolean`, `onClose: () => void`, `onScan: (lrn: string) => void`

## Modified Files

### 2. `src/components/screens/CheckPointsScreen.tsx`

- Add a QR code icon button (using `ScanLine` or `QrCode` from lucide-react) inside/beside the LRN input field
- Add state `showQrScanner` to control modal visibility
- Add `handleQrScan(lrn)` handler that:
  - Sets the LRN value in the input
  - Closes the scanner modal
  - Auto-triggers `handleSearch()` with the scanned LRN
- Import and render `QrScannerModal`

## Technical Details

### html5-qrcode Integration

```typescript
import { Html5Qrcode } from "html5-qrcode";

// Start scanner
const scanner = new Html5Qrcode("qr-reader");
await scanner.start(
  { facingMode: "user" }, // front camera
  { fps: 10, qrbox: { width: 250, height: 250 } },
  onScanSuccess,
  onScanFailure
);

// Cleanup on unmount/close
await scanner.stop();
```

### Validation Flow

```text
Scan detected
  |
  +--> Starts with http/https? --> Toast warning, keep scanning
  |
  +--> Contains non-digits? --> Toast warning, keep scanning
  |
  +--> Not 12 digits? --> Toast warning, keep scanning
  |
  +--> Valid 12-digit number --> Fill input, close modal, trigger search
```

### UI Layout (Input Area)

The LRN input gets a wrapper div with relative positioning. The QR button is placed inside the input on the right side as an icon button, styled to match the kiosk theme.

### Camera Permission Handling

If `getUserMedia` fails or permission is denied, the modal displays: "Please allow camera access to scan your ID" with a "Close" button.

## Implementation Sequence

1. Install `html5-qrcode` dependency
2. Create `QrScannerModal` component with camera, validation, and permission handling
3. Update `CheckPointsScreen` to add QR button and integrate the scanner modal
