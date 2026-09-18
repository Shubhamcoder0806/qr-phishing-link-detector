import io
from PIL import Image

def decode_qr_image(image_bytes: bytes) -> str:
    """Decode QR code image file bytes and return extracted string URL."""
    try:
        # Load image with PIL
        image = Image.open(io.BytesIO(image_bytes))
        
        # 1. Try pyzbar if installed
        try:
            from pyzbar.pyzbar import decode
            decoded_objects = decode(image)
            if decoded_objects:
                return decoded_objects[0].data.decode('utf-8').strip()
        except ImportError:
            pass

        # 2. Try opencv if installed
        try:
            import cv2
            import numpy as np
            nparr = np.frombuffer(image_bytes, np.uint8)
            img_np = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            detector = cv2.QRCodeDetector()
            data, bbox, _ = detector.detectAndDecode(img_np)
            if data:
                return data.strip()
        except ImportError:
            pass

        raise ValueError("Could not detect or read QR code from the uploaded image. Please ensure the QR code is clear.")
    except Exception as e:
        raise ValueError(f"QR Decoding failed: {str(e)}")
