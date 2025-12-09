import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const handleOpenSidebar = () => {
    setSidebarOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
      
      <div className="lg:pl-64 transition-all duration-300">
        <Header 
          onMenuClick={handleOpenSidebar}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <main className="p-4 lg:p-6 animate-fade-in">
          <Outlet context={{ searchQuery }} />
        </main>
      </div>
    </div>
  );
}
