import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import moment from "moment-timezone";

moment.tz.setDefault("Asia/Kuala_Lumpur");

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Shared Pages
import Dashboard from "./pages/Dashboard";

// Exco Pages
import ManageStudents from "./pages/Exco/ManageStudents";
import ExcoBooking from "./pages/Exco/Booking";

// Coach Pages
import Players from "./pages/Coach/Players";
import CoachFacilities from "./pages/Coach/Facilities";
import MedicalLeaveReview from "./pages/Coach/MedicalLeaveReview";
import Attendance from "./pages/Coach/Attendance";

// Student Pages
import Medical from "./pages/Student/Medical";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import WithSidebar from "./layouts/WithSidebar";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes with Sidebar */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <WithSidebar>
                <Dashboard />
              </WithSidebar>
            </ProtectedRoute>
          }
        />

        {/* Exco Routes */}
        <Route
          path="/exco/manageStudents"
          element={
            <ProtectedRoute allowedRoles={["exco"]}>
              <WithSidebar>
                <ManageStudents />
              </WithSidebar>
            </ProtectedRoute>
          }
        />

        <Route
          path="/exco/booking"
          element={
            <ProtectedRoute allowedRoles={["exco"]}>
              <WithSidebar>
                <ExcoBooking />
              </WithSidebar>
            </ProtectedRoute>
          }
        />

        {/* Coach Routes */}
        <Route
          path="/coach/players"
          element={
            <ProtectedRoute allowedRoles={["coach"]}>
              <WithSidebar>
                <Players />
              </WithSidebar>
            </ProtectedRoute>
          }
        />

        <Route
          path="/coach/facilities"
          element={
            <ProtectedRoute allowedRoles={["coach"]}>
              <WithSidebar>
                <CoachFacilities />
              </WithSidebar>
            </ProtectedRoute>
          }
        />

        <Route
          path="/coach/medical"
          element={
            <ProtectedRoute allowedRoles={["coach"]}>
              <WithSidebar>
                <MedicalLeaveReview />
              </WithSidebar>
            </ProtectedRoute>
          }
        />

        <Route
          path="/coach/attendance"
          element={
            <ProtectedRoute allowedRoles={["coach"]}>
              <WithSidebar>
                <Attendance />
              </WithSidebar>
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/medical"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <WithSidebar>
                <Medical />
              </WithSidebar>
            </ProtectedRoute>
          }
        />

        {/* 404 Not Found */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}