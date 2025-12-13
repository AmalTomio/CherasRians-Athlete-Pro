import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import moment from "moment-timezone";

moment.tz.setDefault("Asia/Kuala_Lumpur");

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ManageStudents from "./pages/Exco/ManageStudents";
import Players from "./pages/Coach/Players";
import CoachFacilities from "./pages/Coach/Facilities";
import ExcoBooking from "./pages/Exco/Booking";
import Medical from "./pages/Student/Medical";
import MedicalLeaveReview from "./pages/Coach/MedicalLeaveReview";
import ProtectedRoute from "./components/ProtectedRoute";
import WithSidebar from "./layouts/WithSidebar";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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

        <Route
          path="/exco/manageStudents"
          element={
            <ProtectedRoute>
              <WithSidebar>
                <ManageStudents />
              </WithSidebar>
            </ProtectedRoute>
          }
        />

        <Route
          path="/coach/players"
          element={
            <ProtectedRoute>
              <WithSidebar>
                <Players />
              </WithSidebar>
            </ProtectedRoute>
          }
        />
        <Route
          path="/coach/facilities"
          element={
            <ProtectedRoute>
              <WithSidebar>
                <CoachFacilities />
              </WithSidebar>
            </ProtectedRoute>
          }
        />
 <Route
          path="/coach/medical"
          element={
            <ProtectedRoute>
              <WithSidebar>
                <MedicalLeaveReview />
              </WithSidebar>
            </ProtectedRoute>
          }
        />
        <Route
          path="/exco/booking"
          element={
            <ProtectedRoute>
              <WithSidebar>
                <ExcoBooking />
              </WithSidebar>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/medical"
          element={
            <ProtectedRoute>
              <WithSidebar>
                <Medical/>
              </WithSidebar>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
