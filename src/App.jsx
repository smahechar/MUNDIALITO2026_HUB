import { Routes, Route, Navigate } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'

// Auth
import { AuthProvider }  from '@/context/AuthContext'
import { PrivateRoute, AdminRoute } from '@/components/shared/PrivateRoute'

// Layouts
import PublicLayout from '@/layouts/PublicLayout'
import UserLayout   from '@/layouts/UserLayout'
import AdminLayout  from '@/layouts/AdminLayout'

// Pages — Public
import LoginPage        from '@/pages/Auth/Login'
import RegisterPage     from '@/pages/Auth/Register'
import ForgotPassword   from '@/pages/Auth/ForgotPassword'

// Pages — User
import HomePage       from '@/pages/Home'
import MatchesPage    from '@/pages/Matches'
import AgendaPage     from '@/pages/Agenda'
import PoolsPage      from '@/pages/Pools'
import PoolDetailPage from '@/pages/Pools/PoolDetail'
import PredictPage    from '@/pages/Pools/PredictPage'
import NewPoolPage    from '@/pages/Pools/NewPoolPage'
import Agenda from "./pages/Agenda";

// Pages — Match detail
import MatchDetailPage from '@/pages/MatchDetail'

// Pages — Album
import AlbumPage from '@/pages/Album'

// Pages — Tickets
import TicketsPage      from '@/pages/Tickets'
import TicketDetailPage from '@/pages/Tickets/TicketDetail'

// Pages — Groups
import GroupsPage from '@/pages/Groups'

// Pages — Nations
import NationsPage from '@/pages/Nations'

// Pages — Profile
import ProfilePage from '@/pages/Profile'

// Pages — Shared placeholder (layout-agnostic)
import PlaceholderPage from '@/pages/Placeholder'

// Pages — Admin
import AdminDashboard from '@/pages/Admin/Dashboard'
import AdminUsers     from '@/pages/Admin/Users'
import AdminMatches   from '@/pages/Admin/Matches'
import AdminAlerts    from '@/pages/Admin/Alerts'

function AppRoutes() {
  useTheme() // applies CSS tokens to <html>

  return (
    <Routes>

      {/* ── Auth / Public ──────────────────────────────────────────────────── */}
      <Route element={<PublicLayout />}>
        <Route path="/login"            element={<LoginPage />} />
        <Route path="/register"         element={<RegisterPage />} />
        <Route path="/forgot-password"  element={<ForgotPassword />} />
      </Route>

      {/* ── Root redirect ─────────────────────────────────────────────────── */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ── Landing (accesible sin auth) ──────────────────────────────────── */}
      <Route path="/home" element={<HomePage />} />

      {/* ── User (authenticated) ──────────────────────────────────────────── */}
      <Route element={<PrivateRoute />}>
        <Route element={<UserLayout />}>
          <Route path="/fixture"     element={<MatchesPage />} />
          <Route path="/agenda"      element={<AgendaPage />} />
          <Route path="/pools"       element={<PoolsPage />} />
          <Route path="/match/:id"   element={<MatchDetailPage />} />
          <Route path="/pools/new"   element={<NewPoolPage />} />
          <Route path="/pools/:id"   element={<PoolDetailPage />} />
          <Route path="/predict/:id" element={<PredictPage />} />
          <Route path="/album"       element={<AlbumPage />} />
          <Route path="/tickets"     element={<TicketsPage />} />
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
          <Route path="/groups"      element={<GroupsPage />} />
          <Route path="/nations"     element={<NationsPage />} />
          <Route path="/profile"     element={<ProfilePage />} />
        </Route>
      </Route>

      {/* ── Admin ─────────────────────────────────────────────────────────── */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin"         element={<AdminDashboard />} />
          <Route path="/admin/users"   element={<AdminUsers />} />
          <Route path="/admin/matches" element={<AdminMatches />} />
          <Route path="/admin/alerts"  element={<AdminAlerts />} />
        </Route>
      </Route>

      {/* ── 404 ───────────────────────────────────────────────────────────── */}
      <Route path="*" element={<PlaceholderPage title="404" module="NOT FOUND" />} />

    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
