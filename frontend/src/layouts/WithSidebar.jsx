import { useState } from "react";
import Sidebar from "../components/Sidebar";
import AppBar from "../components/AppBar";

export default function WithSidebar({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <Sidebar onToggle={setCollapsed} />

      {/* Main Content */}
      <div
        style={{
          marginLeft: collapsed ? "90px" : "280px", // MUST match Sidebar.css
          width: "100%",
          minHeight: "100vh",
          transition: "margin-left 0.25s ease",
          background: "#f9fafb",
        }}
      >
        <AppBar />

        <div style={{ padding: "24px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
