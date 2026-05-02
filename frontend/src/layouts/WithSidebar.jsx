import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import AppBar from "../components/AppBar";

export default function WithSidebar({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ display: "flex", width: "100%", overflowX: "hidden" }}>
      
      <Sidebar 
        onToggle={setCollapsed} 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div
        style={{
          marginLeft: isMobile ? "0px" : (collapsed ? "80px" : "280px"),
          width: "100%",
          minHeight: "100vh",
          transition: "margin-left 0.3s ease",
          background: "#f8f9fa",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <AppBar onMenuClick={() => setIsMobileMenuOpen(true)} />

        <div className="flex-grow-1">
          {children}
        </div>
      </div>
    </div>
  );
}