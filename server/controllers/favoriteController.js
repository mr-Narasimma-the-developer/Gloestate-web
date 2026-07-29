const User = require("../models/User");
const Property = require("../models/Property");

const toggleFavorite = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const user = await User.findById(req.user._id);

    const alreadyFavorited = user.favorites.some(
      (favId) => favId.toString() === propertyId
    );

    if (alreadyFavorited) {
      user.favorites = user.favorites.filter((favId) => favId.toString() !== propertyId);
    } else {
      user.favorites.push(propertyId);
    }

    await user.save();

    res.json({ favorites: user.favorites, isFavorited: !alreadyFavorited });
  } catch (error) {
    res.status(500).json({ message: "Error updating favorites", error: error.message });
  }
};

const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "favorites",
      populate: { path: "seller", select: "name email" },
    });

    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: "Error fetching favorites", error: error.message });
  }
};

module.exports = { toggleFavorite, getFavorites };