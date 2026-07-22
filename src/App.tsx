import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { LoginPage } from './auth/LoginPage'
import { SignupPage } from './auth/SignupPage'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { CalendarPage } from './features/calendar/CalendarPage'
import { SupplyListPage } from './features/supplies/SupplyListPage'
import { ContactsPage } from './features/contacts/ContactsPage'
import { RequestsPage } from './features/requests/RequestsPage'
import { BillsPage } from './features/bills/BillsPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/supplies" element={<SupplyListPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/requests" element={<RequestsPage />} />
              <Route path="/bills" element={<BillsPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
