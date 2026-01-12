import { useState, useEffect } from "react";
import api from "../../api/axios";
import { successAlert, errorAlert } from "../../utils/swal";
import FiltersCard from "../../components/FiltersCard";
import {
  getClassOptionsForYear,
  ALL_CLASS_GROUPS,
} from "../../config/classGroups";

/* ===========================
   Skeleton Loader
=========================== */
function SkeletonRows({ cols = 7, rows = 6 }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={`skeleton-${r}`}>
          {Array.from({ length: cols }).map((__, c) => (
            <td key={`s-${r}-${c}`}>
              <div className="placeholder-glow">
                <span className="placeholder col-12" style={{ height: 20 }} />
              </div>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

/* ===========================
   Main Component
=========================== */
export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editYear, setEditYear] = useState("");
  const [editClass, setEditClass] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [year, setYear] = useState("");
  const [classGroup, setClassGroup] = useState("");
  const [sport, setSport] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const limit = 10;

  /* ===========================
     Debounce Search
  =========================== */
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  /* ===========================
     Fetch Students
  =========================== */
  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/exco/students", {
        params: {
          page,
          limit,
          search: debouncedSearch,
          year,
          classGroup,
          sport,
        },
      });

      setStudents(
        res.data.students.map((s) => ({
          userId: s.userId || s._id,
          ...s,
        }))
      );

      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
      errorAlert("Failed to fetch students.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ===========================
     Auto Fetch
  =========================== */
  useEffect(() => {
    fetchStudents();
  }, [page, debouncedSearch, year, classGroup, sport]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, year, classGroup, sport]);

  /* ===========================
     Actions
  =========================== */
  const handleAssignSport = async (id, sport) => {
    try {
      await api.put(`/exco/students/${id}/sport`, { sport });
      successAlert("Sport assigned");
      fetchStudents();
    } catch {
      errorAlert("Failed to assign sport");
    }
  };

  const startEdit = (s) => {
    setEditingId(s.userId);
    setEditYear(s.year || "");
    setEditClass(s.classGroup || "");
    setEditClass("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditYear("");
    setEditClass("");
  };

  const saveAcademic = async (id) => {
    try {
      await api.put(`/exco/students/${id}/academic`, {
        year: editYear,
        classGroup: editClass,
      });
      successAlert("Academic info updated");
      cancelEdit();
      fetchStudents();
    } catch {
      errorAlert("Failed to update student");
    }
  };

  const deleteStudent = async (id) => {
    if (!window.confirm("Delete this student permanently?")) return;
    try {
      await api.delete(`/exco/students/${id}`);
      successAlert("Student deleted");
      fetchStudents();
    } catch {
      errorAlert("Failed to delete student");
    }
  };

  /* ===========================
     Render
  =========================== */
  return (
    <div>
      <h2 className="mb-1">Manage Students</h2>
      <p className="text-muted mb-4">
        Manage student academic placement and sport assignment.
      </p>

      <FiltersCard
        search={search}
        setSearch={setSearch}
        year={year}
        setYear={setYear}
        classGroup={classGroup}
        setClassGroup={setClassGroup}
        sport={sport}
        setSport={setSport}
        showYear
        showClass
        showSport
        onReset={() => {
          setSearch("");
          setYear("");
          setClassGroup("");
          setSport("");
          setPage(1);
        }}
      />

      <div className="card p-3 shadow-sm">
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead className="table-light">
              <tr>
                <th>No</th>
                <th>Name</th>
                <th>Form</th>
                <th>Class</th>
                <th>Sport</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>

            {isLoading ? (
              <SkeletonRows />
            ) : (
              <tbody>
                {students.length > 0 ? (
                  students.map((s, index) => {
                    const editing = editingId === s.userId;

                    return (
                      <tr key={s.userId}>
                        <td>{(page - 1) * limit + index + 1}</td>
                        <td className="fw-medium">
                          {s.firstName} {s.lastName}
                        </td>

                        <td>
                          {editing ? (
                            <select
                              className="form-select form-select-sm"
                              value={editYear}
                              onChange={(e) => setEditYear(e.target.value)}
                            >
                              {[1, 2, 3, 4, 5].map((y) => (
                                <option key={y} value={y}>
                                  Form {y}
                                </option>
                              ))}
                            </select>
                          ) : (
                            s.year ?? "-"
                          )}
                        </td>

                        <td>
                          {editing ? (
                            <select
                              className="form-select form-select-sm"
                              value={editClass}
                              onChange={(e) => setEditClass(e.target.value)}
                            >
                              <option value="">Select Class</option>
                              {(getClassOptionsForYear(editYear)?.length
                                ? getClassOptionsForYear(editYear)
                                : ALL_CLASS_GROUPS
                              ).map((cls) => (
                                <option key={cls} value={cls}>
                                  {cls}
                                </option>
                              ))}
                            </select>
                          ) : (
                            s.classGroup ?? "-"
                          )}
                        </td>

                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={s.sport || ""}
                            disabled={editing}
                            onChange={(e) =>
                              handleAssignSport(s.userId, e.target.value)
                            }
                          >
                            <option value="">Not Assigned</option>
                            <option value="football">Football</option>
                            <option value="volleyball">Volleyball</option>
                            <option value="sepak_takraw">Sepak Takraw</option>
                            <option value="badminton">Badminton</option>
                            <option value="netball">Netball</option>
                          </select>
                        </td>

                        <td className="text-center">
                          {editing ? (
                            <>
                              <button
                                className="btn btn-sm btn-success me-2"
                                onClick={() => saveAcademic(s.userId)}
                              >
                                Save
                              </button>
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={cancelEdit}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => startEdit(s)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => deleteStudent(s.userId)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-center mt-3">
          <ul className="pagination mb-0">
            <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
            </li>

            {[...Array(totalPages)].map((_, i) => (
              <li
                key={i}
                className={`page-item ${page === i + 1 ? "active" : ""}`}
              >
                <button className="page-link" onClick={() => setPage(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}

            <li
              className={`page-item ${page === totalPages ? "disabled" : ""}`}
            >
              <button
                className="page-link"
                onClick={() => setPage((p) => p + 1)}
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
