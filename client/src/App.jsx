import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Layout from "./components/layout/Layout.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";

// Pages
import HomePage from "./pages/HomePage.jsx";
import MovieDetailPage from "./pages/MovieDetailPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import EditProfilePage from "./pages/EditProfilePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import WatchlistPage from "./pages/WatchlistPage.jsx";
import FeedPage from "./pages/FeedPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public auth pages (redirect to home if already logged in) */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
      />

      {/* Main layout routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="movie/:id" element={<MovieDetailPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="user/:username" element={<ProfilePage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="feed" element={<FeedPage />} />
          <Route path="watchlist" element={<WatchlistPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<EditProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
