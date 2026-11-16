import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth'
import Layout from './components/Layout'
import { LoginPage, RegisterPage } from './pages/AuthPages'
import ForecastPage from './pages/ForecastPage'
import HomePage from './pages/HomePage'
import NotFoundPage, { PrivacyPage } from './pages/NotFoundPage'
import RoutesPage from './pages/RoutesPage'
import SubscribePage from './pages/SubscribePage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="forecast" element={<ForecastPage />} />
            <Route path="routes" element={<RoutesPage />} />
            <Route path="routes/new" element={<SubscribePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
