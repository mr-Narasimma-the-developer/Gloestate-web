import api from "./axios";

export const getFavorites = () => api.get("/users/favorites");
export const toggleFavorite = (propertyId) => api.post(`/users/favorites/${propertyId}`);
export const getSellerProfile = (id) => api.get(`/users/seller/${id}`);