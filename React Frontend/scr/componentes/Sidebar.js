import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, TrendingUp, TrendingDown, PieChart, Target, LogOut, User, X } from "lucide-react";

export default function Sidebar({ user, setUser }) {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("profile_pic");
    localStorage.removeItem("user_id");
    setUser(null);
    setShowLogoutModal(false);
    navigate("/login", { replace: true });
  };

  return (
    <>
      <div className="w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col h-screen shadow-2xl">
        {/* Profile Section */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex flex-col items-center">
            {/* Profile Picture with Gradient Border */}
            <div className="relative mb-3">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-sm"></div>
              {user.profile_pic ? (
                <img
                  src={user.profile_pic}
                  alt="Profile"
                  className="relative w-20 h-20 rounded-full object-cover border-4 border-gray-900"
                />
              ) : (
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-4 border-gray-900">
                  <User size={40} className="text-white" />
                </div>
              )}
            </div>
            
            {/* Username */}
            <h2 className="text-lg font-semibold text-white">{user.username}</h2>
            {user.email && (
              <p className="text-xs text-gray-400 mt-1">{user.email}</p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col p-4 space-y-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg"
                  : "hover:bg-gray-700/50"
              }`
            }
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </NavLink>

          <NavLink
            to="/income"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg"
                  : "hover:bg-gray-700/50"
              }`
            }
          >
            <TrendingUp size={20} />
            <span className="font-medium">Income</span>
          </NavLink>

          <NavLink
            to="/expenses"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg"
                  : "hover:bg-gray-700/50"
              }`
            }
          >
            <TrendingDown size={20} />
            <span className="font-medium">Expenses</span>
          </NavLink>

          <NavLink
            to="/budget"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg"
                  : "hover:bg-gray-700/50"
              }`
            }
          >
            <PieChart size={20} />
            <span className="font-medium">Budget</span>
          </NavLink>

          <NavLink
            to="/goals"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg"
                  : "hover:bg-gray-700/50"
              }`
            }
          >
            <Target size={20} />
            <span className="font-medium">Goals</span>
          </NavLink>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all text-gray-300"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Confirm Logout</h3>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="text-red-600" size={32} />
              </div>
              <p className="text-gray-600 text-center">
                Are you sure you want to logout from your account?
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}