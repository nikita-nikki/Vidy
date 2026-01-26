# Vidy - Video Hosting Platform Backend

A complete backend application for a YouTube-like video hosting platform built with Node.js and Express.js. This project demonstrates modern backend development practices including JWT authentication, file uploads, database management, and RESTful API design.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Running the Application](#running-the-application)
- [Contributing](#contributing)
- [Resources](#resources)

## ✨ Features

- **User Authentication & Authorization**
  - User registration and login
  - JWT-based authentication with access and refresh tokens
  - Password hashing with bcrypt
  - Secure cookie-based token management

- **Video Management**
  - Upload videos with thumbnails
  - Video metadata (title, description, duration)
  - Video publishing/unpublishing
  - View tracking
  - Video pagination and aggregation

- **Social Features**
  - Like/Dislike videos
  - Comment system with replies
  - Subscribe/Unsubscribe to channels
  - User playlists
  - Watch history tracking

- **Additional Features**
  - User profiles with avatars and cover images
  - Dashboard analytics
  - Tweet functionality
  - Health check endpoints
  - Cloudinary integration for media storage

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcrypt for password hashing
- **File Upload**: Multer
- **Cloud Storage**: Cloudinary
- **Other Libraries**:
  - CORS for cross-origin requests
  - Cookie-parser for cookie management
  - mongoose-aggregate-paginate-v2 for pagination

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)
- Cloudinary account (for media storage)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nikita-nikki/Vidy
   cd vidy
   ```

2. **Navigate to the backend directory**
   ```bash
   cd chai-backend
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   Create a `.env` file in the `chai-backend` directory with the following variables:
   ```env
   PORT=8000
   MONG0DB_URI=your_mongodb_connection_string
   CORS_ORIGIN=http://localhost:3000
   
   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=10d
   
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

## ⚙️ Configuration

### MongoDB Setup

You can use either:
- **Local MongoDB**: Install MongoDB locally and use `mongodb://localhost:27017/videotube`
- **MongoDB Atlas**: Create a free cluster and use the connection string provided

### Cloudinary Setup

1. Sign up for a free account at [Cloudinary](https://cloudinary.com/)
2. Get your cloud name, API key, and API secret from the dashboard
3. Add them to your `.env` file

## 📡 API Endpoints

### Health Check
- `GET /api/v1/healthcheck` - Server health status

### User Routes (`/api/v1/users`)
- `POST /register` - Register a new user
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /refresh-token` - Refresh access token
- `GET /current-user` - Get current user details
- `PATCH /update-account` - Update user account
- `PATCH /update-avatar` - Update user avatar
- `PATCH /update-cover-image` - Update cover image
- `GET /channel/:username` - Get channel details
- `GET /watch-history` - Get user watch history

### Video Routes (`/api/v1/videos`)
- `POST /upload-video` - Upload a new video
- `GET /:videoId` - Get video by ID
- `PATCH /:videoId` - Update video details
- `DELETE /:videoId` - Delete a video
- `PATCH /toggle/publish/:videoId` - Toggle video publish status
- `GET /` - Get all videos (with pagination and filters)

### Comment Routes (`/api/v1/comments`)
- `POST /:videoId` - Add a comment to a video
- `PATCH /:commentId` - Update a comment
- `DELETE /:commentId` - Delete a comment
- `GET /video/:videoId` - Get all comments for a video

### Like Routes (`/api/v1/likes`)
- `POST /toggle/v/:videoId` - Toggle like on a video
- `POST /toggle/c/:commentId` - Toggle like on a comment
- `POST /toggle/t/:tweetId` - Toggle like on a tweet
- `GET /videos` - Get all liked videos
- `GET /comments` - Get all liked comments
- `GET /tweets` - Get all liked tweets

### Subscription Routes (`/api/v1/subscriptions`)
- `POST /:channelId` - Subscribe to a channel
- `DELETE /:channelId` - Unsubscribe from a channel
- `GET /user/:subscriberId` - Get user's subscriptions

### Playlist Routes (`/api/v1/playlist`)
- `POST /` - Create a new playlist
- `PATCH /:playlistId` - Update a playlist
- `DELETE /:playlistId` - Delete a playlist
- `POST /add/:videoId/:playlistId` - Add video to playlist
- `DELETE /remove/:videoId/:playlistId` - Remove video from playlist
- `GET /user/:userId` - Get user's playlists
- `GET /:playlistId` - Get playlist by ID

### Tweet Routes (`/api/v1/tweets`)
- `POST /` - Create a new tweet
- `GET /user/:userId` - Get user's tweets
- `PATCH /:tweetId` - Update a tweet
- `DELETE /:tweetId` - Delete a tweet

### Dashboard Routes (`/api/v1/dashboard`)
- `GET /stats` - Get channel statistics

## 📁 Project Structure

```
chai-backend/
├── src/
│   ├── controllers/        # Business logic handlers
│   │   ├── comment.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── healthcheck.controller.js
│   │   ├── like.controller.js
│   │   ├── playlist.controller.js
│   │   ├── subscription.controller.js
│   │   ├── tweet.controller.js
│   │   ├── user.controller.js
│   │   └── video.controller.js
│   ├── models/            # Mongoose schemas
│   │   ├── comment.model.js
│   │   ├── like.model.js
│   │   ├── playlist.model.js
│   │   ├── subscription.model.js
│   │   ├── tweet.model.js
│   │   ├── user.model.js
│   │   └── video.model.js
│   ├── routes/            # API route definitions
│   │   ├── comment.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── healthcheck.routes.js
│   │   ├── like.routes.js
│   │   ├── playlist.routes.js
│   │   ├── subscription.routes.js
│   │   ├── tweet.routes.js
│   │   ├── user.routes.js
│   │   └── video.routes.js
│   ├── middlewares/       # Custom middleware
│   │   ├── auth.middleware.js
│   │   └── multer.middleware.js
│   ├── utils/             # Utility functions
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   └── cloudinary.js
│   ├── db/                # Database configuration
│   │   └── index.js
│   ├── constants.js       # Application constants
│   ├── app.js             # Express app configuration
│   └── index.js           # Application entry point
├── public/                # Static files
│   └── temp/              # Temporary uploads
├── package.json
└── .env                   # Environment variables (create this)
```

## 🏃 Running the Application

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **The server will start on** `http://localhost:8000` (or the port specified in your `.env` file)

3. **Test the health check endpoint**
   ```bash
   curl http://localhost:8000/api/v1/healthcheck
   ```








---

**Note**: This project is part of a comprehensive backend development series. Make sure to follow along with the video tutorials for a complete understanding of the implementation.
