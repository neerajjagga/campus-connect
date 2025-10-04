import { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Image, Loader2, X } from "lucide-react";
import useAuthStore from "../stores/authStore";
import toast from "react-hot-toast";
import useClubStore from "../stores/clubStore";
import { useNavigate } from "react-router-dom";

const CreateClubPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    clubImage: "",
    admins: [],
  });

  const navigate = useNavigate();

  const [imagePreview, setImagePreview] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);

  const fileInputRef = useRef(null);

  const { isFetchingUsers, getUsers } = useAuthStore();
  const { isCreatingClub, createNewClub } = useClubStore();

  useEffect(() => {
    fetchUsers("admin");
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchUsers = async (role) => {
    const users = await getUsers(role);
    setAdminUsers(users);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectAdminUser = (user) => {
    if (!formData.admins.map((user) => user._id).includes(user._id)) {
      setFormData({
        ...formData,
        admins: [...formData.admins, user],
      });
      setShowDropdown(false);
    }
  };

  const handleRemoveAdminUser = (userId) => {
    setFormData({
      ...formData,
      admins: formData.admins.filter((user) => user._id !== userId),
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file!");
      return;
    }

    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Only png, jpg, jpeg and webp images are allowed.");
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
      setFormData({ ...formData, clubImage: base64Image });
    };
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Club Name is required!");
      return false;
    }

    if (!formData.description.trim()) {
      toast.error("Description is required!");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validatedSuccess = validateForm();
    if (validatedSuccess) {
      const data = {
        ...formData,
        admins: formData.admins.map((user) => {
          return { admin: user._id };
        }),
      };

      await createNewClub(data);
      navigate("/dashboard", { state: { activeTab: "clubs" } });
    }
  };

  return (
    <>
      <Header active="create-club" />
      <main>
        <div className="w-full max-w-[72rem] mx-auto py-10 px-6 lg:px-10">
          <div className="p-8 bg-primary-50 shadow-lg rounded-md border">
            <h2 className="text-2xl font-semibold mb-6 text-primary-500 sm:text-3xl">
              Create New Club
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleImageChange}
                accept="image/png, image/jpeg, image/jpg, image/webp"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-[1px] focus:ring-primary-500"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <div className="relative" ref={dropdownRef}>
                  <div
                    className="w-full p-3 border border-gray-300 rounded-md bg-white cursor-pointer"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    {formData.admins.length === 0 ? (
                      <span className="text-gray-400">Select Admins</span>
                    ) : (
                      <ul className="flex flex-wrap gap-2">
                        {formData.admins.map((user) => (
                          <li
                            key={user._id}
                            className="flex items-center gap-1.5 bg-primary-500 text-white px-2 py-[0.3rem] rounded-md text-sm"
                          >
                            <span>{user.name}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAdminUser(user._id)}
                              className="text-gray-300 hover:text-white"
                            >
                              <X className="size-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {showDropdown && !isFetchingUsers && (
                    <ul className="absolute z-10 flex flex-col gap-0.5 top-full left-0 w-full bg-primary-50 shadow-md border border-gray-200 rounded-md mt-1 overflow-y-auto">
                      {adminUsers.map((user) => (
                        <li key={user._id}>
                          <button
                            type="button"
                            onClick={() => handleSelectAdminUser(user)}
                            className={`w-full flex items-center gap-2 text-start p-3 ${
                              formData.admins
                                .map((user) => user._id)
                                .includes(user._id)
                                ? "bg-primary-50"
                                : "bg-white"
                            } hover:bg-primary-50`}
                          >
                            <img
                              className="w-8 rounded-full"
                              src={
                                user.profileImageUrl ||
                                "../assets/images/avatar.png"
                              }
                              alt={user.name}
                            />
                            <span className="text-sm">{user.name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-7">
                <div className="col-span-1 sm:col-span-3 relative group custom-lg:col-span-2">
                  <img
                    src={imagePreview || "../assets/images/image_avatar.jpg"}
                    alt="Porfile"
                    className="w-full h-44 object-cover border border-gray-300 rounded-md group-hover:border-primary-500"
                  />
                  <button
                    type="button"
                    className="hidden items-center shadow-md border gap-3 px-3 py-1.5 bg-primary-500 text-white rounded-md absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 hover:bg-primary-300 group-hover:flex"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.click();
                      }
                    }}
                  >
                    <span>Upload</span>
                    <Image className="size-5" />
                  </button>
                </div>

                <textarea
                  name="description"
                  placeholder="Description"
                  className="col-span-1 sm:col-span-4 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-[1px] focus:ring-primary-500 resize-none custom-lg:col-span-5"
                  rows="5"
                  value={formData.description}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center gap-3 bg-primary-500 text-white p-3 rounded-md text-lg font-semibold transition-colors hover:bg-primary-300"
              >
                {isCreatingClub ? (
                  <>
                    <Loader2 className="size-6 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CreateClubPage;
