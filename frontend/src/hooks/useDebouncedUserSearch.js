import { useState, useEffect, useRef } from "react";
import api from "../api/axios";

export default function useDebouncedUserSearch(search, coachSport, delay = 400) {

  const [results, setResults] = useState(() => []);
  const abortRef = useRef(null);

  useEffect(() => {

    if (!search || search.trim().length < 2) {
      setResults([]);
      return;
    }

    const handler = setTimeout(async () => {
      try {

        if (abortRef.current) abortRef.current.abort();

        const controller = new AbortController();
        abortRef.current = controller;

        const res = await api.get("/users/search", {
          params: { search },
          signal: controller.signal,
        });

        let users = res?.data?.users || [];

        if (coachSport) {
          users = users.filter(u => u.sport === coachSport);
        }

        setResults(users);

      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error("Search error:", err);
        }
      }
    }, delay);

    return () => clearTimeout(handler);

  }, [search, coachSport, delay]);

  return Array.isArray(results) ? results : [];
}