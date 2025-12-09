import React, { useState, useRef, useEffect } from "react";
import { Menu, Bell, Sun, Moon, Search, Settings, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { format, formatDistanceToNow } from "date-fns";

export default function Header({ onMenuClick, searchQuery, onSearchChange }) {
  const navigate = useNavigate();
  const { theme, toggleTheme, getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  
  const notifications = getUserNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return "bg-success";
      case "warning":
        return "bg-warning";
      case "info":
        return "bg-info";
      default:
        return "bg-primary";
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-card/90 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-accent active:bg-accent/80 transition-all duration-200"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          
          <div className="hidden sm:flex items-center gap-2 bg-background border border-input rounded-lg px-3 py-2 w-64 lg:w-80 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks, team members..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => onSearchChange("")}
                className="hover:bg-accent rounded p-0.5 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2.5 rounded-lg hover:bg-accent active:scale-95 transition-all duration-200 group"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5 text-foreground group-hover:rotate-12 transition-transform duration-300" />
            ) : (
              <Sun className="w-5 h-5 text-foreground group-hover:rotate-45 transition-transform duration-300" />
            )}
          </button>

          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2.5 rounded-lg hover:bg-accent active:scale-95 transition-all duration-200 ${
                showNotifications ? "bg-accent" : ""
              }`}
            >
              <Bell className={`w-5 h-5 text-foreground ${unreadCount > 0 ? "animate-bell-ring" : ""}`} />
              {unreadCount > 0 && (
                <span className="notification-dot">{unreadCount > 9 ? "9+" : unreadCount}</span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-xl shadow-xl animate-scale-in overflow-hidden z-50">
                <div className="flex items-center justify-between p-4 border-b border-border bg-card">
                  <h3 className="font-semibold text-foreground">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-primary hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                
                <div className="max-h-80 overflow-y-auto scrollbar-thin bg-card">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((notification, index) => (
                      <div
                        key={notification.id}
                        onClick={() => markNotificationAsRead(notification.id)}
                        className={`p-4 border-b border-border last:border-0 cursor-pointer hover:bg-accent/50 transition-all duration-200 animate-fade-in ${
                          !notification.read ? "bg-primary/5" : "bg-card"
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${getNotificationIcon(notification.type)} animate-pulse`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="p-2.5 rounded-lg hover:bg-accent active:scale-95 transition-all duration-200 group"
          >
            <Settings className="w-5 h-5 text-foreground group-hover:rotate-90 transition-transform duration-500" />
          </button>
        </div>
      </div>
    </header>
  );
}
