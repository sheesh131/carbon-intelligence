import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./app/auth/login-page"
import DashboardLayout from "./components/layout/dashboard-layout"
import { ThemeProvider } from "./theme/theme-provider"
import LandingPage from "./app/landing-page"
import { AuthGuard } from "./components/auth/auth-guard"

import DashboardOverview from "./app/dashboard/overview"

// Placeholder pages for now
import PredictionPage from "./app/dashboard/prediction/prediction-page"
import AnalyticsPage from "./app/dashboard/analytics/analytics-page"
import SustainabilityPage from "./app/dashboard/sustainability/sustainability-page"
import FederatedPage from "./app/dashboard/federated/federated-page"
import ExplainabilityPage from "./app/dashboard/explainability/explainability-page"
import SecurityPage from "./app/dashboard/security/security-page"
import SettingsPage from "./app/dashboard/settings/settings-page"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <DashboardLayout />
              </AuthGuard>
            }
          >
            <Route index element={<DashboardOverview />} />
            <Route path="prediction" element={<PredictionPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="explainability" element={<ExplainabilityPage />} />
            <Route path="sustainability" element={<SustainabilityPage />} />
            <Route path="federated" element={<FederatedPage />} />
            <Route path="security" element={<SecurityPage />} />
            <Route path="settings" element={<SettingsPage />} />
            {/* Add other routes here */}
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
