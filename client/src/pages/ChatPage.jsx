import ChatContainer from "../components/ChatContainer";
import Footer from "../components/Footer";
import Header from "../components/Header";
import useAuthStore from "../stores/authStore";
import { chatButtons } from "../utils/constant";
import React, { useEffect, useState } from "react";
import useChatStore from "../stores/chatStore";
import ChatUserSkeleton from "../components/Skeletons/ChatUserSkeleton";
import { MessageSquare, Shield, User } from "lucide-react";

const ChatPage = () => {
  const [activeButton, setActiveButton] = useState("admin");
  const [users, setUsers] = useState([]);

  const { isFetchingUsers, getUsers } = useAuthStore();
  const { onlineUsers, selectedUser, setSelectedUser } = useChatStore();

  useEffect(() => {
    fetchUsers();
    return () => setSelectedUser(null);
  }, [activeButton]);

  const fetchUsers = async () => {
    const users = await getUsers(activeButton);
    setUsers(users);
  };

  const handleClick = async (buttonLabel) => {
    setActiveButton(buttonLabel);
  };

  return (
    <>
      <Header active="chat" />
      <main>
        <div className="w-full max-w-[72rem] py-8 px-6 mx-auto lg:px-10">
          <div className="flex h-[70vh] shadow-md rounded-md border">
            <aside className="flex-[35%] border-r overflow-hidden">
              <div className="h-full flex flex-col">
                <div className="grid grid-cols-2">
                  {chatButtons.map((button, index) => {
                    return (
                      <button
                        key={button.id}
                        className={`flex items-center justify-center gap-2 ${
                          button.label == activeButton
                            ? "bg-primary-500 text-white"
                            : "bg-primary-50 text-primary-500 hover:bg-primary-300 hover:text-white"
                        } ${
                          index == 0 && "rounded-tl-md"
                        } capitalize py-2 border-r border-b transition-colors`}
                        onClick={() => handleClick(button.label)}
                      >
                        <span className="hidden md:inline">
                          {button.label}s
                        </span>
                        {button.label === "admin" ? (
                          <Shield className="size-5" />
                        ) : (
                          <User className="size-5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="overflow-y-scroll flex-grow">
                  {isFetchingUsers ? (
                    <ul className="flex flex-col gap-1">
                      {new Array(5).fill(null).map((_, index) => (
                        <li key={index} className="p-3">
                          <ChatUserSkeleton />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="w-full flex-grow">
                      {users.length === 0 ? (
                        <p className="text-center text-grey-500 py-4 capitalize">
                          No {activeButton} users found
                        </p>
                      ) : (
                        users.map((user) => (
                          <button
                            key={user._id}
                            className={`w-full flex gap-3 p-3 border-b ${
                              user._id === selectedUser
                                ? "bg-primary-500 text-white"
                                : "bg-white text-black"
                            } hover:bg-primary-500 hover:text-white transition-colors group`}
                            onClick={() => setSelectedUser(user._id)}
                          >
                            <div className="relative">
                              <img
                                className={`size-12 p-[1px] rounded-full border ${
                                  user._id === selectedUser
                                    ? "border-white"
                                    : "border-primary-500"
                                } group-hover:border-white`}
                                src={
                                  user.profileImageUrl ||
                                  "../assets/images/avatar.png"
                                }
                                alt={user.name}
                              />
                              {onlineUsers.includes(user._id) && (
                               <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full shadow-[0_0_8px_2px_#22c55e]"></div>
                              )}
                            </div>
                            <div className="hidden custom-md:flex custom-md:flex-col custom-md:items-start">
                              <h4 className="mt-0.5 text-start">{user.name}</h4>
                            </div>
                          </button>
                        ))
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </aside>
            <section className="flex-[65%] bg-primary-50">
              {selectedUser ? (
                <ChatContainer
                  user={users.find((user) => user._id === selectedUser)}
                />
              ) : (
                <div className="flex justify-center items-center h-full">
                  <div className="flex flex-col gap-2 custom-md:gap-3 items-center px-3">
                    <div className="p-2.5 custom-md:p-3.5 bg-primary-300/20 rounded-md custom-md:rounded-xl animate-bounce transition">
                      <MessageSquare className="size-5 custom-md:size-8 text-primary-500" />
                    </div>
                    <h3 className="text-base custom-md:text-xl text-primary-500 custom-md:font-semibold text-center">
                      Select a user to start conversation
                    </h3>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ChatPage;
