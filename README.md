# Virtual Try-On Project

This is a full-stack Virtual Try-On application that uses a React frontend, a Node.js/Express backend, and a Python FastAPI AI microservice for generating virtual try-on images.

## Project Structure
- **`/frontend`**: React application (Vite).
- **`/backend`**: Node.js & Express server handling file uploads and routing AI requests.
- **`/ai-service`**: Python FastAPI microservice that communicates with Hugging Face to generate the actual try-on images.

## Prerequisites
To run this project on a new device, you will need the following installed:
1. **Node.js** (v18+ recommended) & **npm**
2. **Python** (v3.9+ recommended)
3. **Git** (if cloning from a repository)

---

## Setup & Run Instructions

You will need to open **three separate terminal windows**, one for each part of the project.

### Step 1: Start the AI Service (Python)
The AI service handles the heavy lifting of image processing using the IDM-VTON model.

1. Open a terminal and navigate to the `ai-service` folder:
   ```bash
   cd ai-service
   ```
2. (Optional but recommended) Create and activate a Python virtual environment:
   ```bash
   # Windows:
   python -m venv venv
   venv\Scripts\activate
   
   # macOS/Linux:
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   python main.py
   ```
   *The AI service should now be running on `http://localhost:8000`.*

### Step 2: Start the Backend (Node.js)
The backend manages API requests, file uploads, and coordinates with the OpenRouter AI for style recommendations.

1. Open a **second terminal** and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install the required Node dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder (since it is ignored by Git for security):
   ```bash
   # In backend/.env, add the following lines:
   PORT=5000
   OPENROUTER_API_KEY=your_actual_openrouter_api_key_here
   ```
   *Note: Replace `your_actual_openrouter_api_key_here` with a valid OpenRouter API key for the styling recommendations feature.*
4. Start the backend server:
   ```bash
   node server.js
   ```
   *The Backend server should now be running on `http://localhost:5000`.*

### Step 3: Start the Frontend (React)
The frontend provides the user interface for capturing photos, uploading clothes, and viewing results.

1. Open a **third terminal** and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the required Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The Frontend should now be accessible in your browser, typically at `http://localhost:5173`.*

---

## Features & Notes
- **Database:** This project **does not require a database**. All image processing is handled on-the-fly and files are saved temporarily in the `backend/uploads` and `backend/results` folders.
- **Styling Recommendations:** The AI stylist feature relies on the OpenRouter API. Ensure your key is correctly set in `backend/.env`.
- **Image Generation:** The virtual try-on process calls the Hugging Face IDM-VTON space. Generation can take a few moments depending on the space's current queue.