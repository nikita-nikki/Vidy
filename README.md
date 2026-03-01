#  Vidy - Video Hosting Platform

A full-stack YouTube-like video hosting platform built with modern web technologies. This project demonstrates enterprise-level backend development practices including RESTful API design, JWT authentication, file uploads, database management, and cloud storage integration.

##  Live Links

- **Frontend Application**: [https://vidy-six.vercel.app/](https://vidy-six.vercel.app/)
- **Backend API**: [https://vidy.onrender.com](https://vidy.onrender.com)
- **📚 API Documentation**: [View Complete API Reference Below](#api-documentation)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [API Documentation](#api-documentation)
- [Setup](#setup)
- [Running the Application](#running-the-application)

---

##  Features

###  Authentication & Authorization
- User registration and login with JWT-based authentication
- Access and refresh token mechanism with secure cookie management
- Password hashing with bcrypt
- Password change functionality

###  Video Management
- Upload videos with thumbnails to cloud storage
- Video metadata management (title, description, duration)
- Video publishing/unpublishing toggle
- View tracking and analytics
- Video pagination, filtering, and search functionality

###  Social Features
- Like/Dislike videos, comments, and tweets
- Comment system with nested replies
- Subscribe/Unsubscribe to channels
- User playlists creation and management
- Watch history tracking
- Channel profile pages with subscriber counts

###  Additional Features
- User profiles with avatars and cover images
- Dashboard analytics for channel owners
- Tweet functionality (social media posts)
- Health check endpoints for monitoring
- Cloudinary integration for media storage

---

##  Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcrypt for password hashing
- **File Upload**: Multer
- **Cloud Storage**: Cloudinary
- **Other**: CORS, Cookie-parser, mongoose-aggregate-paginate-v2

### Frontend
- **Framework**: React.js
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **HTTP Client**: Axios

---

##  System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │     React Frontend (Vite + React Router)            │   │
│  │     • User Interface Components                       │   │
│  │     • State Management                                │   │
│  │     • API Integration (Axios)                        │   │
│  └───────────────────┬──────────────────────────────────┘   │
└──────────────────────┼──────────────────────────────────────┘
                       │ HTTP/HTTPS (REST API)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  API GATEWAY LAYER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Express.js Server (Node.js)                  │   │
│  │                                                       │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │         Middleware Stack                     │    │   │
│  │  │  • CORS Handler                              │    │   │
│  │  │  • Body Parser                               │    │   │
│  │  │  • Cookie Parser                             │    │   │
│  │  │  • JWT Authentication                         │    │   │
│  │  │  • File Upload (Multer)                       │    │   │
│  │  └──────────────────┬───────────────────────────┘    │   │
│  │                     │                                 │   │
│  │  ┌──────────────────▼───────────────────────────┐    │   │
│  │  │         Route Handlers                        │    │   │
│  │  │  • /api/v1/users                              │    │   │
│  │  │  • /api/v1/videos                             │    │   │
│  │  │  • /api/v1/comments                           │    │   │
│  │  │  • /api/v1/likes                              │    │   │
│  │  │  • /api/v1/subscriptions                      │    │   │
│  │  │  • /api/v1/playlist                           │    │   │
│  │  │  • /api/v1/tweets                             │    │   │
│  │  │  • /api/v1/dashboard                          │    │   │
│  │  └──────────────────┬───────────────────────────┘    │   │
│  │                     │                                 │   │
│  │  ┌──────────────────▼───────────────────────────┐    │   │
│  │  │         Controllers                          │    │   │
│  │  │  • Data Validation                            │    │   │
│  │  │  • Error Handling                             │    │   │
│  │  │  • Response Formatting                        │    │   │
│  │  └──────────────────┬───────────────────────────┘    │   │
│  └─────────────────────┼─────────────────────────────────┘   │
└────────────────────────┼─────────────────────────────────────┘
                         │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
    ┌─────────────────┐     ┌─────────────────┐
    │   DATA LAYER    │     │  EXTERNAL APIS  │
    │                 │     │                 │
    │   MongoDB       │     │   Cloudinary    │
    │   • Users       │     │   • Videos      │
    │   • Videos      │     │   • Images      │
    │   • Comments    │     │   • Thumbnails  │
    │   • Likes       │     │                 │
    │   • Subscriptions│    │                 │
    │   • Playlists   │     │                 │
    │   • Tweets      │     │                 │
    └─────────────────┘     └─────────────────┘
```

### Database Schema Relationships

```
    ┌──────────┐              ┌──────────┐              ┌──────────┐
    │   USER   │─────────────▶│  VIDEO   │◀─────────────│ COMMENT  │
    └──────────┘              └──────────┘              └──────────┘
         │                         │                          │
         │                         │                          │
         ├─────────────────────────┼──────────────────────────┤
         │                         │                          │
         ▼                         ▼                          ▼
    ┌──────────┐              ┌──────────┐              ┌──────────┐
    │SUBSCRIPTION│            │ PLAYLIST │              │   LIKE   │
    └──────────┘              └──────────┘              └──────────┘
         │                         │
         │                         │
         ▼                         ▼
    ┌──────────┐              ┌──────────┐
    │  TWEET   │              │DASHBOARD │
    └──────────┘              └──────────┘
```

### Request Flow

```
    User Action
         │
         ▼
    Frontend (React)
         │
         │ HTTP Request
         ▼
    Express Server
         │
         ▼
    Middleware Stack
    • Auth Validation
    • Request Parsing
         │
         ▼
    Controller Layer
    • Business Logic
    • Data Validation
         │
         ├──────────────┐
         │              │
         ▼              ▼
    MongoDB         Cloudinary
    (Data Ops)      (File Storage)
         │              │
         └──────┬───────┘
                │
                ▼
    Response Formatted
                │
                ▼
    Frontend (UI Updated)
```

---

##  API Documentation

### Base URL
```
Development: http://localhost:8000/api/v1
Production: https://vidy.onrender.com/api/v1
```

### Authentication
Most endpoints require JWT authentication. Include the access token in cookies (automatically handled by browser) or as a Bearer token:
```
Authorization: Bearer <access_token>
```

### Response Format
All API responses follow a consistent format:

**Success Response:**
```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Success message",
  "success": true
}
```

**Error Response:**
```json
{
  "statusCode": 400,
  "message": "Error message",
  "success": false,
  "errors": []
}
```

---

###  Health Check

#### `GET /api/v1/healthcheck`
Check server health status.

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "status": "OK",
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "message": "Server is healthy",
  "success": true
}
```

---

###  User Endpoints

#### `POST /api/v1/users/register`
Register a new user.

**Request Body (multipart/form-data):**
- `fullName` (string, required)
- `email` (string, required)
- `username` (string, required)
- `password` (string, required)
- `avatar` (file, required)
- `coverImage` (file, optional)

**Response (201):**
```json
{
  "statusCode": 201,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "avatar": "https://res.cloudinary.com/.../avatar.jpg"
  },
  "message": "User registered Successfully",
  "success": true
}
```

#### `POST /api/v1/users/login`
User login.

**Request Body:**
```json
{
  "email": "john@example.com",
  "username": "johndoe",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User logged In Successfully",
  "success": true
}
```

#### `GET /api/v1/users/current-user`
Get current authenticated user details.

**Headers:** `Authorization: Bearer <token>`

#### `PATCH /api/v1/users/update-account`
Update user account details.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "fullName": "John Updated",
  "email": "newemail@example.com"
}
```

#### `PATCH /api/v1/users/avatar`
Update user avatar.

**Headers:** `Authorization: Bearer <token>`

**Request Body (multipart/form-data):**
- `avatar` (file, required)

#### `GET /api/v1/users/c/:username`
Get channel profile with subscriber count.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "username": "johndoe",
    "fullName": "John Doe",
    "avatar": "https://res.cloudinary.com/.../avatar.jpg",
    "subscribersCount": 150,
    "channelsSubscribedToCount": 25,
    "isSubscribed": false
  },
  "message": "User channel fetched successfully",
  "success": true
}
```

#### `GET /api/v1/users/history`
Get user's watch history.

**Headers:** `Authorization: Bearer <token>`

#### `POST /api/v1/users/logout`
Logout user and clear tokens.

**Headers:** `Authorization: Bearer <token>`

#### `POST /api/v1/users/refresh-token`
Refresh access token using refresh token.

#### `POST /api/v1/users/change-password`
Change user password.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "oldPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

---

###  Video Endpoints

#### `GET /api/v1/videos`
Get all videos with pagination and filtering.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `query` (string, optional) - Search query for title/description
- `sortBy` (string, default: createdAt) - Field to sort by
- `sortType` (string, default: desc) - Sort order (asc/desc)
- `userId` (string, optional) - Filter videos by user ID

**Response (200):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Sample Video",
      "description": "Video description",
      "thumbnail": "https://res.cloudinary.com/.../thumb.jpg",
      "duration": 300,
      "views": 1000,
      "owner": {
        "username": "johndoe",
        "fullName": "John Doe",
        "avatar": "https://res.cloudinary.com/.../avatar.jpg"
      }
    }
  ],
  "message": "Video fetched successfully.",
  "success": true
}
```

#### `POST /api/v1/videos`
Upload a new video.

**Headers:** `Authorization: Bearer <token>`

**Request Body (multipart/form-data):**
- `title` (string, required)
- `description` (string, required)
- `videoFile` (file, required)
- `thumbnail` (file, required)

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "videoFile": "https://res.cloudinary.com/.../video.mp4",
    "thumbnail": "https://res.cloudinary.com/.../thumb.jpg",
    "title": "My Awesome Video",
    "description": "This is a great video",
    "duration": 300,
    "views": 0,
    "isPublished": true
  },
  "message": "Video has been uploaded successfully.",
  "success": true
}
```

