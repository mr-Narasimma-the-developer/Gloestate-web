const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getInbox,
  getConversation,
  replyMessage,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

// All message routes require login -- doesn't matter if buyer or seller,
// both need to be authenticated to send/read messages. That's why we only
// use 'protect' here and never 'authorize', unlike the property routes.
router.post("/", protect, sendMessage);
router.post("/reply", protect, replyMessage);
router.get("/inbox", protect, getInbox);
router.get("/conversation/:propertyId/:otherUserId", protect, getConversation);

module.exports = router;