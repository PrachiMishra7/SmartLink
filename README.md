# SmartLink

AI-Powered Intelligent URL Shortener & Analytics Platform.

## How to Run Locally

You will need two separate terminal windows to run the backend and the frontend simultaneously.

### 1. Run the Backend (FastAPI)

1. Open a new terminal at the project root (`SmartLink/`).
2. Create and activate a virtual environment (if not already done):
   ```bash
   cd backend
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI development server from the **project root**:
   ```bash
   cd ..
   # On Windows (PowerShell/CMD) - Make sure venv is active
   .\backend\venv\Scripts\activate
   uvicorn backend.main:app --reload
   ```
5. The backend API will be available at: http://127.0.0.1:8000
6. You can view the interactive API documentation at: http://127.0.0.1:8000/docs

### 2. Run the Frontend (React + Vite)

1. Open a second, new terminal.
2. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. The frontend UI will be available at: http://localhost:5173

---

*Note: Make sure you leave both terminals running while you are working on or testing the project.*
