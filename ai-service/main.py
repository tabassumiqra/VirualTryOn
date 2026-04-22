from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import Response
import uvicorn
import os
import tempfile
from gradio_client import Client, handle_file

app = FastAPI()

# Initialize the Gradio Client
client = Client("yisol/IDM-VTON")

def process_virtual_try_on(user_img_bytes: bytes, cloth_img_bytes: bytes) -> bytes:
    """
    Real Virtual Try-On using Hugging Face Space IDM-VTON.
    """
    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_user:
        temp_user.write(user_img_bytes)
        user_path = temp_user.name
        
    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_cloth:
        temp_cloth.write(cloth_img_bytes)
        cloth_path = temp_cloth.name

    try:
        print("Preparing payload for Hugging Face Space IDM-VTON...")
        dict_val = {"background": handle_file(user_path), "layers": [], "composite": None}
        
        print("Processing...")
        result = client.predict(
            dict_val,                # dict
            handle_file(cloth_path), # garm_img
            "Clothing item",         # garment_des
            True,                    # is_checked
            False,                   # is_checked_crop
            30,                      # denoise_steps
            42,                      # seed
            api_name="/tryon"
        )
        
        # Result is a Tuple [Image, Image], extract the generated image path
        output_image_path = result[0]
        
        # Read the generated image bytes
        with open(output_image_path, "rb") as f:
            output_bytes = f.read()
            
        print("Success!")
        return output_bytes
        
    finally:
        if os.path.exists(user_path):
            os.remove(user_path)
        if os.path.exists(cloth_path):
            os.remove(cloth_path)

@app.post("/try-on")
async def try_on_endpoint(userImage: UploadFile = File(...), clothImage: UploadFile = File(...)):
    try:
        user_bytes = await userImage.read()
        cloth_bytes = await clothImage.read()
        
        print("Received try-on request.")
        result_bytes = process_virtual_try_on(user_bytes, cloth_bytes)
        
        return Response(content=result_bytes, media_type="image/png")
    
    except Exception as e:
        print(f"Error during processing: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
