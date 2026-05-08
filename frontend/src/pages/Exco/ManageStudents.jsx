import { useState, useEffect } from "react";
import api from "../../api/axios";
import { successAlert, errorAlert } from "../../utils/swal";
import FiltersCard from "../../components/FiltersCard";
import SkeletonTableLoader from "../../components/SkeletonTableLoader";
import HeroBanner from "../../components/HeroBanner";

import {
  getClassOptionsForYear,
  ALL_CLASS_GROUPS,
} from "../../config/classGroups";
import { 
  FiEdit2, 
  FiTrash2, 
  FiSave, 
  FiX, 
  FiChevronLeft, 
  FiChevronRight,
  FiUser
} from "react-icons/fi";

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [editingId, setEditingId] = useState(null);
  const [editYear, setEditYear] = useState("");
  const [editClass, setEditClass] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [year, setYear] = useState("");
  const [classGroup, setClassGroup] = useState("");
  const [sport, setSport] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const limit = 10;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);


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

 
  useEffect(() => {
    fetchStudents();
  }, [page, debouncedSearch, year, classGroup, sport]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, year, classGroup, sport]);


  const handleAssignSport = async (id, sport) => {
    try {
      await api.put(`/exco/students/${id}/sport`, { sport });
      successAlert("Sport assigned successfully");
      fetchStudents();
    } catch {
      errorAlert("Failed to assign sport");
    }
  };

  const startEdit = (s) => {
    setEditingId(s.userId);
    setEditYear(s.year || "");
    setEditClass(s.classGroup || "");
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
    if (!window.confirm("Are you sure you want to delete this student profile permanently?")) return;
    try {
      await api.delete(`/exco/students/${id}`);
      successAlert("Student profile deleted");
      fetchStudents();
    } catch {
      errorAlert("Failed to delete student");
    }
  };

  // Helper for Initials
  const getInitials = (f, l) => `${f?.charAt(0) || ""}${l?.charAt(0) || ""}`.toUpperCase();

  return (
    <div className="px-4 py-4">
      {/* HEADER */}
      <HeroBanner 
            title="Manage Students"
            subtitle="Oversee academic placement and sport assignments."
          />

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

      {/* TABLE CARD */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                {/* 1. Added Number Column Header */}
                <th className="py-3 px-4 text-uppercase text-secondary small fw-bold" style={{ width: "60px" }}>No</th>
                <th className="py-3 text-uppercase text-secondary small fw-bold">Student</th>
                <th className="py-3 text-uppercase text-secondary small fw-bold">Academic Form</th>
                <th className="py-3 text-uppercase text-secondary small fw-bold">Class Group</th>
                <th className="py-3 text-uppercase text-secondary small fw-bold">Sport</th>
                <th className="py-3 text-end px-4 text-uppercase text-secondary small fw-bold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                // Assuming SkeletonTableLoader can handle extra col, or just standard loading
                <SkeletonTableLoader rows={6} />
              ) : students.length > 0 ? (
                students.map((s, index) => {
                  const editing = editingId === s.userId;
                  // Calculate Global Number
                  const listNumber = (page - 1) * limit + index + 1;

                  return (
                    <tr key={s.userId} className={editing ? "bg-primary-subtle" : ""}>
                      
                      {/* 2. Added List Number Cell */}
                      <td className="px-4 text-secondary fw-semibold">
                        {listNumber}
                      </td>

                      {/* NAME & AVATAR */}
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                            style={{ 
                              width: "40px", 
                              height: "40px", 
                              background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)", 
                              fontSize: "14px"
                            }}
                          >
                            {getInitials(s.firstName, s.lastName)}
                          </div>
                          <div className="d-flex flex-column">
                            <span className="fw-bold text-dark">{s.firstName} {s.lastName}</span>
                          </div>
                        </div>
                      </td>

                      {/* FORM (Editable) */}
                      <td>
                        {editing ? (
                          <select
                            className="form-select form-select-sm border-primary text-primary fw-bold"
                            value={editYear}
                            onChange={(e) => setEditYear(e.target.value)}
                            style={{ width: "100px" }}
                          >
                            {[1, 2, 3, 4, 5].map((y) => (
                              <option key={y} value={y}>Form {y}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="badge bg-light text-dark border px-3 py-2">
                            Form {s.year ?? "-"}
                          </span>
                        )}
                      </td>

                      {/* CLASS (Editable) */}
                      <td>
                        {editing ? (
                          <select
                            className="form-select form-select-sm border-primary text-primary fw-bold"
                            value={editClass}
                            onChange={(e) => setEditClass(e.target.value)}
                            style={{ width: "120px" }}
                          >
                            <option value="">Select...</option>
                            {(getClassOptionsForYear(editYear)?.length
                              ? getClassOptionsForYear(editYear)
                              : ALL_CLASS_GROUPS
                            ).map((cls) => (
                              <option key={cls} value={cls}>{cls}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="fw-medium text-secondary">{s.classGroup ?? "-"}</span>
                        )}
                      </td>

                      {/* SPORT (Inline Edit Always Available) */}
                      <td>
                        <select
                          className={`form-select form-select-sm border-0 fw-bold ${s.sport ? "text-indigo bg-indigo-subtle" : "text-muted bg-light"}`}
                          value={s.sport || ""}
                          disabled={editing}
                          onChange={(e) => handleAssignSport(s.userId, e.target.value)}
                          style={{ 
                            width: "140px", 
                            cursor: editing ? "not-allowed" : "pointer",
                            color: s.sport ? "#4f46e5" : "#64748b" 
                          }}
                        >
                          <option value="">Unassigned</option>
                          <option value="football">Football</option>
                          <option value="volleyball">Volleyball</option>
                          <option value="sepak_takraw">Sepak Takraw</option>
                          <option value="badminton">Badminton</option>
                          <option value="netball">Netball</option>
                        </select>
                      </td>

                      {/* ACTIONS */}
                      <td className="text-end px-4">
                        {editing ? (
                          <div className="d-flex gap-2 justify-content-end">
                            <button
                              className="btn btn-sm btn-success shadow-sm d-flex align-items-center gap-1"
                              onClick={() => saveAcademic(s.userId)}
                            >
                              <FiSave /> Save
                            </button>
                            <button
                              className="btn btn-sm btn-light border d-flex align-items-center gap-1"
                              onClick={cancelEdit}
                            >
                              <FiX />
                            </button>
                          </div>
                        ) : (
                          <div className="d-flex gap-2 justify-content-end">
                            <button
                              className="btn btn-sm btn-white border shadow-sm text-primary hover-scale"
                              onClick={() => startEdit(s)}
                              title="Edit Academic Info"
                              style={{ width: "32px", height: "32px", padding: 0 }}
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              className="btn btn-sm btn-white border shadow-sm text-danger hover-scale"
                              onClick={() => deleteStudent(s.userId)}
                              title="Delete Student"
                              style={{ width: "32px", height: "32px", padding: 0 }}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="text-muted d-flex flex-column align-items-center">
                      <FiUser size={48} className="mb-3 opacity-25" />
                      <h6 className="fw-bold">No students found</h6>
                      <small>Try adjusting your filters to see results.</small>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!isLoading && students.length > 0 && (
          <div className="card-footer bg-white border-top py-3 d-flex justify-content-between align-items-center px-4">
            <small className="text-muted">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </small>

            <nav>
              <ul className="pagination mb-0 gap-1">
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link border-0 rounded-3 text-secondary"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <FiChevronLeft />
                  </button>
                </li>

                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                   let pNum = i + 1;
                   if (totalPages > 5 && page > 3) pNum = page - 2 + i;
                   if (pNum > totalPages) pNum = totalPages - (4 - i);
                   
                   return (
                    <li key={i} className="page-item">
                      <button
                        className={`page-link border-0 rounded-3 fw-bold ${page === pNum ? "shadow-sm text-white" : "text-secondary"}`}
                        style={{ 
                          backgroundColor: page === pNum ? "#6366f1" : "transparent",
                          width: "36px", height: "36px"
                        }}
                        onClick={() => setPage(pNum)}
                      >
                        {pNum}
                      </button>
                    </li>
                   )
                })}

                <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                  <button
                    className="page-link border-0 rounded-3 text-secondary"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <FiChevronRight />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}