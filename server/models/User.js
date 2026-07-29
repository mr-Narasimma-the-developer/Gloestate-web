const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// The Schema defines the SHAPE of a User document in MongoDB.
// Mongoose uses this to validate data before it ever reaches the database.
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // MongoDB will reject duplicate emails at the DB level
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // Never return password field in queries by default
    },
    role: {
      type: String,
      enum: ["buyer", "seller"], // Only these two values are allowed
      required: true,
    },
phone: {
      type: String,
      trim: true,
    },
    profilePicture: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    // Stores which properties this buyer has saved/shortlisted.
    // We only store references (ObjectIds), never copy the property data itself --
    // that way if a seller edits their listing, the favorite always reflects
    // the latest version when we .populate() it.
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
      },
    ],

  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// MONGOOSE MIDDLEWARE (a "pre-save hook").
// This function runs automatically right BEFORE a User document is saved.
// We use it to hash the password so we never store plain text passwords.
userSchema.pre("save", async function (next) {
  // 'this' refers to the user document being saved.
  // If password wasn't changed (e.g. user is just updating their phone number),
  // skip re-hashing it.
  if (!this.isModified("password")) {
    return next();
  }

  // genSalt generates random data to make the hash unique even if two users
  // pick the same password. 10 rounds is a solid balance of security vs speed.
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// INSTANCE METHOD: available on every user document (e.g. user.matchPassword(...)).
// Compares the plain text password from a login form against the stored hash.
// bcrypt.compare re-hashes the plain text with the same salt and checks if it matches.
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
