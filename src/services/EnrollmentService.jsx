import api from "../api/axios";

export const getEnrollments = async () =>
    await api.get("/Enrollment");

export const getEnrollment = async (id) =>
    await api.get(`/Enrollment/${id}`);

export const createEnrollment = async (data) =>
    await api.post("/Enrollment", data);

export const updateEnrollment = async (id, data) =>
    await api.put(`/Enrollment/${id}`, data);

export const deleteEnrollment = async (id) =>
    await api.delete(`/Enrollment/${id}`);