#### `GET /api/v1/videos/:videoId`
Get video by ID (increments view count).

**Headers:** `Authorization: Bearer <token>`

#### `PATCH /api/v1/videos/:videoId`
Update video details (title, description, thumbnail).

**Headers:** `Authorization: Bearer <token>`

#### `DELETE /api/v1/videos/:videoId`
Delete a video (only by owner).

**Headers:** `Authorization: Bearer <token>`

#### `PATCH /api/v1/videos/toggle/publish/:videoId`
Toggle video publish/unpublish status.

**Headers:** `Authorization: Bearer <token>`

---

###  Comment Endpoints

#### `GET /api/v1/comments/:videoId`
Get all comments for a video.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)

#### `POST /api/v1/comments/:videoId`
Add a comment to a video.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "This is a great video!"
}
```

#### `PATCH /api/v1/comments/c/:commentId`
Update a comment (only by owner).

**Headers:** `Authorization: Bearer <token>`

#### `DELETE /api/v1/comments/c/:commentId`
Delete a comment (only by owner).

**Headers:** `Authorization: Bearer <token>`

---

###  Like Endpoints

#### `POST /api/v1/likes/toggle/v/:videoId`
Toggle like on a video.

**Headers:** `Authorization: Bearer <token>`

#### `POST /api/v1/likes/toggle/c/:commentId`
Toggle like on a comment.

**Headers:** `Authorization: Bearer <token>`

#### `POST /api/v1/likes/toggle/t/:tweetId`
Toggle like on a tweet.

**Headers:** `Authorization: Bearer <token>`

#### `GET /api/v1/likes/videos`
Get all videos liked by current user.

**Headers:** `Authorization: Bearer <token>`

---

###  Subscription Endpoints

#### `POST /api/v1/subscriptions/c/:channelId`
Subscribe or unsubscribe to a channel.

**Headers:** `Authorization: Bearer <token>`

#### `GET /api/v1/subscriptions/c/:channelId`
Get list of subscribers for a channel.

**Headers:** `Authorization: Bearer <token>`

#### `GET /api/v1/subscriptions/u/:subscriberId`
Get channels subscribed by a user.

**Headers:** `Authorization: Bearer <token>`

---

###  Playlist Endpoints

#### `POST /api/v1/playlist`
Create a new playlist.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "My Favorite Videos",
  "description": "Collection of my favorite videos"
}
```

