import toast from "react-hot-toast";
import axiosInstance from "../utils/axios";
import { create } from "zustand";

const useAuthStore = create((set) => ({
  authUser: null,
  isUserAuthenticating: false,
  isCheckingAuth: false,
  previousLocation: null,
  isAdminUsersFetched: false,

  setAuthUser: (data) => set({ authUser: data }),
  setPreviousLocation: (location) => set({ previousLocation: location }),

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
    } catch (error) {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  login: async (data) => {
    set({ isUserAuthenticating: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data.user });
      toast.success("Login Success!");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUserAuthenticating: false });
    }
  },
  signup: async (data) => {
    set({ isUserAuthenticating: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data.user });
      toast.success("Account Created Success!");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUserAuthenticating: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logout Success!");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  getAdminUsers: async () => {
    try {
      const res = await axiosInstance.get("/auth/admins");
      set({ isAdminUsersFetched: true });
      return res.data.adminUsers;
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
}));

export default useAuthStore;
