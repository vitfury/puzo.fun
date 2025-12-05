import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { VersionDisplay } from './components/VersionDisplay';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { GenresPage } from './pages/GenresPage';
import { PointsHistoryPage } from './pages/PointsHistoryPage';
import { ShopPage } from './pages/ShopPage';
import { RatingPage } from './pages/RatingPage';
import { StreaksPage } from './pages/StreaksPage';
import OnboardingPage from './pages/OnboardingPage';
import AdminPage from './pages/admin/AdminPage';
import AdminGenresPage from './pages/admin/AdminGenresPage';
import AdminActivitiesPage from './pages/admin/AdminActivitiesPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import LocalizationEditorPage from './pages/admin/LocalizationEditorPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activities"
              element={
                <ProtectedRoute>
                  <ActivitiesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/genres"
              element={
                <ProtectedRoute>
                  <GenresPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/points"
              element={
                <ProtectedRoute>
                  <PointsHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shop"
              element={
                <ProtectedRoute>
                  <ShopPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rating"
              element={
                <ProtectedRoute>
                  <RatingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/streaks"
              element={
                <ProtectedRoute>
                  <StreaksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/genres"
              element={
                <AdminRoute>
                  <AdminGenresPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/activities"
              element={
                <AdminRoute>
                  <AdminActivitiesPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/localization"
              element={
                <AdminRoute>
                  <LocalizationEditorPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminRoute>
                  <AdminSettingsPage />
                </AdminRoute>
              }
            />
            <Route path="/" element={<Navigate to="/activities" replace />} />
          </Routes>
          <VersionDisplay />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
