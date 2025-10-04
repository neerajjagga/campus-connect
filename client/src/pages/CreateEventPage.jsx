import { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Image, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import useEventStore from "../stores/eventStore";
import { useNavigate } from "react-router-dom";
import useProfileStore from "../stores/profileStore";

const CreateEventPage = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventImage: "",
    category: [],
    location: "",
    date: "",
    club: "",
    registrationUrl: "",
  });

  const navigate = useNavigate();

  const [categoryText, setCategoryText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);

  const { profileData, getProfile, isProfileFetched } = useProfileStore();
  const { isCreatingEvent, createNewEvent } = useEventStore();

  useEffect(() => {
    getProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      setFormData({ ...formData, eventImage: base64Image });
    };
  };

  const handleAddCategory = () => {
    if (categoryText.trim() !== "") {
      setFormData({
        ...formData,
        category: [...formData.category, categoryText.trim()],
      });
      setCategoryText("");
    }
  };

  const handleDeleteCategory = (category) => {
    setFormData({
      ...formData,
      category: formData.category.filter((cat) => cat !== category),
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("Title is required!");
      return false;
    }

    if (!formData.location.trim()) {
      toast.error("Location is required!");
      return false;
    }

    if (!formData.date) {
      toast.error("Event date is required!");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validatedSuccess = validateForm();
    if (validatedSuccess) {
      await createNewEvent(formData);
      navigate("/dashboard");
    }
  };

  return (
    <>
      <Header active="create-event" />
      <main>
        <div className="w-full max-w-[72rem] mx-auto py-10 px-6 lg:px-10">
          <div className="p-8 bg-primary-50 shadow-lg rounded-md border">
            <h2 className="text-2xl font-semibold mb-6 text-primary-500 sm:text-3xl">
              Create New Event
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
                  name="title"
                  placeholder="Title"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-[1px] focus:ring-primary-500"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-[1px] focus:ring-primary-500"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-7">
                <div className="col-span-1 sm:col-span-3 relative group custom-lg:col-span-2">
                  <img
                    src={imagePreview || "../assets/images/image_avatar.jpg"}
                    alt="Event Image"
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
                ></textarea>
              </div>

              {/* category Input */}
              <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2.5 items-start">
                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder="Category (e.g. Tech, Cultural)"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-[1px] focus:ring-primary-500"
                      value={categoryText}
                      onChange={(e) => setCategoryText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCategory();
                        }
                      }}
                    />
                    {categoryText && (
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="absolute top-[50%] -translate-y-[50%] right-2 bg-primary-500 px-3 py-1.5 rounded-md text-white hover:bg-primary-300 transition-colors text-sm"
                      >
                        Add
                      </button>
                    )}
                  </div>
                  {formData.category.length > 0 && (
                    <ul className="flex flex-wrap items-center gap-1">
                      {formData.category.map((category) => (
                        <li
                          key={category}
                          className="flex items-center gap-1.5 px-[0.5rem] py-[0.4rem] bg-primary-500 text-white text-sm rounded-sm"
                        >
                          <span>{category}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(category)}
                            className="text-gray-300 hover:text-white"
                          >
                            <X className="size-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <input
                  type="date"
                  name="date"
                  className={`w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-[1px] focus:ring-primary-500 appearance-none ${
                    formData.date === "" ? "text-gray-400" : "text-black"
                  }`}
                  value={formData.date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="grid col-span-1 sm:grid-cols-2 gap-4">
                <select
                  name="club"
                  value={formData.club}
                  onChange={handleChange}
                  className={`w-full p-3 border border-gray-300 rounded-md ${
                    formData.club === "" ? "text-gray-400" : "text-black"
                  } focus:outline-none focus:ring-[1px] focus:ring-primary-500`}
                >
                  <option value="" className="hidden text-gray-400" disabled>
                    Select a Club
                  </option>
                  <option value="" className="text-black">
                    No Club
                  </option>
                  {isProfileFetched &&
                    profileData.adminAtClubs.map((club) => (
                      <option
                        key={club._id}
                        value={club._id}
                        className="text-black"
                      >
                        {club.name}
                      </option>
                    ))}
                </select>

                <input
                  type="text"
                  name="registrationUrl"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-[1px] focus:ring-primary-500"
                  value={formData.registrationUrl}
                  onChange={handleChange}
                  placeholder="Registration Url"
                />
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center gap-3 bg-primary-500 text-white p-3 rounded-md text-lg font-semibold transition-colors hover:bg-primary-300"
              >
                {isCreatingEvent ? (
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

export default CreateEventPage;
