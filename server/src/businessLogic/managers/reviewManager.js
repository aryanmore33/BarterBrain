const ReviewModel = require("../../models/reviewModel");
const AppError = require("../../errorHandlers/AppError");
const Db = require("../../models/libs/Db");

const db = Db.getQueryBuilder();

class ReviewManager {

  // =========================
  // ADD REVIEW
  // =========================
  static async addReview(userId, { barter_id, rating, comment }) {

    // check barter exists
    const barter = await db("barter_requests")
      .where({ id: barter_id })
      .first();

    if (!barter) {
      throw new AppError("Invalid barter", 400);
    }

    // only completed barter
    if (barter.status !== "accepted") {
      throw new AppError("Review allowed only after acceptance", 400);
    }

    // determine reviewee
    let revieweeId;

    if (barter.requester_id === userId) {
      revieweeId = barter.receiver_id;
    } else if (barter.receiver_id === userId) {
      revieweeId = barter.requester_id;
    } else {
      throw new AppError("Unauthorized", 403);
    }

    const model = new ReviewModel();

    // prevent duplicate
    const existing = await model.findByBarterAndUser(barter_id, userId);
    if (existing) {
      throw new AppError("You already reviewed this barter", 400);
    }

    return model.create({
      barter_id,
      reviewer_id: userId,
      reviewee_id: revieweeId,
      rating,
      comment
    });
  }

  // =========================
  // GET USER PROFILE (RATING + REVIEWS)
  // =========================
  static async getUserProfile(userId) {

    const model = new ReviewModel();

    const [reviews, rating] = await Promise.all([
      model.getUserReviews(userId),
      model.getUserRating(userId)
    ]);

    return {
      rating,
      reviews
    };
  }
}

module.exports = ReviewManager;