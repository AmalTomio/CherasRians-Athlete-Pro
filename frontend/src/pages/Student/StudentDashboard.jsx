import { useEffect, useState } from "react";
import api from "../../api/axios";
import Profile from "../../components/student/Profile";
import Banner from "../../components/student/Banner";

export default function StudentDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api
      .get("/students/me/dashboard")
      .then((res) => setData(res.data))
      .catch(console.error);
  }, []);

  if (!data) return null;

  return (
    <div
      style={{
        padding: "1.5rem 2rem",
      }}
    >
      <Banner student={data.student} />

      <Profile student={data.student} coach={data.coach} />
    </div>
  );
}
