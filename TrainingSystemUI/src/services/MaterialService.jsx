import api from "../api/axios";

export const getMaterials = async () =>
    await api.get("/Material");

export const getMaterial = async (id) =>
    await api.get(`/Material/${id}`);

export const createMaterial = async (data) =>
    await api.post("/Material", data);

export const updateMaterial = async (id, data) =>
    await api.put(`/Material/${id}`, data);

export const deleteMaterial = async (id) =>
    await api.delete(`/Material/${id}`);