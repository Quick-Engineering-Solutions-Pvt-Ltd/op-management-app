import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store/store";
import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { login, logout } from "../../store/Slice/authSlice";
import { schema } from "../validationComponent/validationSchema"; // Adjust the import path
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
    mode: "onChange", // Validate on every change
  });

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { status, error, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (status === "succeeded" && user) {
      if (user.userType === "admin") {
        // console.log("LoginForm - Redirecting to /admin/dashboard"); // Debug
        navigate("/admin/dashboard");
      } else if (user.userType === "user") {
        // console.log("LoginForm - Redirecting to /user/dashboard"); // Debug
        navigate("/user/dashboard");
      }
    } else if (status === "failed" && error) {
      const toastOptions = {
        position: "top-right" as const,
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      };
      if (error.includes("Invalid email")) {
        toast.error(error, { ...toastOptions, theme: "colored" });
      } else {
        toast.error(error, toastOptions);
      }
      setTimeout(() => {
        dispatch(logout());
      }, 6000);
    }
  }, [status, error, navigate]);

  useEffect(() => {
    dispatch(logout()); // Reset auth state on mount
  }, [dispatch]);

  const onSubmit: SubmitHandler<LoginFormData> = (data) => {
    dispatch(login({ email: data.email, password: data.password }));
  };

  return (
    <div className="wrapper flex flex-col md:flex-row items-center justify-between bg-white w-full h-132 overflow-hidden">
      <div className="sider flex flex-col items-center justify-center min-h-[50vh] bg-white w-full md:w-1/2 py-6 px-4">
        <div className="img w-full max-w-md text-center">
          <img
            src="/images/img2.png"
            alt="Illustration"
            className="mx-auto mb-4 w-full h-auto max-w-[300px] md:max-w-[400px]"
          />
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-black mb-4">
            Sign in for managing users
          </h2>
          <p className="text-sm md:text-base text-gray-600">
            Sign in to manage our company purchase orders efficiently. Gain
            access to powerful tools for tracking, organizing, and streamlining
            all your procurement processes in one place.
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center min-h-[50vh] md:min-h-screen bg-white w-full md:w-1/2 py-6 px-4">
        <h1 className="text-2xl font-bold absolute top-0 left-0 p-4">
          <img
            src="/images/logo.ico"
            alt="Logo"
            className="w-24 h-auto mb-2 md:w-30"
          />
        </h1>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-black mb-5 text-center md:text-left">
          Sign in
        </h2>
        <form
          onSubmit={handleSubmit(
            onSubmit as unknown as Parameters<typeof handleSubmit>[0]
          )}
          className="w-full max-w-sm"
        >
          <div className="mb-4">
            <span className="hidden items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-red-600/10 ring-inset">Invalid Email</span>
            <input
              type="text"
              placeholder="Enter your email"
              className="w-full p-3 border rounded text-base focus:outline-none focus:ring-2 focus:ring-black"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full p-3 border rounded text-base focus:outline-none focus:ring-2 focus:ring-black"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full p-3 bg-black text-white rounded text-base font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            disabled={status === "loading" || !isValid}
          >
            {status === "loading" ? "Signing In..." : "Sign In"}
          </button>
        </form>
        <div className="flex flex-col items-center justify-center gap-2 w-full max-w-sm mt-4">
          <div className="flex w-full items-center gap-2 py-6 text-sm text-slate-600">
            <div className="h-px w-full bg-slate-200"></div>
            OR
            <div className="h-px w-full bg-slate-200"></div>
          </div>
          <button
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded border border-slate-300 bg-white text-sm font-medium text-black outline-none focus:ring-2 focus:ring-[#333] focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={status === "loading"}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="h-[18px] w-[18px]"
            />
            Continue with Google
          </button>
          <button
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded border border-slate-300 bg-white text-sm font-medium text-black outline-none focus:ring-2 focus:ring-[#333] focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={status === "loading"}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/b/b9/2023_Facebook_icon.svg"
              alt="Facebook"
              className="h-[18px] w-[18px]"
            />
            Continue with Facebook
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-600 absolute bottom-5 right-5">
        © 2025 Powered By QESPL
      </p>
    </div>
  );
};

export default LoginForm;