#### `GET /api/v1/playlist/:playlistId`
Get playlist by ID with videos.

**Headers:** `Authorization: Bearer <token>`

#### `GET /api/v1/playlist/user/:userId`
Get all playlists created by a user.

**Headers:** `Authorization: Bearer <token>`

#### `PATCH /api/v1/playlist/:playlistId`
Update playlist name or description.

**Headers:** `Authorization: Bearer <token>`

#### `PATCH /api/v1/playlist/add/:videoId/:playlistId`
Add video to playlist.

**Headers:** `Authorization: Bearer <token>`

#### `PATCH /api/v1/playlist/remove/:videoId/:playlistId`
Remove video from playlist.

**Headers:** `Authorization: Bearer <token>`

#### `DELETE /api/v1/playlist/:playlistId`
Delete a playlist.

**Headers:** `Authorization: Bearer <token>`

---

###  Tweet Endpoints

#### `POST /api/v1/tweets`
Create a new tweet.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "This is my tweet!"
}
```

#### `GET /api/v1/tweets/feed`
Get feed of all tweets.

**Headers:** `Authorization: Bearer <token>`

#### `GET /api/v1/tweets/user/:userId`
Get all tweets by a specific user.

**Headers:** `Authorization: Bearer <token>`

#### `PATCH /api/v1/tweets/:tweetId`
Update a tweet (only by owner).

**Headers:** `Authorization: Bearer <token>`

#### `DELETE /api/v1/tweets/:tweetId`
Delete a tweet (only by owner).

**Headers:** `Authorization: Bearer <token>`

---

###  Dashboard Endpoints

#### `GET /api/v1/dashboard/stats`
Get channel statistics and analytics.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "totalVideos": 25,
    "totalViews": 50000,
    "totalSubscribers": 150,
    "totalLikes": 1200
  },
  "message": "Dashboard stats fetched successfully",
  "success": true
}
```

