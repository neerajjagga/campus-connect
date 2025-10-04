import React, { useEffect, useRef, useState } from "react";
import useAuthStore from "../stores/authStore";
import {
  User,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  Building,
  Plus,
  UserRound,
  Shield,
  KeyRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { departments } from "../utils/constant";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "CCT",
    role: "student",
    profileImage: "",
    secret: "",
  });

  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);

  const { isUserAuthenticating, signup } = useAuthStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file!");
      return;
    }

    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only png, jpg, jpeg and webp images are allowed.");
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 1MB in bytes
    if (file.size > maxSize) {
      toast.error("Image size must be less than 2MB!");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64Image = reader.result;
      setImagePreview(base64Image);
      setFormData({ ...formData, profileImage: base64Image });
    };
  };

  const validateForm = () => {
    if (!formData.name.trim()) return toast.error("Name is required!");
    if (formData.name.length < 3)
      return toast.error("Name should be a minimum of length 3!");
    if (!formData.email.trim()) return toast.error("Email is required!");
    if (!/^[a-zA-Z0-9._%+-]+@cgc\.edu\.in$/.test(formData.email))
      return toast.error("Invalid email format");
    if (!formData.password.trim()) return toast.error("Password is required!");
    if (formData.password.length < 6)
      return toast.error("Password should be a minimum of length 6!");

    if (!formData.department.trim())
      return toast.error("Department is required!");
    if (!departments.includes(formData.department))
      return toast.error(
        "Department must be one of CEC, CCT, CCE, CCP, CBSA, CCH, CCHM!"
      );

    if (!["student", "admin"].includes(formData.role))
      return toast.error("Role must be one of student or admin!");

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const successValidated = validateForm();

    if (successValidated === true) signup(formData);
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen px-8 py-10">
      <div className="absolute inset-0 bg-[url('/assets/images/hero.png')] bg-cover bg-center bg-no-repeat ">
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>

      <div className="relative w-full max-w-xl flex flex-col gap-6 bg-white rounded-lg p-8 shadow-md z-10">
        <div className="text-center">
          <div className="flex flex-col items-center gap-2 group">
            <img src="../assets/images/logo.png" alt="Logo" className="w-24" />
            <h1 className="text-2xl font-bold">Create new account</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleImageChange}
            accept="image/png, image/jpeg, image/jpg, image/webp"
          />

          <div className="flex justify-center items-center">
            <div className="relative">
              <img
                src={imagePreview || "../assets/images/avatar.png"}
                alt="Porfile"
                className="size-24 object-cover rounded-full border-[2px] border-primary-500"
              />
              <button
                type="button"
                className="bg-primary-500 text-white p-1 rounded-full absolute bottom-1 right-0"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="flex flex-col gap-0.5">
              <label
                className="text-neutral-800 text-[0.95rem] font-[500]"
                htmlFor="name"
              >
                Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-neutral-800" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-3 py-2 border border-neutral-800 rounded-lg bg-white text-black placeholder-gray-500 
             focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  name="name"
                  id="name"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <label
                className="text-neutral-800 text-[0.95rem] font-[500]"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-neutral-800" />
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
                  id="email"
                  name="email"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="flex flex-col gap-0.5">
              <label
                className="text-neutral-800 text-[0.95rem] font-[500]"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-neutral-800" />
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
                  required
                  autoComplete="current_password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              <label
                className="text-neutral-800 text-[0.95rem] font-[500]"
                htmlFor="department"
              >
                Department
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="size-5 text-neutral-800" />
                </div>
                <select
                  name="department"
                  id="department"
                  className="w-full pl-10 pr-3 py-2 border border-neutral-800 rounded-lg bg-white text-black placeholder-gray-500 
             focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                >
                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div
            className={`grid ${
              formData.role === "admin" ? "grid-cols-2" : "grid-cols-1"
            } gap-4 items-center`}
          >
            <div className="flex flex-col gap-0.5">
              <label
                className="text-neutral-800 text-[0.95rem] font-[500]"
                htmlFor="role"
              >
                Role
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {formData.role === "student" ? (
                    <UserRound className="size-5 text-neutral-800" />
                  ) : (
                    <Shield className="size-5 text-neutral-800" />
                  )}
                </div>
                <select
                  name="role"
                  id="role"
                  className="w-full pl-10 pr-3 py-2 border border-neutral-800 rounded-lg bg-white text-black placeholder-gray-500 
             focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {formData.role === "admin" && (
              <div className="flex flex-col gap-0.5">
                <label
                  className="text-neutral-800 text-[0.95rem] font-[500]"
                  htmlFor="secret"
                >
                  Admin Secret
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="size-5 text-neutral-800" />
                  </div>
                  <input
                    name="secret"
                    id="secret"
                    placeholder="Key"
                    className="w-full pl-10 pr-3 py-2 border border-neutral-800 rounded-lg bg-white text-black placeholder-gray-500 
             focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    required
                    onChange={(e) =>
                      setFormData({ ...formData, secret: e.target.value })
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="flex justify-center items-center gap-1.5 w-full text-white border-2 rounded-md py-2 mt-5 border-primary-500 bg-primary-500 hover:bg-white hover:text-primary-500 hover:border-primary-500"
            disabled={isUserAuthenticating}
          >
            {isUserAuthenticating ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Loading...
              </>
            ) : (
              "Create"
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-neutral-800">
            Already have an account?{" "}
            <Link to="/login" className="underline text-primary-500">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
