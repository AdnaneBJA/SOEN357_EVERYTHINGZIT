import { createBrowserRouter, RouterProvider, useRouteError, Link } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import './App.css'

import Home from './pages/Home'
import Browse from './pages/Browse'
import ListingDetail from './pages/ListingDetail'
import Sell from './pages/Sell'
import Donate from './pages/Donate'
import CharityDashboard from './pages/CharityDashboard'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Signup from './pages/Signup'

function ErrorPage() {
  const error = useRouteError() as { statusText?: string; message?: string } | null
  return (
    <div style={{ padding: '64px 24px', textAlign: 'center', fontFamily: 'var(--font-sans)' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Something went wrong</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px' }}>
        {error?.statusText ?? error?.message ?? 'An unexpected error occurred.'}
      </p>
      <Link to="/" style={{ fontWeight: 600, textDecoration: 'underline' }}>Go home</Link>
    </div>
  )
}

const router = createBrowserRouter([
  { path: '/login',  element: <Login />,  errorElement: <ErrorPage /> },
  { path: '/signup', element: <Signup />, errorElement: <ErrorPage /> },
  {
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: '/',             element: <Home /> },
      { path: '/browse',       element: <Browse /> },
      { path: '/listings/:id', element: <ListingDetail /> },
      { path: '/sell',         element: <ProtectedRoute><Sell /></ProtectedRoute> },
      { path: '/donate',       element: <ProtectedRoute><Donate /></ProtectedRoute> },
      { path: '/profile',      element: <ProtectedRoute><Profile /></ProtectedRoute> },
      {
        path: '/charity',
        element: (
          <ProtectedRoute requiredRole="charity_rep">
            <CharityDashboard />
          </ProtectedRoute>
        ),
      },
    ],
  },
])

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  )
}
