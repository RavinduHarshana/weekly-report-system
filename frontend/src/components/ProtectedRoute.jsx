import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, bootstrapping, user } = useAuth();
  const location = useLocation();

  if (bootstrapping) {
    return <div className="screen-center">Loading session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
    return <Navigate to={user?.role === 'Manager' ? '/manager' : '/member'} replace />;
  }

  return children;
}