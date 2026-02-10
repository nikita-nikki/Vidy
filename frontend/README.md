## Vidy Frontend (Creator Dashboard)

This is a lightweight React + Vite frontend for the Vidy backend (`chai-backend`). It is designed as a **creator dashboard and API console** that integrates **all backend endpoints**, including those not fully documented in the root README.

### Tech

- **Vite + React + TypeScript**
- **React Router** for page-level navigation
- **Axios** for API calls (with `withCredentials: true`)

The UI uses a **light yellow and light green** palette, matching the requested theme.

### Pages and API Coverage

- **Auth & Profile (`/auth`)**
  - `POST /api/v1/users/register`
  - `POST /api/v1/users/login`
  - `POST /api/v1/users/logout`
  - `POST /api/v1/users/change-password`
  - `POST /api/v1/users/refresh-token` (wired via helper, not a separate form)
  - `GET /api/v1/users/current-user`
  - `PATCH /api/v1/users/update-account`
  - `PATCH /api/v1/users/avatar`
  - `PATCH /api/v1/users/cover-image`
  - `GET /api/v1/users/history`
  - `GET /api/v1/users/c/:username` (channel profile)

- **Videos (`/videos` and `/videos/:videoId`)**
  - `GET /api/v1/videos` (list with query/pagination params)
  - `POST /api/v1/videos` (upload with `videoFile` + `thumbnail`)
  - `GET /api/v1/videos/:videoId`
  - `PATCH /api/v1/videos/:videoId` (update metadata + optional thumbnail)
  - `DELETE /api/v1/videos/:videoId`
  - `PATCH /api/v1/videos/toggle/publish/:videoId`

- **Comments & Likes (`/videos/:videoId`, `/social`)**
  - `GET /api/v1/comments/:videoId`
  - `POST /api/v1/comments/:videoId`
  - `PATCH /api/v1/comments/c/:commentId`
  - `DELETE /api/v1/comments/c/:commentId`
  - `POST /api/v1/likes/toggle/v/:videoId`
  - `POST /api/v1/likes/toggle/c/:commentId`
  - `POST /api/v1/likes/toggle/t/:tweetId`
  - `GET /api/v1/likes/videos`

- **Playlists (`/social`)**
  - `POST /api/v1/playlist`
  - `PATCH /api/v1/playlist/:playlistId`
  - `DELETE /api/v1/playlist/:playlistId`
  - `PATCH /api/v1/playlist/add/:videoId/:playlistId`
  - `PATCH /api/v1/playlist/remove/:videoId/:playlistId`
  - `GET /api/v1/playlist/user/:userId`
  - `GET /api/v1/playlist/:playlistId`

- **Subscriptions (`/social`)**
  - `POST /api/v1/subscriptions/c/:channelId` (toggle subscribe/unsubscribe)
  - `GET /api/v1/subscriptions/c/:channelId` (channel subscribers)
  - `GET /api/v1/subscriptions/u/:subscriberId` (user subscriptions)

- **Tweets (`/social`)**
  - `POST /api/v1/tweets`
  - `GET /api/v1/tweets/user/:userId`
  - `PATCH /api/v1/tweets/:tweetId`
  - `DELETE /api/v1/tweets/:tweetId`

- **Dashboard (`/dashboard`)**
  - `GET /api/v1/dashboard/stats`
  - `GET /api/v1/dashboard/videos`

- **Healthcheck (`/health`)**
  - `GET /api/v1/healthcheck`

### Running the Frontend

1. From the repo root:

   ```bash
   cd frontend
   npm install    # already run once, but safe to repeat
   npm run dev    # runs on http://localhost:3000
   ```

2. Ensure the backend is running (from `chai-backend`):

   ```bash
   npm run dev
   ```

3. Make sure your backend `.env` has:

   ```env
   CORS_ORIGIN=http://localhost:3000
   ```

The Axios client is configured with:

- `baseURL = http://localhost:8000/api/v1` (overridable via `VITE_API_BASE_URL`)
- `withCredentials: true` so that JWT cookies work as designed.

### Notes

- Some actions (e.g. playlist/user IDs, tweet owner IDs) expect you to paste a MongoDB `_id` from the backend data; this keeps the UI simple while still exercising **every** endpoint.
- Error messages from the backend are surfaced plainly in the UI so you can debug quickly.

