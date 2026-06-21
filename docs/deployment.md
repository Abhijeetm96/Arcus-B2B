# ⚙️ ARCUS Installation & Run Guides

Follow these steps to deploy and run the full-stack ARCUS application.

## 📋 Prerequisites
- Node.js (v18+)
- npm (v9+)

---

## 🛠️ Environment Variables
Create a `.env` file under the `server/` directory:
```ini
PORT=5000
NODE_ENV=development
```

---

## 🚀 Running the Platform

### 1. Start the API Server
```bash
cd server
npm install
npm run dev
```
The server starts on `http://localhost:5000`. Mock email OTP dispatches are logged to the console.

### 2. Start the Frontend Client
```bash
# In the root directory
npm install
npm run dev
```
The Vite client starts on `http://localhost:5173`. Proxies are configured to route `/api/*` to the server automatically.
