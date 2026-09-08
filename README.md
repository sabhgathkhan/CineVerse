# 🎬 CineVerse

> **A full-stack social movie discovery and review platform** — built with the MERN stack, featuring a modern dark UI, JWT authentication, social features, and live movie data from TMDB.

![CineVerse Banner](https://via.placeholder.com/1200x400/0a0a0f/c044ef?text=CineVerse+%E2%80%94+Discover+%7C+Review+%7C+Connect)

---

## ✨ Features

### 🎥 Movie Discovery
- Browse **Trending, Popular, Top Rated, Upcoming** and **Now Playing** movies
- Full movie detail pages with cast, trailer embed, similar movies
- Search movies by title with real-time results
- Filter movies by genre with pagination

### 🌟 Social Features
- **Follow / Unfollow** other users
- **Social Feed** — see reviews from people you follow
- **User Search** with genre-preference filter
- **Notifications** for follows, likes, and comments

### 📝 Reviews & Comments
- Write reviews with star ratings (0.5 precision) and spoiler warnings
- **Like / Unlike** reviews
- **Comment** on reviews — with full **edit and delete** support
- Prevent duplicate reviews (one per user per movie)

### 👤 User Profiles
- Profile stats: review count, average rating, followers, following, watchlist size
- Favorite genre badges
- Public watchlist
- Followers / Following tabs with live counts
- Avatar URL with initials fallback

### 🔖 Watchlist
- Add / remove movies with one click
- Dedicated watchlist page with remove-on-hover UI

### 🔒 Auth & Security
- JWT authentication (Bearer token, 7-day expiry)
- Bcrypt password hashing (12 rounds)
- Rate limiting (100 req / 15 min)
- Helmet.js security headers
- Input validation on all endpoints
- Environment variables — no secrets committed

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS |
| **State / Auth** | React Context API, localStorage (JWT) |
| **HTTP Client** | Axios with request interceptors |
| **Backend** | Node.js, Express.js (ES Modules) |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT) |
| **Movie Data** | TMDB (The Movie Database) API |
| **Security** | Helmet, CORS, express-rate-limit, bcryptjs |

---

## 📁 Project Structure

```
cineverse/
├── client/                     # React frontend (Vite)
│   └── src/
│       ├── api/                # Axios modules per domain
│       │   ├── apiClient.js    # Base axios instance + interceptors
│       │   ├── authAPI.js
│       │   ├── movieAPI.js
│       │   └── index.js        # reviewAPI + userAPI
│       ├── components/
│       │   ├── common/         # Shared UI: Avatar, Spinner, EmptyState, Stars
│       │   ├── layout/         # Navbar, Layout wrapper
│       │   └── movie/          # MovieCard, MovieGrid, ReviewCard, CommentSection, ReviewForm
│       ├── context/
│       │   └── AuthContext.jsx # Global auth state + helpers
│       ├── hooks/
│       │   ├── useFetch.js     # Generic data-fetch hook
│       │   └── useDebounce.js  # Search input debouncing
│       ├── pages/              # Route-level page components
│       └── utils/
│           └── helpers.js      # TMDB image URLs, date formatting, etc.
│
└── server/                     # Express API
    ├── config/
    │   └── db.js               # MongoDB connection
    ├── controllers/            # Business logic per domain
    ├── middleware/             # Auth guard, error handler, validation
    ├── models/                 # Mongoose schemas (User, Review)
    ├── routes/                 # Express routers
    └── utils/
        ├── tmdbService.js      # TMDB API wrapper
        └── tokenUtils.js       # JWT sign/verify helpers
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier)
- TMDB API key — free at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)

---

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/cineverse.git
cd cineverse
npm install         # install root devDeps (concurrently)
cd server && npm install
cd ../client && npm install
```

Or use the convenience script:

```bash
npm run install:all
```

---

### 2. Configure Environment Variables

```bash
cd server
cp .env.example .env
```

