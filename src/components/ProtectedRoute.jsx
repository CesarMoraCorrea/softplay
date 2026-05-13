import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children, requireRoles }){
  const { user } = useSelector(s => s.auth);
  const location = useLocation();

  if(!user) {
    return <Navigate to="/login" state={{ from: location.pathname, message: "Debes iniciar sesión para acceder a esta página." }} replace />;
  }

  if(requireRoles && !requireRoles.includes(user.role)) return <Navigate to="/home" />;
  return children;
}
