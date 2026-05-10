import React from "react";
import { Heart, MessageCircle, UserPlus, TrendingUp } from "lucide-react";

const notifications = [
  {
    id: 1,
    user: "foodie_sarah",
    action: "liked your review of",
    target: "Smash Burger Deluxe",
    time: "2m ago",
    read: false,
    icon: <Heart className="w-4 h-4 text-pink-500" />,
    iconBg: "bg-pink-50",
  },
  {
    id: 2,
    user: "mike_eats",
    action: "commented: 'I need to try this place!'",
    target: "",
    time: "15m ago",
    read: false,
    icon: <MessageCircle className="w-4 h-4 text-blue-500" />,
    iconBg: "bg-blue-50",
  },
  {
    id: 3,
    user: "emma_nom",
    action: "started following you.",
    target: "",
    time: "1h ago",
    read: false,
    icon: <UserPlus className="w-4 h-4 text-green-500" />,
    iconBg: "bg-green-50",
  },
  {
    id: 4,
    user: "BiteYo",
    action: "Your review is trending 🔥",
    target: "",
    time: "2h ago",
    read: true,
    icon: <TrendingUp className="w-4 h-4 text-orange-500" />,
    iconBg: "bg-orange-50",
  },
  {
    id: 5,
    user: "joy_foodtrip",
    action: "liked your review of",
    target: "Al Pastor Tacos",
    time: "3h ago",
    read: true,
    icon: <Heart className="w-4 h-4 text-pink-500" />,
    iconBg: "bg-pink-50",
  },
  {
    id: 6,
    user: "lisa_sweed",
    action: "commented: 'Looks amazing! 😍'",
    target: "",
    time: "5h ago",
    read: true,
    icon: <MessageCircle className="w-4 h-4 text-blue-500" />,
    iconBg: "bg-blue-50",
  },
];

export default function AlertsPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24">
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">Notifications</h1>
          <button className="text-sm text-pink-500 font-medium hover:text-pink-600 transition-colors">
            Mark all as read
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border ${
                !notif.read ? "border-pink-100" : "border-gray-100"
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-orange-300 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {notif.user[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 leading-snug">
                  <span className="font-semibold text-gray-900">
                    {notif.user}
                  </span>{" "}
                  {notif.action}{" "}
                  {notif.target && (
                    <span className="font-semibold text-gray-900">
                      {notif.target}
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <div className={`rounded-full p-0.5 ${notif.iconBg}`}>
                    {notif.icon}
                  </div>
                  <span className="text-xs text-gray-400">{notif.time}</span>
                </div>
              </div>
              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-pink-500 mt-1.5 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}