const ChatUserSkeleton = () => {
  return (
    <div className="flex items-center gap-4 w-full">
      <div className="skeleton p-0.5 border h-12 w-12 shrink-0 rounded-full"></div>
      <div className="flex flex-col gap-3 w-full">
        <div className="skeleton border h-4 w-[90%]"></div>
        <div className="skeleton border h-4 w-28"></div>
      </div>
    </div>
  );
};

export default ChatUserSkeleton;
