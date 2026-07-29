const express = require("express");
const router = express.Router();
const { toggleFavorite, getFavorites } = require("../controllers/favoriteController");
const { getSellerProfile } = require("../controllers/sellerController");
const { protect } = require("../middleware/authMiddleware");

router.get("/favorites", protect, getFavorites);
router.post("/favorites/:propertyId", protect, toggleFavorite);

// Public route -- no 'protect' middleware, since anyone (even logged out)
// should be able to view a seller's public profile and listings.
router.get("/seller/:id", getSellerProfile);

module.exports = router;