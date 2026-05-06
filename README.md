# Carbon Intelligence Project

This project consists of a React frontend and a dual-service backend (Node.js for Authentication and Python FastAPI for AI/Credit Risk Inference).

## Project Structure

- **`frontend/`**: The React/Vite frontend application.
- **`backend/node_service/`**: The Node.js Express backend for user authentication.
- **`backend/Capstone-backend/`**: The Python FastAPI backend for AI and credit risk inference.

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **Python** (3.8 or higher recommended)
- **MongoDB** (Local or Atlas, required for the Node.js auth service)

---

## How to Run the Project Locally

You will need to open **three separate terminal windows** (or use terminal tabs) to run each part of the project concurrently.

### 1. Run the Frontend (React/Vite)

Open your **first terminal** and run the following commands:

```powershell
cd frontend
npm install
npm run dev
```

The frontend will start and typically be accessible at `http://localhost:5173`.

### 2. Run the Authentication Backend (Node.js)

Open a **second terminal** and run:

```powershell
cd backend/node_service
npm install
npm run dev
```

This will start the Node.js Express server using `nodemon`. Make sure you have a `.env` file in the `node_service` directory configured with your MongoDB connection string (e.g., `MONGO_URI`) and your JWT secrets.

### 3. Run the AI / Inference Backend (Python FastAPI)

Open a **third terminal** and run:

```powershell
cd backend/Capstone-backend

# 1. Create a virtual environment (only needed the very first time)
python -m venv venv

# 2. Activate the virtual environment (Windows)
.\venv\Scripts\activate

# 3. Install dependencies (only needed the first time or when requirements change)
pip install -r requirements.txt

# 4. Run the main FastAPI server
python -m uvicorn app.api.main:app --host 127.0.0.1 --port 8000 --reload
```

The main AI API will be accessible at `http://localhost:8000`.

*(Optional: If your frontend requires the secondary inference API running on port 8001, you can open a fourth terminal, activate the same virtual environment, and run: `python -c "from app.api.inference_service import run_inference_service; run_inference_service(port=8001)"`)*

---

## Troubleshooting

- **Node.js Service crashing on start**: Ensure you have a local MongoDB instance running or an active MongoDB Atlas URI in your `.env` file inside `node_service`.
- **Python Service modules not found**: Make sure you have successfully activated the virtual environment (`.\venv\Scripts\activate`) before running the `uvicorn` command.
- **Package.json in `backend/`**: Note that there is a root `package.json` inside `backend/` that attempts to start both backend services concurrently. However, the paths may be configured differently depending on your virtual environment setup. Running them individually as shown above is the most reliable method.
