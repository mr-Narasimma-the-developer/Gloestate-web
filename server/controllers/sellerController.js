const User = require("../models/User");
const Property = require("../models/Property");

const getSellerProfile = async (req, res) => {
  try {
    const seller = await User.findById(req.params.id).select("name email phone createdAt role");

    if (!seller || seller.role !== "seller") {
      return res.status(404).json({ message: "Seller not found" });
    }

    const listings = await Property.find({ seller: seller._id, status: "available" }).sort({
      createdAt: -1,
    });

    res.json({ seller, listings });
  } catch (error) {
    res.status(500).json({ message: "Error fetching seller profile", error: error.message });
  }
};

module.exports = { getSellerProfile };