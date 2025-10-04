import React, { useState } from "react";
import useAuthStore from "../stores/authStore";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const { login, isUserAuthenticating } = useAuthStore();

  const validateForm = () => {
    if (!formData.email.trim()) return toast.error("Email is required!");
    if (!/^[a-zA-Z0-9._%+-]+@cgc\.edu\.in$/.test(formData.email))
      return toast.error("Invalid email format");
    if (!formData.password.trim()) return toast.error("Password is required!");
    if (formData.password.length < 6)
      return toast.error("Password should be a minimum of length 6!");

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const successValidated = validateForm();

    if (successValidated === true) login(formData);
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen px-8 py-10">
      <div className="absolute inset-0 bg-[url('/assets/images/hero.png')] bg-cover bg-center bg-no-repeat ">
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>

      <div className="relative w-full max-w-lg flex flex-col gap-6 bg-white rounded-lg p-8 shadow-md z-10">
        <div className="text-center">
          <div className="flex flex-col items-center gap-2 group">
            <img src="../assets/images/logo.png" alt="Logo" className="w-24" />
            <h1 className="text-2xl font-bold">Login your existing account</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-0.5">
            <label className="text-neutral-800 text-[0.95rem] font-[500]" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-neutral-800" />
              </div>
              <input
                type="email"
                className="w-full pl-10 pr-3 py-2 border border-neutral-800 rounded-lg bg-white text-black placeholder-gray-500 
             focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="you@cgc.edu.in"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                name="email"
                id="email"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <label className="text-neutral-800 text-[0.95rem] font-[500]" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-neutral-800" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 pr-3 py-2 border border-neutral-800 rounded-lg bg-white text-black placeholder-gray-500 
             focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                id="password"
                autoComplete="current_password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-base-content/40" />
                ) : (
                  <Eye className="h-5 w-5 text-base-content/40" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="flex justify-center items-center gap-1.5 w-full text-white border-2 rounded-md py-2 mt-2 border-primary-500 bg-primary-500 hover:bg-white hover:text-primary-500 hover:border-primary-500"
            disabled={isUserAuthenticating}
          >
            {isUserAuthenticating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-neutral-800">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="underline text-primary-500">
              Create new account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
