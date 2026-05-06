import { createBrowserRouter } from 'react-router-dom';

// Layouts
import { ClientLayout } from '@/components/layout/ClientLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';

// Auth
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Public Pages
import { HomePage } from '@/pages/HomePage';
import { ProductsPage } from '@/pages/ProductsPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { BuilderPage } from '@/pages/BuilderPage';
import { CartPage } from '@/pages/CartPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Protected Pages
import { ProfilePage } from '@/pages/ProfilePage';

// Admin Pages
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';

export const router = createBrowserRouter([
  // ============================================================
  // CLIENT ROUTES (ClientLayout: Navbar + Footer)
  // ============================================================
  {
    element: <ClientLayout />,
    children: [
      // Public
      { path: '/', element: <HomePage /> },
      { path: '/products', element: <ProductsPage /> },
      { path: '/products/:id', element: <ProductDetailPage /> },
      { path: '/builder', element: <BuilderPage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },

      // Protected – Customer
      {
        path: '/profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },

      // 404 fallback
      { path: '*', element: <NotFoundPage /> },
    ],
  },

  // ============================================================
  // ADMIN ROUTES (AdminLayout: Sidebar)
  // ============================================================
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'products', element: <AdminProductsPage /> },
      { path: 'orders', element: <AdminOrdersPage /> },
    ],
  },
]);
