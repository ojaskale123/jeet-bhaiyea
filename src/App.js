import { useEffect, useMemo } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { initializeData, getCurrentUser } from './utils/localStorage';
import AuthGuard from './components/AuthGuard';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Sell from './pages/Sell';
import History from './pages/History';
import UserManagement from './pages/UserManagement';
import Repairs from './pages/Repairs';

// Define allowed roles as constants outside component
const OWNER_MANAGER_ROLES = ['OWNER', 'MANAGER'];
const ALL_ROLES = ['OWNER', 'MANAGER', 'WORKER'];
const OWNER_ONLY = ['OWNER'];

const PrivateRoute = ({ children, allowedRoles }) => {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <AuthGuard allowedRoles={allowedRoles}>
      {children}
    </AuthGuard>
  );
};

function App() {
  useEffect(() => {
    initializeData();
  }, []); // initializeData is a utility function, safe to omit from deps

  // Memoize toast options to prevent unnecessary re-renders
  const toastOptions = useMemo(() => ({
    style: {
      background: '#151A22',
      color: '#F3F4F6',
      border: '1px solid #262B35',
    },
  }), []);

  return (
    <div className="App">
      <Toaster 
        position="top-right"
        toastOptions={toastOptions}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute allowedRoles={OWNER_MANAGER_ROLES}>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/products" 
            element={
              <PrivateRoute allowedRoles={OWNER_MANAGER_ROLES}>
                <Products />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/sell" 
            element={
              <PrivateRoute allowedRoles={ALL_ROLES}>
                <Sell />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/repairs" 
            element={
              <PrivateRoute allowedRoles={ALL_ROLES}>
                <Repairs />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/history" 
            element={
              <PrivateRoute allowedRoles={OWNER_MANAGER_ROLES}>
                <History />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/users" 
            element={
              <PrivateRoute allowedRoles={OWNER_ONLY}>
                <UserManagement />
              </PrivateRoute>
            } 
          />
          
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
