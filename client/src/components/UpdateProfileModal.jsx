import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import useAuthStore from "../stores/authStore";
import useProfileStore from "../stores/profileStore";
import { departments } from "../utils/constant";
import { Button } from "./ui/button";

const UpdateProfileModal = ({ handleClick }) => {
  const { authUser } = useAuthStore();
  const { isUpdatingProfile, updateProfile } = useProfileStore();

  const [formData, setFormData] = useState({
    name: authUser.name,
    email: authUser.email,
    department: authUser.department,
  });

  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);
  const removeProfilePicButtonRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "");
  }, []);

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
    };
  };

  const handleImageRemove = () => {
    setImagePreview("../assets/images/avatar.png");
    if (removeProfilePicButtonRef.current) {
      removeProfilePicButtonRef.current.disabled = true;
    }
  };

  const isDataChanged = () => {
    if (
      authUser.name === formData.name &&
      authUser.email === formData.email &&
      authUser.department === formData.department &&
      imagePreview === null
    ) {
      return false;
    }
    return true;
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required!");
      return false;
    }

    if (formData.name.length < 3) {
      toast.error("Name should be a minimum of length 3!");
      return false;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required!");
      return false;
    }

    if (!/^[a-zA-Z0-9._%+-]+@cgc\.edu\.in$/.test(formData.email)) {
      toast.error("Invalid email format");
      return false;
    }

    if (!formData.department.trim()) {
      toast.error("Department is required!");
      return false;
    }

    if (!departments.includes(formData.department)) {
      toast.error(
        "Department must be one of CEC, CCT, CCE, CCP, CBSA, CCH, CCHM!"
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const successValidated = validateForm();

    if (successValidated) {
      const data = {
        ...formData,
      };

      if (imagePreview) {
        if (imagePreview.includes("../assets/images/avatar.png")) {
          data.profileImageUrl = "";
        } else {
          data.profileImage = imagePreview;
        }
      }

      await updateProfile(data);
      handleClick();
      
    }
  };

  return (
    <div className="fixed inset-0 z-10 bg-[#20202097] flex justify-center items-start p-8 overflow-y-auto">
      <div className="w-full relative bg-white shadow-lg p-6 rounded-lg sm:w-[33rem]">
        <div className="flex flex-col gap-10 mt-3">
          <h3 className="text-2xl font-semibold tracking-tight text-center w-full">
            Update Profile
          </h3>
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <span className="text-[0.95rem] -mb-3">Profile Photo</span>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleImageChange}
            />
            <div className="flex flex-col gap-3 items-start ">
              <div className="size-[6rem]">
                <img
                  src={
                    imagePreview ||
                    authUser.profileImageUrl ||
                    "../assets/images/avatar.png"
                  }
                  alt="Profile Pic"
                  className="object-cover rounded-full aspect-square border-solid border-[1px] border-primary-500"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  type="button"
                  className="text-[0.9rem] text-white bg-primary-500 hover:bg-primary-300"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Update
                </Button>
                {authUser.profileImageUrl && (
                  <Button
                    ref={removeProfilePicButtonRef}
                    size="sm"
                    type="button"
                    variant="destructive"
                    onClick={handleImageRemove}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm tracking-tight">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="outline-none border-solid border-[1px] border-transparent bg-gray-100 px-3 py-2 rounded-md text-[0.9rem] tracking-tight font-semibold focus:border-black"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm tracking-tight">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="outline-none border-solid border-[1px] border-transparent bg-gray-100 px-3 py-2 rounded-md text-[0.9rem] tracking-tight font-semibold focus:border-black"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="department" className="text-sm tracking-tight">
                Department
              </label>
              <select
                name="department"
                id="department"
                className="outline-none border-solid border-[1px] border-transparent bg-gray-100 px-3 py-2 rounded-md text-[0.9rem] tracking-tight font-semibold focus:border-black"
                required
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                value={formData.department}
              >
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <div className="flex gap-3 items-center">
                {!isUpdatingProfile && (
                  <button
                    type="button"
                    className="px-4 py-2 capitalize rounded-3xl border-solid border-[1px] border-primary-500 text-[0.9rem] text-primary-500 tracking-tight hover:bg-primary-500 hover:text-white"
                    onClick={handleClick}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isUpdatingProfile || !isDataChanged()}
                  className={`px-4 py-2 capitalize rounded-3xl border-solid border-[1px] border-primary-500 text-[0.9rem] tracking-tight hover:bg-primary-500 hover:text-white ${
                    isUpdatingProfile || !isDataChanged()
                      ? "bg-primary-500 text-white opacity-60"
                      : "bg-white text-primary-500"
                  }`}
                >
                  {isUpdatingProfile ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </form>
        </div>
        <div className="absolute top-5 right-5">
          <button
            onClick={handleClick}
            className="text-gray-600 hover:text-gray-800"
          >
            <X className="size-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfileModal;
