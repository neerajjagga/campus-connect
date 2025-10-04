import axiosInstance from "../utils/axios";
import toast from "react-hot-toast";
import { create } from "zustand";
import useAuthStore from "./authStore";

const useEventStore = create((set) => ({
  events: [],
  isEventsFetched: false,
  isCreatingEvent: false,
  isDeletingEvent: false,
  event: null,
  isEventFetched: false,

  setEvents: (data) => set({ events: data }),

  getEvents: async () => {
    set({ isEventsFetched: false });
    try {
      const res = await axiosInstance.get("/events");
      set({ events: res.data.events, isEventsFetched: true });
    } catch (error) {
      toast.error(error.response.data.message);
      useAuthStore.getState().setAuthUser(null);
    }
  },

  getSingleEvent: async (eventId) => {
    set({ isEventFetched: false });
    try {
      const res = await axiosInstance.get(`/events/${eventId}`);
      set({ event: res.data.event, isEventFetched: true });
      return true;
    } catch (error) {
      toast.error(error.response.data.message);
      return false;
    }
  },

  getUserEvents: async (userId) => {
    set({ isEventsFetched: false });
    try {
      const res = await axiosInstance.get(`/events/user/${userId}`);
      set({ events: res.data.events, isEventsFetched: true });
    } catch (error) {
      toast.error(error.response.data.message);
      useAuthStore.getState().setAuthUser(null);
    }
  },

  createNewEvent: async (data) => {
    set({ isCreatingEvent: true });
    console.log(data);
    try {
      await axiosInstance.post("/events", data);
      toast.success("Event Created Success!");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isCreatingEvent: false });
    }
  },

  deleteEvent: async (eventId) => {
    set({ isDeletingEvent: true });
    try {
      await axiosInstance.delete(`/events/${eventId}`);
      toast.success("Event Deleted Success!");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isDeletingEvent: false });
    }
  },

  updateEvent: async (eventId, data) => {
    set({ isUpdatingEvent: true });
    try {
      await axiosInstance.patch(`/events/${eventId}`, data);
      toast.success("Event Updated Success!");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingEvent: false });
    }
  },
}));

export default useEventStore;
