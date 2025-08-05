import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { Dashboard } from './pages/Dashboard';
import { RecordScreen } from './pages/RecordScreen';
import { VideoEditor } from './pages/VideoEditor';
import { VideoView } from './pages/VideoView';
import { Landing } from './pages/Landing';
import { Videos } from './pages/Videos';
import { SettingsPage } from './pages/Settings';
import { AuthLayout } from './components/AuthLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { updateMetaTags, pageSEOConfigs, defaultSEO } from "./utils/seo";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

function AppRoutes() {
  const location = useLocation();

  useEffect(() => {
      // Apply dark mode to all routes except dashboard routes
      const isDashboardRoute = location.pathname.startsWith("/dashboard");

      if (isDashboardRoute) {
          document.documentElement.classList.remove("dark");
      } else {
          document.documentElement.classList.add("dark");
      }

      // Update SEO meta tags based on current route
      const seoConfig = pageSEOConfigs[location.pathname] || defaultSEO;
      updateMetaTags(seoConfig);

      // Update canonical URL for current page
      if (seoConfig.canonicalUrl) {
          updateMetaTags({
              ...seoConfig,
              canonicalUrl: `${window.location.origin}${location.pathname}`,
          });
      }
  }, [location.pathname]);

  // Determine background class based on route
  const isDashboardRoute = location.pathname.startsWith('/dashboard');
  const backgroundClass = isDashboardRoute
    ? 'bg-gray-50'
    : 'bg-gray-900 dark:bg-gray-900';

  return (
    <div className={`min-h-screen w-full ${backgroundClass}`}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/video/:shareToken" element={<VideoView />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AuthLayout>
              <Dashboard />
            </AuthLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/record" element={
          <ProtectedRoute>
            <AuthLayout>
              <RecordScreen />
            </AuthLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/videos" element={
          <ProtectedRoute>
            <AuthLayout>
              <Videos />
            </AuthLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/settings" element={
          <ProtectedRoute>
            <AuthLayout>
              <SettingsPage />
            </AuthLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard/edit/:videoId" element={
          <ProtectedRoute>
            <AuthLayout>
              <VideoEditor />
            </AuthLayout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
    >
      <Router>
        <AppRoutes />
      </Router>
    </ClerkProvider>
  )
}

export default App
