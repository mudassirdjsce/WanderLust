const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const initData = require("./data.js");

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(dbUrl);
  console.log("Connected to DB successfully");
}

const initDB = async () => {
  await main();

  // Find an existing real user to be the owner (e.g., 'demo')
  let ownerUser = await User.findOne({ username: "demo" });
  if (!ownerUser) {
    ownerUser = await User.findOne();
  }

  if (!ownerUser) {
    console.error("No user found in DB! Please sign up or create a user first.");
    await mongoose.disconnect();
    return;
  }

  console.log(`Setting owner to user: ${ownerUser.username} (${ownerUser._id})`);

  await Listing.deleteMany({});
  const listingsToInsert = initData.data.map((obj) => ({
    ...obj,
    owner: ownerUser._id,
  }));

  await Listing.insertMany(listingsToInsert);
  console.log(`Successfully initialized ${listingsToInsert.length} listings in database!`);
  await mongoose.disconnect();
};

initDB().catch((err) => {
  console.error("Error initializing DB:", err);
});

