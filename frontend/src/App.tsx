import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import { AdminRoute } from './components/routes/AdminRoute';
import { Catalog } from './pages/Catalog';
import { Login } from './pages/Login';
import { Cart } from './pages/Cart';
import { MyOrders } from './pages/MyOrders';
import { AdminDashboard } from './pages/AdminDashboard';
import { BackupManagement } from './pages/admin/BackupManagement';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Catalog />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/backup"
              element={
                <AdminRoute>
                  <BackupManagement />
                </AdminRoute>
              }
            />
          </Routes>
        </Router>
        <Toaster position="top-right" />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
