import toast from "react-hot-toast";
import axiosInstance from "../utils/axios";
import { create } from "zustand";

const useAuthStore = create((set) => ({
  authUser: JSON.parse(window.localStorage.getItem("authUser")) || null,
  isUserAuthenticating: false,
  isCheckingAuth: false,
  isAdminUsersFetched: false,
  isLoading: false,

  setAuthUser: (data) => {
    set({ authUser: data });
    window.localStorage.setItem("authUser", JSON.stringify(data));
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      window.localStorage.setItem("authUser", JSON.stringify(res.data));
    } catch (error) {
      set({ authUser: null });
      window.localStorage.setItem("authUser", null);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  login: async (data) => {
    set({ isUserAuthenticating: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data.user });
      window.localStorage.setItem("authUser", JSON.stringify(res.data));
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
      window.localStorage.setItem("authUser", JSON.stringify(res.data));
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
      window.localStorage.setItem("authUser", null);
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

  subscribeEmail: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post("/subscribe");
      set({authUser: res.data.user});
      window.localStorage.setItem("authUser", JSON.stringify(res.data.user));
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoading: false });
    }
  },

  unsubscribeEmail: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.delete("/subscribe");
      set({authUser: res.data.user});
      window.localStorage.setItem("authUser", JSON.stringify(res.data.user));
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore;
