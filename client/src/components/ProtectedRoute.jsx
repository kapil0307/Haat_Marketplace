import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Redirects to login if not signed in, or home if the role doesn't match.
export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}
