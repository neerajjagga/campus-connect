import toast from "react-hot-toast";
import axiosInstance from "../utils/axios";
import { create } from "zustand";
import useAuthStore from "./authStore";

const useProfileStore = create((set) => ({
  profileData: null,
  isProfileFetched: false,
  isUpdatingProfile: false,

  getProfile: async () => {
    set({ isProfileFetched: false });
    try {
      const res = await axiosInstance.get("/auth/profile");
      set({ profileData: res.data, isProfileFetched: true });
    } catch (error) {
      toast.error(error.response.data.message);
      useAuthStore.getState().setAuthUser(null);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.post("/auth/update-profile", data);
      console.log(res);
      set({ profileData: res.data.profile });
      useAuthStore.getState().setAuthUser(res.data.profile);
      toast.success("Porfile Updated Success!");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
}));

export default useProfileStore;
