const Db = require("./libs/Db");
const db = Db.getQueryBuilder();

class ReviewModel {

  // =========================
  // CREATE REVIEW
  // =========================
  async create(data) {
    const [review] = await db("reviews")
      .insert(data)
      .returning("*");

    return review;
  }

  // =========================
  // CHECK IF ALREADY REVIEWED
  // =========================
  async findByBarterAndUser(barterId, reviewerId) {
    return db("reviews")
      .where({
        barter_id: barterId,
        reviewer_id: reviewerId
      })
      .first();
  }

  // =========================
  // GET USER REVIEWS
  // =========================
  async getUserReviews(userId) {
    return db("reviews as r")
      .join("users as u", "u.id", "r.reviewer_id")
      .where("r.reviewee_id", userId)
      .select(
        "r.id",
        "r.rating",
        "r.comment",
        "r.created_at",
        "u.name as reviewer_name"
      )
      .orderBy("r.created_at", "desc");
  }

  // =========================
  // GET AVG RATING
  // =========================
  async getUserRating(userId) {
    const result = await db("reviews")
      .where("reviewee_id", userId)
      .avg("rating as avg_rating")
      .count("id as total_reviews")
      .first();

    return {
      avg_rating: parseFloat(result.avg_rating || 0).toFixed(1),
      total_reviews: parseInt(result.total_reviews || 0)
    };
  }
}

module.exports = ReviewModel;