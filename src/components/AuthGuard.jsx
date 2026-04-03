import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/localStorage';

const AuthGuard = ({ children, allowedRoles }) => {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect to default page based on role
    if (currentUser.role === 'WORKER') {
      return <Navigate to="/sell" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AuthGuard;
