from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import Response
import uvicorn
import cv2
import numpy as np
from PIL import Image
import io
import time

app = FastAPI()

def process_virtual_try_on(user_img_bytes: bytes, cloth_img_bytes: bytes) -> bytes:
    """
    Mock implementation of Virtual Try-On.
    In a real scenario, this is where you'd run MediaPipe for pose estimation
    and CP-VTON / HR-VITON to warp out the clothing.
    """
    # 1. Decode images using OpenCV
    user_array = np.frombuffer(user_img_bytes, np.uint8)
    cloth_array = np.frombuffer(cloth_img_bytes, np.uint8)
    
    user_cv2 = cv2.imdecode(user_array, cv2.IMREAD_COLOR)
    cloth_cv2 = cv2.imdecode(cloth_array, cv2.IMREAD_COLOR)
    
    if user_cv2 is None or cloth_cv2 is None:
        raise ValueError("Invalid image formats uploaded.")
    
    # 2. Mock Processing - simply overlay a text or apply a basic effect
    # Resize cloth mask to smaller size
    cloth_resized = cv2.resize(cloth_cv2, (100, 100))
    
    # Put cloth on top-left of user image as a mockup
    out_img = user_cv2.copy()
    h, w, _ = out_img.shape
    if h >= 100 and w >= 100:
        out_img[0:100, 0:100] = cloth_resized
        
    # Add a text to indicate it was processed
    cv2.putText(out_img, "Processed by AI Service", (10, h - 20), 
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
    
    # 3. Encode back to JPEG/PNG bytes
    is_success, buffer = cv2.imencode(".png", out_img)
    if not is_success:
        raise ValueError("Failed to encode generated image.")
        
    return buffer.tobytes()

@app.post("/try-on")
async def try_on_endpoint(userImage: UploadFile = File(...), clothImage: UploadFile = File(...)):
    try:
        user_bytes = await userImage.read()
        cloth_bytes = await clothImage.read()
        
        # Add latency to simulate heavy ML processing
        print("Received try-on request. Processing...")
        time.sleep(2)
        
        result_bytes = process_virtual_try_on(user_bytes, cloth_bytes)
        
        return Response(content=result_bytes, media_type="image/png")
    
    except Exception as e:
        print(f"Error during processing: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
