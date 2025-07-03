import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { RootState, AppDispatch } from "../store/store";
import { logout, validateToken } from "../store/Slice/authSlice";
import { useEffect } from "react";

interface ProtectedRouteProps {
  allowedRoles: string[]; // e.g., ["admin"], ["user"], or ["admin", "user"]
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, status, token } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!user && token && status === "idle") {
      console.log(token, "token");
      dispatch(validateToken())
        .unwrap()
        .catch(() => {
          dispatch(logout());
        });
      const interval = setInterval(() => {
        if (token) {
          dispatch(validateToken())
            .unwrap()
            .catch(() => {
              dispatch(logout());
            });
        }
      }, 5 * 60 * 1000); // Check every 5 minutes
      // Cleanup interval on component unmount
      return () => clearInterval(interval);
    }
  }, [dispatch, user, token, status]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "failed" || !user) {
    console.log(
      "ProtectedRoute - Redirecting to /login (status: shariq khan",
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
  return <Outlet />;
};

export default ProtectedRoute;
