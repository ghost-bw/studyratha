
# Ratha - Study Group Task Tracker

Ratha (meaning "Chariot") is a production-ready MERN Stack web application designed to help study groups track daily tasks, progress, and accountability.

## Tech Stacky
- **Frontend:** React.js (Vite), Tailwind CSS 4, Axios, React Router 7, Recharts, Lucide React, Context API.
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT, Google Auth Library, Cloudinary, Multer.

## Key Features
- **Authentication:** Email/Password Signup/Login & Google OAuth.
- **Study Groups:** Create groups, join via invite codes, and manage members.
- **Task Management:** Create, assign, and track daily tasks with priorities and deadlines.
- **Progress Tracking:** Dashboard with charts, completion rates, and status summaries.
- **Task Logs:** Upload images/screenshots and add notes when completing tasks.

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Cloudinary Account
- Google Cloud Console Project (for Google Login)

### 2. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create a `.env` file and fill in your credentials:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
3. Install dependencies and start the server:
   ```bash
   npm install
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the `vite-project` directory:
   ```bash
   cd vite-project
   ```
2. Update the Google Client ID in `src/pages/Login.jsx`.
3. Install dependencies and start the development server:
   ```bash
   npm install
   npm run dev
   ```

## Project Structure
- `backend/`: Express server, Mongoose models, controllers, and routes.
- `vite-project/`: React frontend with Tailwind CSS and Vite.
