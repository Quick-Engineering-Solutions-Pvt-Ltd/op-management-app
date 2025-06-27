import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { RootState } from "../store/store";

interface ProtectedRouteProps {
  allowedRoles: string[]; // e.g., ["admin"], ["user"], or ["admin", "user"]
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, status } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (status === "loading") {
    console.log("ProtectedRoute - Loading state");
    return <div>Loading...</div>;
  }

  if (status === "failed" || !user) {
    console.log(
      "ProtectedRoute - Redirecting to /login (status:",
      status,
      "user:",
      user,
      ")"
    );
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && !allowedRoles.includes(user.userType)) {
    console.log(
      "ProtectedRoute - User type",
      user.userType,
      "not in allowedRoles:",
      allowedRoles
    );
    if (user.userType === "admin") {
      return (
        <Navigate to="/admin/dashboard" state={{ from: location }} replace />
      );
    } else if (user.userType === "user") {
      return (
        <Navigate to="/user/dashboard" state={{ from: location }} replace />
      );
    }
  }

  console.log("ProtectedRoute shariq khan - Rendering Outlet for user:", user);
  return <Outlet />;
};

export default ProtectedRoute;