Open `server/.env` and fill in:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/cineverse
JWT_SECRET=your_long_random_secret_here
TMDB_API_KEY=your_tmdb_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
CLIENT_ORIGIN=http://localhost:5173
```

> ⚠️ **Never commit `.env` to git.** It's already in `.gitignore`.

---

### 3. Run in Development

```bash
# From the project root — starts both server and client
npm run dev
```

| Service | URL |
|---|---|
| React app | http://localhost:5173 |
| Express API | http://localhost:5000 |
| API health check | http://localhost:5000/api/health |

---

### 4. Production Build

```bash
# Build the React app
npm run build

# Start the Express server (serves the built frontend too if configured)
npm start
```

---

## 🗺 API Endpoints

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Private |

### Movies (TMDB Proxy)
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/movies/trending` | Public |
| GET | `/api/movies/popular` | Public |
| GET | `/api/movies/top-rated` | Public |
| GET | `/api/movies/upcoming` | Public |
| GET | `/api/movies/search?q=...` | Public |
| GET | `/api/movies/genres` | Public |
| GET | `/api/movies/:id` | Public |
| POST | `/api/movies/:id/like` | Private |
| POST | `/api/movies/:id/watchlist` | Private |

### Reviews
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/reviews/feed` | Private |
| GET | `/api/reviews/movie/:movieId` | Public |
| GET | `/api/reviews/user/:userId` | Public |
| POST | `/api/reviews` | Private |
| PUT | `/api/reviews/:id` | Private (owner) |
| DELETE | `/api/reviews/:id` | Private (owner) |
| POST | `/api/reviews/:id/like` | Private |
| POST | `/api/reviews/:id/comments` | Private |
| PUT | `/api/reviews/:id/comments/:commentId` | Private (owner) |
| DELETE | `/api/reviews/:id/comments/:commentId` | Private (owner) |

### Users
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/users/search?q=...&genre=...` | Public |
| GET | `/api/users/:username` | Public |
| PUT | `/api/users/profile` | Private |
| POST | `/api/users/:id/follow` | Private |
| GET | `/api/users/me/notifications` | Private |
| PUT | `/api/users/me/notifications/read` | Private |
| GET | `/api/users/:id/watchlist` | Public |

---

## 🔐 Security Checklist

- [x] No `.env` files committed — `.gitignore` enforced
- [x] No API keys or secrets in source code
- [x] Passwords hashed with bcrypt (12 salt rounds)
- [x] JWT stored only in `Authorization` header (no cookies)
- [x] Password field excluded from all DB queries (`select: false`)
- [x] HTTP security headers via Helmet.js
- [x] Rate limiting on all API routes
- [x] CORS restricted to allowed origin
- [x] Mongoose duplicate key errors handled gracefully
- [x] Owner-only enforcement on edit/delete operations

---

## 🎨 Design System

The UI uses a custom Tailwind palette with a **dark purple** brand identity:

| Token | Usage |
|---|---|
| `brand-400` — `#d971f8` | Accents, links, active states |
| `brand-600` — `#a21bcb` | Buttons, badges |
| `dark-900` — `#0a0a0f` | Page background |
| `dark-800` — `#111118` | Cards |
| `dark-700` — `#1a1a26` | Inputs, secondary surfaces |

Reusable CSS classes defined in `index.css`: `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.card`, `.input-field`, `.badge`

---

## 📸 Screenshots

> _Add screenshots here after running the project locally._

| Home | Movie Detail | Profile |
|---|---|---|
| ![Home](./screenshots/home.png) | ![Detail](./screenshots/detail.png) | ![Profile](./screenshots/profile.png) |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push and open a Pull Request

---

## 📄 License

[MIT](./LICENSE)

---

## 👤 Author

**Your Name**
- GitHub: [@sabhgathkhan](https://github.com/sabhgathkhan)
- LinkedIn: [linkedin.com/in/sabhgath_khan](https://linkedin.com/in/sabhgath-khan)

---

> Movie data provided by [The Movie Database (TMDB)](https://www.themoviedb.org/).  
> This product uses the TMDB API but is not endorsed or certified by TMDB.
