import api from "./axios";

export const getProperties = (params) => api.get("/properties", { params });
export const getPropertyById = (id) => api.get(`/properties/${id}`);
export const getMyProperties = () => api.get("/properties/seller/mine");

export const createProperty = (formData) =>
  api.post("/properties", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateProperty = (id, formData) =>
  api.put(`/properties/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteProperty = (id) => api.delete(`/properties/${id}`);
export const markPropertySold = (id) => api.patch(`/properties/${id}/mark-sold`);