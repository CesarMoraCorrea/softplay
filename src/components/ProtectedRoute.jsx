import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children, requireRoles }){
  const { user } = useSelector(s => s.auth);
  if(!user) return <Navigate to="/login" />;
  if(requireRoles && !requireRoles.includes(user.role)) return <Navigate to="/home" />;
  return children;
}
