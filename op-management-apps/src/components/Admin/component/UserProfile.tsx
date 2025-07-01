import React, { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";

interface UserProfileProps {
  name: string;
  email: string;
  imageUrl?: string;
  onUpdatePassword?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  imageUrl = "/images/user-pic.png",
  onUpdatePassword,
}) => {
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const { user } = useSelector((state: RootState) => state.auth);
  // const dispatch = useDispatch<AppDispatch>();
  console.log(user, "check user deatils");

  const handleUpdateClick = () => {
    setShowPasswordFields(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdatePassword) {
      onUpdatePassword();
    }

    setOldPassword("");
    setNewPassword("");
    setShowPasswordFields(false);
  };

  return (
    <div className="w-100 bg-white rounded-xl shadow-lg p-8 flex flex-col items-center space-y-5">
      <img
        src={imageUrl}
        alt="Profile"
        className="w-28 h-28 rounded-full border-4 border-blue-200 shadow-md object-cover"
      />
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          {user.username}
        </h2>
        <p className="text-gray-500 text-base">{user.email}</p>
      </div>
      {!showPasswordFields ? (
        <button
          className="mt-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg shadow hover:from-blue-700 hover:to-blue-500 transition font-semibold"
          onClick={handleUpdateClick}
        >
          Update Password
        </button>
      ) : (
        <form
          className="w-full flex flex-col items-center space-y-3"
          onSubmit={handlePasswordSubmit}
        >
          <input
            type="password"
            placeholder="Enter old password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter new password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <div className="flex w-full justify-between space-x-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              onClick={() => setShowPasswordFields(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Save
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UserProfile;
