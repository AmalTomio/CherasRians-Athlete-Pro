import StudentDashboard from "./Student/StudentDashboard";
import CoachDashboard from "./Coach/CoachDashboard";
import ExcoDashboard from "./Exco/ExcoDashboard";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  if (!role) return <h3>No role found. Please log in again.</h3>;

  switch (role) {
    case "student":
      return <StudentDashboard />;

    case "coach":
      return <CoachDashboard />;

    case "exco":
      return <ExcoDashboard />;

    default:
      return <h3>Invalid role.</h3>;
  }
}
