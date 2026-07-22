const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  const listings = await Listing.find();
  res.render("listings/index.ejs", { listings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.createListing = async (req, res, next) => {
  let { path:url, filename } = req.file;
  const newListing = await new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image={url,filename};
  newListing.save();
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
  let originalImageUrl=listing.image.url;
  originalImageUrl.replace("/upload","/upload/w_250");
  res.render("listings/edit.ejs", { listing,originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = req.body.listing;

  let updatedlisting=await Listing.findByIdAndUpdate(id, listing);

  if(typeof req.file!=="undefined"){
    let { path:url, filename } = req.file;
    updatedlisting.image={url,filename};
    await updatedlisting.save();
  }
  req.flash("success", "Listing Updated!");
  res.redirect(`/listing/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  const deletelisting = await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listing");
};
