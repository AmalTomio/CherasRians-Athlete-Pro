import api from "../api/axios";

const normalizeArray = (res) => {
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.data)) return res.data.data;
  if (Array.isArray(res.data?.matches)) return res.data.matches;
  if (Array.isArray(res.data?.schedules)) return res.data.schedules;
  return [];
};

export const coachService = {
  getDashboard: async () => {
    const res = await api.get("/coach/dashboard");
    return res.data || {};
  },

  getPendingLeaves: async () => {
    const res = await api.get("/medical/coach/pending");
    return normalizeArray(res);
  },

  getAnnouncements: async () => {
    const res = await api.get("/announcements");
    return normalizeArray(res);
  },

  getSchedules: async () => {
    const res = await api.get("/schedules/coach");
    return normalizeArray(res);
  },

  getMatches: async () => {
    const res = await api.get("/matches/coach");
    return normalizeArray(res);
  },
};