const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview,isLoggedIn,isReviewAutor}=require("../middleware.js");
const reviewController=require("../controllers/review.js");


//Post Route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));

//Delete review route
router.delete("/:reviewId",isLoggedIn,isReviewAutor,wrapAsync(reviewController.destroyReview));


module.exports=router;