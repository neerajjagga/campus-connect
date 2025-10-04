import toast from "react-hot-toast";
import axiosInstance from "../utils/axios";
import { create } from "zustand";
import useChatStore from "./chatStore";

const useAuthStore = create((set) => ({
  authUser: JSON.parse(window.localStorage.getItem("authUser")) || null,
  isUserAuthenticating: false,
  isCheckingAuth: false,
  isFetchingUsers: false,
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
      useChatStore.getState().connectSocket();
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
      window.localStorage.setItem("authUser", JSON.stringify(res.data.user));
      useChatStore.getState().connectSocket();
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
      window.localStorage.setItem("authUser", JSON.stringify(res.data.user));
      useChatStore.getState().connectSocket();
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
      useChatStore.getState().disconnectSocket();
      toast.success("Logout Success!");
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  },

  getUsers: async (role) => {
    set({ isFetchingUsers: true });
    try {
      const res = await axiosInstance.get(`/auth/users/${role}`);
      return res.data.users;
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isFetchingUsers: false });
    }
  },

  subscribeEmail: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post("/auth/subscribe");
      set({ authUser: res.data.user });
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
      const res = await axiosInstance.delete("/auth/unsubscribe");
      set({ authUser: res.data.user });
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
