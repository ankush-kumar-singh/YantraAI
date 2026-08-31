# Sovereign Simulator Setup & Running Guide

This guide describes how to perform the first-time setup and run both the frontend and the mock backend simulator locally.

---

## 📋 Prerequisites

Before proceeding, ensure you have the following installed on your machine:
* **Node.js** (v18 or higher recommended)
* **npm** (comes bundled with Node.js) or **Bun** (optional, recommended for frontend development)

---

## 🛠️ First-Time Setup

To get started, you must install the dependencies for both the backend and frontend components.

### 1. Backend Setup
The backend requires a few Node.js packages (e.g., `express`, `ws`, `cors`, `multer`) defined in [sentinal-backend_simulated/package.json](file:///d:/Santinal/sentinal-backend_simulated/package.json).

Navigate to the `sentinal-backend_simulated` directory and install the packages:
```bash
cd sentinal-backend_simulated
npm install
```

### 2. Frontend Setup
The React/Vite frontend uses dependencies defined in [Sentinal-frontend/package.json](file:///d:/Santinal/Sentinal-frontend/package.json). You can install them using either `npm` or `bun`:

* **Option A: Using npm**
  ```bash
  cd Sentinal-frontend
  npm install
  ```

* **Option B: Using Bun**
  ```bash
  cd Sentinal-frontend
  bun install
  ```

---

## 🚀 Running the Services

After the first-time setup is complete, you can start the backend and frontend applications. For the best experience, start the backend first.

### 1. Run the Mock Backend
Navigate to the `sentinal-backend_simulated` folder and start the server:
```bash
cd sentinal-backend_simulated
npm start
```
*(Alternatively, you can run `node server.js` directly: see [server.js](file:///d:/Santinal/sentinal-backend_simulated/server.js))*

* **REST Endpoints:** `http://localhost:8080/api`
* **WebSocket Endpoint:** `ws://localhost:8080/ws`

### 2. Run the Frontend React Application
Navigate to the `Sentinal-frontend` folder and start the Vite development server:

* **Using npm:**
  ```bash
  cd Sentinal-frontend
  npm run dev
  ```

* **Using Bun:**
  ```bash
  cd Sentinal-frontend
  bun run dev
  ```

* **Web Access URL:** `http://localhost:3000`
* **Note:** Enforce air-gap client socket integration.

---

## 🛑 Stopping the Services

To stop either the mock backend or the frontend dev server, press `Ctrl + C` in their respective terminal windows (and confirm with `Y` if prompted).

