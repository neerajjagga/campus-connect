import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./stores/authStore";

import HomePage from "./pages/HomePage";
import CreateEventPage from "./pages/CreateEventPage";
import EventsPage from "./pages/EventsPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/DashboardPage";
import ClubsPage from "./pages/ClubsPage";
import CreateClubPage from "./pages/CreateClubPage";
import SingleEventPage from "./pages/SingleEventPage";
import SingleClubPage from "./pages/SingleClubPage";
import EditEventPage from "./pages/EditEventPage";
import EditClubPage from "./pages/EditClubPage";
import ChatPage from "./pages/ChatPage";

const App = () => {
  const { isCheckingAuth, authUser, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    console.log(isCheckingAuth, authUser);
  }, [isCheckingAuth]);

  if (isCheckingAuth) {
    return (
      <div className="h-screen flex justify-center items-center">
        <img
          src="../assets/images/logo.png"
          alt="Logo"
          className="size-[3rem] animate-spin"
        />
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/events"
          element={!authUser ? <Navigate to="/login" /> : <EventsPage />}
        />
        <Route
          path="/clubs"
          element={!authUser ? <Navigate to="/login" /> : <ClubsPage />}
        />
        <Route
          path="/chat"
          element={authUser ? <ChatPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/events/:eventId"
          element={authUser ? <SingleEventPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/clubs/:clubId"
          element={authUser ? <SingleClubPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/dashboard"
          element={
            authUser ? (
              authUser.role === "admin" ? (
                <DashboardPage />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/create-event"
          element={
            authUser ? (
              authUser.role === "admin" ? (
                <CreateEventPage />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/create-club"
          element={
            authUser ? (
              authUser.role === "admin" ? (
                <CreateClubPage />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/events/edit/:eventId"
          element={
            authUser ? (
              authUser.role === "admin" ? (
                <EditEventPage />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/clubs/edit/:clubId"
          element={
            authUser ? (
              authUser.role === "admin" ? (
                <EditClubPage />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>

      <Toaster position="bottom-right" reverseOrder={true} />
    </>
  );
};

export default App;
