import { create } from "zustand";
import useAuthStore from "./authStore";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axios";

const useChatStore = create((set, get) => ({
  socket: null,
  messages: [],
  onlineUsers: [],
  selectedUser: null,
  isGettingMessages: false,
  isSendingMessage: false,

  setSelectedUser: (userId) => set({ selectedUser: userId }),

  connectSocket: () => {
    const authUser = useAuthStore.getState().authUser;

    if (!authUser || get().socket) return;

    const baseUrl = import.meta.env.MODE === "development" ? `ws://localhost:3000?userId=${authUser._id}` : `ws://campus-connect-twh4.onrender.com?userId=${authUser._id}`

    const socket = new WebSocket(`ws://localhost:3000?userId=${authUser._id}`);

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === "connection") {
        set({ onlineUsers: data.connectedUsers });
      }

      if (data.type === "message") {
        set({ messages: [...get().messages, data.message] });
      }
    };

    set({ socket: socket });
  },

  disconnectSocket: () => {
    if (get().socket) {
      get().socket.close();
      set({ socket: null });
    }
  },

  getMessages: async (userId) => {
    set({ isGettingMessages: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data.messages });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isGettingMessages: false });
    }
  },

  sendMessage: async (data, userId) => {
    set({ isSendingMessage: true });
    try {
      const res = await axiosInstance.post(`/messages/send/${userId}`, data);
      set({messages: [...get().messages, res.data.message]})
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSendingMessage: false });
    }
  },
}));

export default useChatStore;
