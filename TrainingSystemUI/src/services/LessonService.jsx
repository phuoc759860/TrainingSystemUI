import api from "../api/axios";

export const getLessons = async () =>
    await api.get("/Lesson");

export const getLesson = async (id) =>
    await api.get(`/Lesson/${id}`);

export const createLesson = async (data) =>
    await api.post("/Lesson", data);

export const updateLesson = async (id, data) =>
    await api.put(`/Lesson/${id}`, data);

export const deleteLesson = async (id) =>
    await api.delete(`/Lesson/${id}`);