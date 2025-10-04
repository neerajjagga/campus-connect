const ChatMessageSkeleton = () => {
  return <div className="bg-primary-50 border flex flex-col p-2 w-32 rounded-md">
    <div className="skeleton bg-primary-300 rounded-sm w-full h-3 border"></div>
    <div className="skeleton bg-primary-300 rounded-sm w-[75%] h-3 border mt-1"></div>
    <div className="skeleton bg-primary-300 self-end rounded-sm w-4 h-2 border mt-1"></div>
  </div>;
};

export default ChatMessageSkeleton;
