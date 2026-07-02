import api from "../api/axios";

export const getQuestions = async () =>
    await api.get("/QuestionBank");

export const getQuestion = async (id) =>
    await api.get(`/QuestionBank/${id}`);

export const createQuestion = async (data) =>
    await api.post("/QuestionBank", data);

export const updateQuestion = async (id, data) =>
    await api.put(`/QuestionBank/${id}`, data);

export const deleteQuestion = async (id) =>
    await api.delete(`/QuestionBank/${id}`);