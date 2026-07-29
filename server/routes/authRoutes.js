const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getMe, updateProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const avatarUpload = require("../middleware/avatarUploadMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.put("/profile", protect, avatarUpload.single("profilePicture"), updateProfile);

module.exports = router;