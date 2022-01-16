const router = require("express").Router({ mergeParams: true })
const advancedResults = require("../middlewares/advancedResults")
const { getReviews, getReview, addReview, updateReview, deleteReview } = require("../controllers/reviews")
const Review = require("../models/Review")
const { protect, authorize } = require("../middlewares/auth")
const populate = {
    path: "bootcamp",
    select: "name description"
}

router.route("/").get(advancedResults(Review, populate), getReviews).post(protect, authorize("user", "admin"), addReview)
router.route("/:id").get(getReview).put(protect, updateReview).delete(protect, deleteReview)

module.exports = router


