import api from "./axios";

export const sendMessage = (data) => api.post("/messages", data);
export const replyMessage = (data) => api.post("/messages/reply", data);
export const getInbox = () => api.get("/messages/inbox");
export const getConversation = (propertyId, otherUserId) =>
  api.get(`/messages/conversation/${propertyId}/${otherUserId}`);