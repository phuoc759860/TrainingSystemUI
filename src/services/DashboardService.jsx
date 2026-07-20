import api from "../api/axios";

export const getDashboard = async () =>
    await api.get("/Dashboard");