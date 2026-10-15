const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  const { q, category, minPrice, maxPrice, sort } = req.query;
  const filter = {};

  if (category && category !== "Trending") {
    filter.category = category;
  }

  if (q && q.trim() !== "") {
    const regex = new RegExp(q.trim(), "i");
    filter.$or = [
      { title: regex },
      { location: regex },
      { country: regex },
      { description: regex },
    ];
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice && !isNaN(minPrice)) filter.price.$gte = Number(minPrice);
    if (maxPrice && !isNaN(maxPrice)) filter.price.$lte = Number(maxPrice);
  }

  let sortOption = { _id: -1 };
  if (sort === "price_asc") sortOption = { price: 1 };
  if (sort === "price_desc") sortOption = { price: -1 };
  if (sort === "newest") sortOption = { _id: -1 };

  const listings = await Listing.find(filter).sort(sortOption);

  res.render("listings/index.ejs", {
    listings,
    activeCategory: category || "Trending",
    searchQuery: q || "",
    minPrice: minPrice || "",
    maxPrice: maxPrice || "",
    activeSort: sort || "",
  });
};

module.exports.getSuggestions = async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return res.json([]);
  }

  const regex = new RegExp(q.trim(), "i");
  const listings = await Listing.find({
    $or: [{ title: regex }, { location: regex }, { country: regex }],
  })
    .select("title location country price image category")
    .limit(10);

  const suggestions = [];
  const seen = new Set();

  for (const item of listings) {
    const locKey = `loc:${item.location}, ${item.country}`.toLowerCase();
    if (regex.test(item.location) || regex.test(item.country)) {
      if (!seen.has(locKey)) {
        seen.add(locKey);
        suggestions.push({
          type: "location",
          text: `${item.location}, ${item.country}`,
          query: item.location,
          subtext: "Destination",
        });
      }
    }

    const titleKey = `title:${item.title}`.toLowerCase();
    if (regex.test(item.title)) {
      if (!seen.has(titleKey)) {
        seen.add(titleKey);
        suggestions.push({
          type: "listing",
          text: item.title,
          query: item.title,
          subtext: `${item.location}, ${item.country} · ₹${item.price.toLocaleString("en-IN")}/night`,
          id: item._id,
        });
      }
    }
  }

  res.json(suggestions.slice(0, 6));
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.createListing = async (req, res, next) => {
  let { path: url, filename } = req.file;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listing");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listing");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.editForm = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listing");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = req.body.listing;

  let updatedlisting = await Listing.findByIdAndUpdate(id, listing);

  if (typeof req.file !== "undefined") {
    let { path: url, filename } = req.file;
    updatedlisting.image = { url, filename };
    await updatedlisting.save();
  }
  req.flash("success", "Listing Updated!");
  res.redirect(`/listing/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listing");
};
