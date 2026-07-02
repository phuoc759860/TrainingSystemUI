import api from "../api/axios";

export const getCourses = async () =>
    await api.get("/Course");

export const getCourse = async (id) =>
    await api.get(`/Course/${id}`);

export const createCourse = async (data) =>
    await api.post("/Course", data);

export const updateCourse = async (id, data) =>
    await api.put(`/Course/${id}`, data);

export const deleteCourse = async (id) =>
    await api.delete(`/Course/${id}`);