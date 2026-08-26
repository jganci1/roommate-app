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
import { EventsPage } from './features/events/EventsPage'
import { SchedulePage } from './features/schedule/SchedulePage'
import { GuidePage } from './features/guide/GuidePage'
import { HandoffPage } from './features/handoff/HandoffPage'
import { JournalPage } from './features/journal/JournalPage'
import { RequireHousehold } from './household/RequireHousehold'
import { OnboardingPage } from './household/OnboardingPage'
import { HouseholdPage } from './household/HouseholdPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route element={<RequireHousehold />}>
              <Route element={<AppLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/supplies" element={<SupplyListPage />} />
                <Route path="/contacts" element={<ContactsPage />} />
                <Route path="/requests" element={<RequestsPage />} />
                <Route path="/bills" element={<BillsPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="/guide" element={<GuidePage />} />
                <Route path="/handoff" element={<HandoffPage />} />
                <Route path="/journal" element={<JournalPage />} />
                <Route path="/household" element={<HouseholdPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
