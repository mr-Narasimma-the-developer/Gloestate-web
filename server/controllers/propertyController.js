const Property = require("../models/Property");
const Message = require("../models/Message");
const cloudinary = require("../config/cloudinary");

// Multer/FormData always sends field values as strings, even for numbers --
// and an empty optional number field arrives as "" rather than being omitted.
// Mongoose's Number cast turns "" into 0, which would wrongly show "Floor 0"
// on a listing that never had a floor number entered. This helper strips
// those empty optional fields out entirely so Mongoose's schema default
// (null) applies instead.
const sanitizeOptionalNumbers = (body) => {
  const cleaned = { ...body };
  ["floorNumber", "totalFloors"].forEach((field) => {
    if (cleaned[field] === "" || cleaned[field] === undefined) {
      delete cleaned[field];
    }
  });
  return cleaned;
};

// @route   POST /api/properties
// @access  Private (seller only -- enforced by authorize("seller") in routes)
const createProperty = async (req, res) => {
  try {
    const images = (req.files || []).map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));

    const property = await Property.create({
      ...sanitizeOptionalNumbers(req.body),
      seller: req.user._id,
      images,
    });

    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: "Error creating property", error: error.message });
  }
};

// @route   GET /api/properties
// @access  Public
// Supports query params: ?city=&minPrice=&maxPrice=&propertyType=&bedrooms=&sort=
const getProperties = async (req, res) => {
  try {
    const { city, minPrice, maxPrice, propertyType, bedrooms, sort } = req.query;

    // Build the MongoDB filter object dynamically based on which query params were sent.
    const filter = { status: "available" };
    if (city) filter.city = new RegExp(city, "i"); // case-insensitive partial match
    if (propertyType) filter.propertyType = propertyType;
    if (bedrooms) filter.bedrooms = { $gte: Number(bedrooms) };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Sort options: "price_asc", "price_desc", "newest"
    let sortOption = { createdAt: -1 }; // default: newest first
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };

    const properties = await Property.find(filter)
      .populate("seller", "name email phone profilePicture") // pulls in seller's basic info instead of just their ObjectId
      .sort(sortOption);

    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: "Error fetching properties", error: error.message });
  }
};

// @route   GET /api/properties/:id
// @access  Public
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate("seller", "name email phone");
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: "Error fetching property", error: error.message });
  }
};

// @route   GET /api/properties/seller/mine
// @access  Private (seller)
const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: "Error fetching your properties", error: error.message });
  }
};

// @route   PUT /api/properties/:id
// @access  Private (seller who owns it)
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // OWNERSHIP CHECK: critical. Without this, any logged-in seller could
    // edit ANY property just by knowing its id. Always verify the resource
    // belongs to the requesting user before mutating it.
    if (property.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this property" });
    }

// If new images were uploaded, append them; otherwise keep existing ones.
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({ url: file.path, publicId: file.filename }));
      req.body.images = [...property.images, ...newImages];
    }

    Object.assign(property, sanitizeOptionalNumbers(req.body));
    await property.save();

    res.json(property);
  } catch (error) {
    res.status(500).json({ message: "Error updating property", error: error.message });
  }
};

// @route   DELETE /api/properties/:id
// @access  Private (seller who owns it)
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this property" });
    }

    // Clean up Cloudinary too -- otherwise you accumulate orphaned images
    // in your Cloudinary account forever, eating into your free tier quota.
// Clean up Cloudinary too -- otherwise you accumulate orphaned images
    // in your Cloudinary account forever, eating into your free tier quota.
    for (const image of property.images) {
      await cloudinary.uploader.destroy(image.publicId);
    }

    // Delete every Message tied to this property too. Without this, old
    // inquiries keep pointing at a property id that no longer exists --
    // and when the inbox tries to populate() that property, it gets back
    // null, which crashes anything that assumes property data is always there.
    await Message.deleteMany({ property: property._id });

    await property.deleteOne();
    res.json({ message: "Property deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting property", error: error.message });
  }
};

// @route   PATCH /api/properties/:id/mark-sold
// @access  Private (seller who owns it)
const markAsSold = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (property.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    property.status = "sold";
    await property.save();
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error: error.message });
  }
};

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty,
  markAsSold,
};
