import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import { AdminRoute } from './components/routes/AdminRoute';
import { RootRedirect } from './components/RootRedirect';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { NewAnalysisRequest } from './pages/NewAnalysisRequest';
import { Cart } from './pages/Cart';
import { MyOrders } from './pages/MyOrders';
import { MyAnalysisRequests } from './pages/MyAnalysisRequests';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminRequests } from './pages/admin/AdminRequests';
import { AdminSettings } from './pages/admin/AdminSettings';
import { BackupManagement } from './pages/admin/BackupManagement';
import { Appointments } from './pages/Appointments';
import { Budget } from './pages/Budget';
import { Profile } from './pages/Profile';
import { Survey } from './pages/Survey';
import { Payments } from './pages/Payments';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analysis/new"
              element={
                <ProtectedRoute>
                  <NewAnalysisRequest />
                </ProtectedRoute>
              }
            />
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
              path="/analysis/my"
              element={
                <ProtectedRoute>
                  <MyAnalysisRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-analysis-requests"
              element={
                <ProtectedRoute>
                  <MyAnalysisRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/randevular"
              element={
                <ProtectedRoute>
                  <Appointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <ProtectedRoute>
                  <Appointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/butce"
              element={
                <ProtectedRoute>
                  <Budget />
                </ProtectedRoute>
              }
            />
            <Route
              path="/budget"
              element={
                <ProtectedRoute>
                  <Budget />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <ProtectedRoute>
                  <Payments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/survey"
              element={
                <ProtectedRoute>
                  <Survey />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
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
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/requests"
              element={
                <AdminRoute>
                  <AdminRequests />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminRoute>
                  <AdminSettings />
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
    </ErrorBoundary>
  );
}

export default App;
