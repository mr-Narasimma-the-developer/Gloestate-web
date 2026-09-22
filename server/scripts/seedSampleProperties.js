require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User");
const Property = require("../models/Property");
const sampleProperties = require("../data/sampleProperties");

const demoSeller = {
  name: "Gloestate Demo Realty",
  email: "demo.seller@gloestate.com",
  password: "GloestateDemo123!",
  role: "seller",
  phone: "+91 90000 00000",
};

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  let seller = await User.findOne({ email: demoSeller.email });
  if (!seller) {
    seller = await User.create(demoSeller);
  }

  let created = 0;
  let updated = 0;

  for (const sample of sampleProperties) {
    const result = await Property.updateOne(
      { seller: seller._id, title: sample.title },
      { $set: { ...sample, seller: seller._id, status: "available" } },
      { upsert: true }
    );

    if (result.upsertedCount > 0) created += 1;
    else if (result.modifiedCount > 0) updated += 1;
  }

  console.log(`Sample properties ready: ${sampleProperties.length} (${created} created, ${updated} updated)`);
  console.log(`Demo seller: ${demoSeller.email}`);
  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error(`Sample seed failed: ${error.message}`);
  await mongoose.disconnect();
  process.exitCode = 1;
});