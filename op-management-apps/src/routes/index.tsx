import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom";

import Home from "../page/Home";
import LoginForm from "../components/Admin/adminSignIn";
import RegisterForm from "../components/Admin/adminSignup";
import ProtectedRoute from "../ProtectedRoute/protectiveRoute";
import AdminDashboard from "../components/Admin/admin.dashboard";
import UserDashboard from "../page/UserDashboard";

// eslint-disable-next-line react-refresh/only-export-components, @typescript-eslint/no-unused-vars
export const AppRoutes: React.FC = () => {
  console.log("Rendering AppRoutes");
  return (
    <BrowserRouter>
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
          </Route>
          <Route path="/logout" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </div>
    </BrowserRouter>
  );
};
