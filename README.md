# 🏗️ ARCUS Platform

ARCUS is a full-stack, enterprise-grade commerce and procurement platform designed for the construction industry. It integrates a retail/B2B materials marketplace, a verified trade professionals scheduler, and a Request for Quote (RFQ) procurement engine.

---

## 📖 Project Documentation

All project documentation lives under the **[`/docs`](docs/README.md)** directory.

### Quick Start Links
* 🚀 **[Developer Onboarding Guide (START_HERE.md)](docs/START_HERE.md)**
* 🧠 **[Master Engineering Handbook (PROJECT_BRAIN.md)](docs/PROJECT_BRAIN.md)**
* 📚 **[Documentation Index (docs/README.md)](docs/README.md)**

---

## 🛠️ Technology Stack
* **Frontend**: React 19 SPA, Tailwind CSS 3, Vite 8
* **Backend**: Node.js & Express API, TypeScript
* **Database**: PostgreSQL (Neon production) with local zero-config JSON fallback (`server/data/db.json`)
* **Shared Layer**: Isomorphic validation rules and rate limiting configurations (`shared/validation.ts`)

---

## 💻 Quick Start & Installation

### 1. Repository Setup
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 2. Configure Environment Variables
Create a `server/.env` file:
```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/arcus_db
JWT_SECRET=your_jwt_secret_key
```
*(If `DATABASE_URL` is omitted, the backend automatically fails over to the local JSON database `server/data/db.json`)*

### 3. Run Development Servers
```bash
# Start both frontend and backend concurrently
npm run dev
```

---

## 🧪 Testing and Verification
Ensure code is valid and does not introduce regression:
```bash
# Run client linter
npm run lint

# Run backend database checks (from server/ folder)
npx ts-node src/database/healthCheck.ts
npx ts-node src/database/verifyApiContracts.ts
npx ts-node src/database/verifyBuildPoints.ts
npx ts-node src/database/verifyInventory.ts
```
