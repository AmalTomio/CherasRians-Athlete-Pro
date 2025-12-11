import { useState } from "react";
import Sidebar from "../components/Sidebar";
import AppBar from "../components/AppBar";

export default function WithSidebar({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <Sidebar onToggle={(c) => setCollapsed(c)} />

      {/* Right Section */}
      <div
        className="flex-grow-1"
        style={{
          marginLeft: collapsed ? "80px" : "300px",
          transition: "margin-left 0.25s ease",
          width: "100%",
        }}
      >
        <AppBar />

        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
