const express = require("express");
const router = express.Router();
const {
  createProperty,
  getProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty,
  markAsSold,
} = require("../controllers/propertyController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Order matters here: "/seller/mine" must be declared BEFORE "/:id",
// otherwise Express treats "seller" as an :id value and routes it wrong.
router.get("/seller/mine", protect, authorize("seller"), getMyProperties);

router.get("/", getProperties); // public browsing, no auth needed
router.get("/:id", getPropertyById); // public detail view

router.post("/", protect, authorize("seller"), upload.array("images", 8), createProperty);
router.put("/:id", protect, authorize("seller"), upload.array("images", 8), updateProperty);
router.delete("/:id", protect, authorize("seller"), deleteProperty);
router.patch("/:id/mark-sold", protect, authorize("seller"), markAsSold);

module.exports = router;
