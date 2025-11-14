import { getCurrentUserId } from "../../hook/GetCurrentUserId";
export const ActiveFriends = ({ conversations }) => {
  const activeFriends = conversations.filter((c) => c.online);

  return (
    <div className="px-4 py-3 border-b border-gray-200 bg-white">
      <div className="flex items-center space-x-3 overflow-x-auto scrollbar-hide">
        <div className="flex flex-col items-center flex-shrink-0 cursor-pointer">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr  from-[#E90000] to-[#FAA6FF] p-0.5">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=You"
                alt="Your story"
                className="w-full h-full rounded-full border-2 border-white"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-4 h-4 from-[#E90000] to-[#FAA6FF] rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-white text-xs font-bold">+</span>
            </div>
          </div>
          <span className="text-xs text-gray-600 mt-1 truncate w-14 text-center">
            Your story
          </span>
        </div>

        {activeFriends.map((friend) => (
          <div
            key={friend.id}
            className="flex flex-col items-center flex-shrink-0 cursor-pointer"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr  from-[#E90000] to-[#FAA6FF] p-0.5">
                <img
                  src={friend.avatar_url}
                  alt={friend.username}
                  className="w-full h-full rounded-full border-2 border-white"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <span className="text-xs text-gray-600 mt-1 truncate w-14 text-center">
              {friend.username.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
