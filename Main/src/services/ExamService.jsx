import api from "../api/axios";

export const getExams = async () =>
    await api.get("/Exam");

export const getExam = async (id) =>
    await api.get(`/Exam/${id}`);

export const createExam = async (data) =>
    await api.post("/Exam", data);

export const updateExam = async (id, data) =>
    await api.put(`/Exam/${id}`, data);

export const deleteExam = async (id) =>
    await api.delete(`/Exam/${id}`);

export const submitExam = async (examId, answers) =>
    await api.post(`/Exam/${examId}/submit`, { answers });