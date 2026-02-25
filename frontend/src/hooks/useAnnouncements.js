import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { getSocket } from "../socket";

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

    const socket = getSocket();

    if (!socket) return;

    socket.on("announcement:new", ({ announcement }) => {
      setAnnouncements(prev => {
        if (prev.find(a => a._id === announcement._id)) return prev;
        return [announcement, ...prev];
      });
    });

    return () => {
      mounted.current = false;
      socket.off("announcement:new");
    };

  }, []);

  return {
    announcements,
    refresh: fetchAnnouncements,
  };
}