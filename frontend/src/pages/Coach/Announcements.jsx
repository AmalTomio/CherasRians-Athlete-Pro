import { useState, useMemo, useCallback } from "react";
import api from "../../api/axios";
import { SPORT_META } from "../../config/sportMeta";
import { successAlert, errorAlert } from "../../utils/swal";
import useDebouncedUserSearch from "../../hooks/useDebouncedUserSearch";
import useAnnouncements from "../../hooks/useAnnouncements";

export default function Announcements() {

  const user = useMemo(() => JSON.parse(localStorage.getItem("user")), []);
  const coachSport = user?.sport;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [broadcastMode, setBroadcastMode] = useState("none");
  const [targetCategories, setTargetCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const { announcements, refresh } = useAnnouncements();
  const searchResults = useDebouncedUserSearch(search, coachSport);

  const availableCategories =
    coachSport && SPORT_META[coachSport]
      ? SPORT_META[coachSport].categories
      : ["U-15", "U-18"];

  const addUser = useCallback((user) => {
    setSelectedUsers(prev => {
      if (prev.find(u => u._id === user._id)) return prev;
      return [...prev, user];
    });
    setSearch("");
  }, []);

  const removeUser = useCallback((id) => {
    setSelectedUsers(prev => prev.filter(u => u._id !== id));
  }, []);

  const toggleCategory = useCallback((cat) => {
    setTargetCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }, []);

  const changeMode = useCallback((mode) => {
    setBroadcastMode(mode);
    setSelectedUsers([]);
    setTargetCategories([]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {

      const payload = {
        title,
        content,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      };

      if (broadcastMode === "none" && selectedUsers.length > 0) {
        payload.targetUsers = selectedUsers.map(u => u._id);
      } else {
        payload.targetRoles = ["student"];
        payload.targetSports = [coachSport];

        if (broadcastMode === "category") {
          payload.targetCategories = targetCategories;
        }
      }

      await api.post("/announcements", payload);

      setTitle("");
      setContent("");
      setExpiryDate("");
      setSelectedUsers([]);
      setBroadcastMode("none");
      setTargetCategories([]);

      refresh();
      successAlert("Announcement sent successfully!");

    } catch (err) {
      errorAlert(err.response?.data?.message || "Error sending announcement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-4">

      <h2 className="fw-bold mb-2">Broadcast Center</h2>

      <input
        className="form-control mb-2"
        placeholder="Headline"
        value={title}
        onChange={(e)=>setTitle(e.target.value)}
      />

      <textarea
        className="form-control mb-3"
        placeholder="Message"
        value={content}
        onChange={(e)=>setContent(e.target.value)}
      />

      <div className="mb-3">
        <button onClick={()=>changeMode("none")}>Specific</button>
        <button onClick={()=>changeMode("all")}>All</button>
        <button onClick={()=>changeMode("category")}>Category</button>
      </div>

      {broadcastMode === "none" && (
        <>
          <input
            className="form-control mb-2"
            placeholder="Search name..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
          />

          {(Array.isArray(searchResults) ? searchResults : []).map(u => (
            <div key={u._id} onClick={()=>addUser(u)}>
              {u.firstName} {u.lastName}
            </div>
          ))}
        </>
      )}

      {broadcastMode === "category" && (
        availableCategories.map(cat => (
          <button key={cat} onClick={()=>toggleCategory(cat)}>
            {cat}
          </button>
        ))
      )}

      <button onClick={handleSubmit}>
        {loading ? "Sending..." : "Send Announcement"}
      </button>

      <hr />

      {announcements.map(a => (
        <div key={a._id}>
          <b>{a.title}</b>
          <p>{a.content}</p>
        </div>
      ))}

    </div>
  );
}