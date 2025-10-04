import useAuthStore from "../stores/authStore";
import useChatStore from "../stores/chatStore";
import { Image, Send, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import FullImageViewModal from "./FullImageViewModal";
import formatDate from "../utils/formatDate";
import ChatMessageSkeleton from "./Skeletons/ChatMessageSkeleton";

const ChatContainer = ({ user }) => {
  const {
    messages,
    onlineUsers,
    selectedUser,
    setSelectedUser,
    isGettingMessages,
    getMessages,
    sendMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const [image, setImage] = useState({ src: null, alt: null });
  const [showFullImageViewModal, setShowFullImageViewModal] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      getMessages(user._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() && !imagePreview) {
      return;
    }

    let data = {};

    if (message.trim()) {
      data.text = message.trim();
    }

    if (imagePreview) {
      data.image = imagePreview;
    }

    sendMessage(data, user._id);
    setMessage("");
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file!");
      return;
    }

    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only png, jpg, jpeg and webp images are allowed.");
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
    };
  };

  function handleFullImageView(src, alt) {
    setShowFullImageViewModal(true);
    setImage({ src, alt });
  }

  return (
    <>
      {showFullImageViewModal && (
        <FullImageViewModal
          src={image.src}
          alt={image.alt}
          setShowFullImageViewModal={setShowFullImageViewModal}
        />
      )}
      <div className="flex flex-col h-full">
        <div className="px-4 py-2 border-b flex justify-between items-center">
          <div className="flex gap-3">
            <img
              className="w-12 h-12 rounded-full p-[1px] border border-primary-500 custom-md:w-16 custom-md:h-16"
              src={user.profileImageUrl || "../assets/images/avatar.png"}
              alt={user.name}
            />
            <div className="flex flex-col">
              <h3 className="custom-md:mt-1 text-base custom-md:text-lg">
                {user.name}
              </h3>
              <h6 className="text-sm custom-md:text-[0.95rem]">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </h6>
            </div>
          </div>
          <button
            className="hidden custom-sm:block p-1 border text-primary-500 border-primary-500 rounded-full hover:bg-primary-500 hover:text-white transition-colors"
            onClick={() => setSelectedUser(null)}
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-grow overflow-y-scroll bg-white">
          {isGettingMessages ? (
            <ul className="flex flex-col gap-2.5 p-4">
              {new Array(5).fill(null).map((_, index) => {
                return (
                  <li
                    key={index}
                    className={`${index % 2 == 0 ? "self-start" : "self-end"}`}
                  >
                    <ChatMessageSkeleton />
                  </li>
                );
              })}
            </ul>
          ) : (
            <ul className="flex flex-col gap-2.5 p-4">
              {messages.map((message) => {
                return (
                  <li
                    key={message._id}
                    className={`relative flex flex-col max-w-[49%] p-2 rounded-md shadow-md ${
                      message.senderId === authUser._id
                        ? "self-end bg-primary-500 text-white"
                        : "self-start bg-primary-50 text-primary-500"
                    }`}
                  >
                    {message.imageUrl && (
                      <img
                        className="rounded-md aspect-square object-cover mb-1 cursor-pointer"
                        src={message.imageUrl}
                        alt={
                          message.senderId === authUser._id
                            ? authUser.name
                            : user.name
                        }
                        onClick={() =>
                          handleFullImageView(
                            message.imageUrl,
                            message.senderId === authUser._id
                              ? authUser.name
                              : user.name
                          )
                        }
                      />
                    )}
                    {message.text && (
                      <p className="text-[0.9rem]">{message.text}</p>
                    )}
                    <span className="text-[0.7rem] self-end">
                      {formatDate(message.createdAt)}
                    </span>
                  </li>
                );
              })}
              <div ref={messagesEndRef} />
            </ul>
          )}
        </div>
        <div className="relative">
          {imagePreview && (
            <div className="absolute -top-32 right-6">
              <div className="relative">
                <img
                  className="border border-primary-500 rounded-md shadow-md w-32 h-32 object-cover"
                  src={imagePreview}
                />
                <button
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-white text-primary-500 border border-primary-500 hover:bg-primary-500 hover:text-white transition"
                  onClick={() => setImagePreview(null)}
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          )}
          <form
            onSubmit={handleSubmit}
            className="p-4 border-t flex items-center gap-1.5 custom-md:gap-3"
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleImageChange}
            />
            <input
              type="text"
              placeholder="Type a message"
              className="w-full px-3 py-1.5 rounded-full outline-none bg-transparent ring-1 ring-primary-500 focus:ring-2 placeholder:text-primary-500"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              type="button"
              className="p-2 rounded-full border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white"
              onClick={() => fileInputRef.current?.click()}
            >
              <Image className="size-5" />
            </button>
            <button
              type="submit"
              className="p-2 rounded-full border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white disabled:bg-gray-300 disabled:border-gray-300 disabled:text-gray-100"
              disabled={!imagePreview && !message.trim()}
            >
              <Send className="size-5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChatContainer;
