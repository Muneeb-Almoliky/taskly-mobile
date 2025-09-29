# 📱 Taskly Mobile

Taskly Mobile is the React Native client for the [Taskly API](https://github.com/Muneeb-Almoliky/task-manager-app-api), a full-stack task management app.  
Built with **Expo**, **React Native**, and **Expo Router**, it connects to the backend to let users create, manage, and track their tasks seamlessly on mobile devices.

---

## 🚀 Features
- View and manage tasks synced with the backend
- Create tasks with optional due dates
- Manage your profile and update your picture
- Dark/Light theme support
- Cross-platform: Android, iOS, and Web (via Expo)

---

## 📦 Setup & Installation

> **Note:** The [Taskly API (Backend)](https://github.com/Muneeb-Almoliky/task-manager-app-api) must be set up and running before using this mobile app.  
> You can use the local setup or a deployed backend URL.

1. Clone this repository:
   ```bash
   git clone https://github.com/Muneeb-Almoliky/taskly-mobile.git
   cd taskly-mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the project and configure the backend URL:

   ```bash
   # For local development
   EXPO_PUBLIC_API_BASE_URL=http://localhost:5000

   # Or for a deployed backend
   # EXPO_PUBLIC_API_BASE_URL=https://your-deployed-backend.com
   ```
4. Start the development server:
   ```bash
   npx expo start --port 3000
   ```

## 🔗 Related Repositories

- [Taskly API (Backend)](https://github.com/Muneeb-Almoliky/task-manager-app-api) — Central backend that powers both the web and mobile clients.  
- [Taskly Web Client](https://github.com/Muneeb-Almoliky/taskly-web) — The original web interface for Taskly, built before the mobile app.
