// src/pages/Exco/ManageStudents.jsx
import { useState, useEffect } from "react";
import api from "../../api/axios";
import { successAlert, errorAlert } from "../../utils/swal";
import FiltersCard from "../../components/FiltersCard";

function SkeletonRows({ cols = 5, rows = 6 }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={`skeleton-${r}`}>
          {Array.from({ length: cols }).map((__, c) => (
            <td key={`s-${r}-${c}`}>
              <div className="placeholder-glow">
                <span className="placeholder col-12" style={{ height: 20 }}></span>
              </div>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [year, setYear] = useState("");
  const [classGroup, setClassGroup] = useState("");
  const [sport, setSport] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const limit = 10;

  // Fetch students
  const fetchStudents = async (opts = {}) => {
    setIsLoading(true);
    try {
      const res = await api.get("/exco/students", {
        params: {
          page,
          limit,
          search,
          year,
          classGroup,
          sport,
          ...opts,
        },
      });

      const studentsOut = res.data.students.map((s) => ({
        userId: s.userId || s._id || s._id?.toString?.() || s.userId,
        ...s,
      }));

      setStudents(studentsOut);
      setTotalPages(res.data.totalPages || Math.ceil((res.data.total || 0) / limit) || 1);
    } catch (err) {
      console.error(err);
      errorAlert("Failed to fetch students.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleFilter = () => {
    setPage(1);
    fetchStudents();
  };

  const handleAssignSport = async (studentId, selectedSport) => {
    try {
      await api.put(`/exco/students/${studentId}/sport`, {
        sport: selectedSport,
      });

      successAlert("Sport assigned successfully!");
      fetchStudents();
    } catch (err) {
      console.error(err);
      errorAlert("Failed to assign sport.");
    }
  };

  return (
    <div>
      <h2 className="mb-4">Manage Students</h2>

      <FiltersCard
        search={search}
        setSearch={setSearch}
        year={year}
        setYear={setYear}
        classGroup={classGroup}
        setClassGroup={setClassGroup}
        sport={sport}
        setSport={setSport}
        onFilter={handleFilter}
        onReset={() => {
          setPage(1);
          fetchStudents();
        }}
        showYear={true}
        showClass={true}
        showSport={true}
      />

      <div className="card p-3">
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>#</th>
              <th>Full Name</th>
              <th>Form</th>
              <th>Class</th>
              <th>Sport (Assign)</th>
            </tr>
          </thead>

          {/* Skeleton while loading */}
          {isLoading ? (
            <SkeletonRows cols={5} rows={6} />
          ) : (
            <tbody>
              {students.length > 0 ? (
                students.map((s, index) => (
                  <tr key={s.userId || s._id || index}>
                    <td>{(page - 1) * limit + (index + 1)}</td>
                    <td>{s.firstName + " " + s.lastName}</td>
                    <td>{s.year ?? "-"}</td>
                    <td>{s.classGroup ?? "-"}</td>
                    <td>
                      <select
                        className="form-select"
                        value={s.sport || ""}
                        onChange={(e) => handleAssignSport(s.userId || s._id, e.target.value)}
                      >
                        <option value="">Not Assigned</option>
                        <option value="football">Football</option>
                        <option value="volleyball">Volleyball</option>
                        <option value="sepak_takraw">Sepak Takraw</option>
                        <option value="badminton">Badminton</option>
                        <option value="netball">Netball</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-3">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          )}
        </table>

        {/* PAGINATION */}
        <div className="d-flex justify-content-center mt-3">
          <ul className="pagination">
            <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => page > 1 && setPage((p) => p - 1)}
              >
                Previous
              </button>
            </li>

            {[...Array(totalPages)].map((_, i) => (
              <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}>
                <button className="page-link" onClick={() => setPage(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}

            <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => page < totalPages && setPage((p) => p + 1)}
              >
                Next
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
