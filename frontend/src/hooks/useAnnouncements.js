import { useState, useEffect, useRef } from "react";
import api from "../api/axios";

export default function useAnnouncements() {

  const [announcements, setAnnouncements] = useState(() => []);
  const mounted = useRef(true);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get("/announcements");
      if (mounted.current) {
        setAnnouncements(res?.data?.announcements || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    mounted.current = true;
    fetchAnnouncements();

    return () => {
      mounted.current = false;
    };
  }, []);

  return {
    announcements: Array.isArray(announcements) ? announcements : [],
    refresh: fetchAnnouncements,
  };
}