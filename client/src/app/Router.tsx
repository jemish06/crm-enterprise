import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { AppLayout } from '@/shared/components/layout/AppLayout'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { LeadsPage } from '@/features/leads/pages/LeadsPage'
import { LeadDetailPage } from '@/features/leads/pages/LeadDetailPage'
import { ContactsPage } from '@/features/contacts/pages/ContactsPage'
import { ContactDetailPage } from '@/features/contacts/pages/ContactDetailPage'
import { AccountsPage } from '@/features/accounts/pages/AccountsPage'
import { AccountDetailPage } from '@/features/accounts/pages/AccountDetailPage'
import { DealsPage } from '@/features/deals/pages/DealsPage'
import { DealDetailPage } from '@/features/deals/pages/DealDetailPage'
import { TasksPage } from '@/features/tasks/pages/TasksPage'
import { ActivitiesPage } from '@/features/activities/pages/ActivitiesPage'
import { SettingsPage } from '@/features/settings/pages/SettingsPage'
import { AcceptInvitation } from '@/pages/AcceptInvitation';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" />
}

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Leads */}
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/leads/:id" element={<LeadDetailPage />} />
          
          {/* Contacts */}
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/contacts/:id" element={<ContactDetailPage />} />
          
          {/* Accounts */}
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/accounts/:id" element={<AccountDetailPage />} />
          
          {/* Deals */}
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/deals/:id" element={<DealDetailPage />} />
          
          {/* Tasks */}
          <Route path="/tasks" element={<TasksPage />} />
          
          {/* Activities */}
          <Route path="/activities" element={<ActivitiesPage />} />


          <Route path="/accept-invitation" element={<AcceptInvitation />} />
          
          {/* Settings */}
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}