#### `GET /api/v1/dashboard/videos`
Get all videos for the current user's channel.

**Headers:** `Authorization: Bearer <token>`

---

## 🚀 Setup

### Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)
- **Cloudinary Account** - [Sign up for free](https://cloudinary.com/)

### Step 1: Clone the Repository

```bash
git clone https://github.com/nikita-nikki/Vidy.git
cd Vidy
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd chai-backend

# Install dependencies
npm install
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

---

### ⚙️ Environment Configuration

#### Backend Environment Variables

Create a `.env` file in the `chai-backend` directory:

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database Configuration
MONGODB_URI=your_mongodb_connection_string
# Example: mongodb://localhost:27017/vidy
# Or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/vidy

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# JWT Configuration
ACCESS_TOKEN_SECRET=your_super_secret_access_token_key_here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_here
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

#### Generate JWT Secrets

Generate secure random strings for your JWT secrets:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### MongoDB Setup

**Option 1: Local MongoDB**
1. Install MongoDB locally from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/vidy`

**Option 2: MongoDB Atlas (Recommended)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist your IP address
5. Get connection string from "Connect" → "Connect your application"

#### Cloudinary Setup

1. Sign up for a free account at [Cloudinary](https://cloudinary.com/)
2. Navigate to Dashboard
3. Copy your Cloud Name, API Key, and API Secret
4. Add them to your `.env` file

---

##  Running the Application

### Development Mode

#### Backend

```bash
cd chai-backend
npm run dev
# Server will start on http://localhost:8000
```

#### Frontend

```bash
cd frontend
npm run dev
# Frontend will start on http://localhost:3000 (or available port)
```

### Production Mode

#### Backend

```bash
cd chai-backend
npm start
```

#### Frontend

```bash
cd frontend
npm run build
npm run preview
```

### Testing API Endpoints

You can test the API using:

- **cURL**: Command-line tool
- **Postman**: Import the API endpoints
- **Thunder Client**: VS Code extension
- **Browser**: For GET requests

Example:
```bash
# Health check
curl http://localhost:8000/api/v1/healthcheck
```

---

##  Project Structure

```
Vidy/
├── chai-backend/          # Backend application
│   ├── src/
│   │   ├── controllers/   # Business logic handlers
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API route definitions
│   │   ├── middlewares/   # Custom middleware (auth, multer)
│   │   ├── utils/         # Utility functions
│   │   ├── db/            # Database configuration
│   │   ├── app.js          # Express app configuration
│   │   └── index.js        # Application entry point
│   └── package.json
│
└── frontend/              # Frontend application
    ├── src/
    │   ├── api/           # API client functions
    │   ├── components/    # React components
    │   ├── pages/         # Page components
    │   ├── App.jsx        # Main app component
    │   └── main.jsx       # Entry point
    └── package.json
```

---

##  Author

**Nikita**

- GitHub: [@nikita-nikki](https://github.com/nikita-nikki)
- Project Link: [https://github.com/nikita-nikki/Vidy](https://github.com/nikita-nikki/Vidy)

---

##  License

This project is licensed under the ISC License.

---
