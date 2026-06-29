import api from "../api/axios";

export const getUsers = async () => {
    return await api.get("/users");
};

export const createUser = async (data) => {
    return await api.post("/users", data);
};

export const getUser = async (id) => {
    return await api.get(`/users/${id}`);
};