import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RequireAuth } from '@/components/ui/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'

import LoginPage from '@/pages/login'
import RegisterPage from '@/pages/register'
import DashboardPage from '@/pages/dashboard'
import ActivitiesPage from '@/pages/activities'
import ReportsPage from '@/pages/reports'
import BabyNewPage from '@/pages/baby-new'
import BabyProfilePage from '@/pages/baby-profile'
import SettingsPage from '@/pages/settings'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'activities',
            element: <ActivitiesPage />,
          },
          {
            path: 'reports',
            element: <ReportsPage />,
          },
          {
            path: 'babies/new',
            element: <BabyNewPage />,
          },
          {
            path: 'babies/:id',
            element: <BabyProfilePage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
