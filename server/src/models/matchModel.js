const Db = require("../models/libs/Db");
const db = Db.getQueryBuilder();

class MatchModel {
  async findMatches(userId) {
    const query = db
      .select(
        "u.id",
        "u.name",
        "u.profile_pic",
        "s.name as skill_name",
        "uos.level",
        "uos.id as receiver_skill_id",
        db.raw("COALESCE(AVG(r.rating), 0) as avg_rating"),
        db.raw("COUNT(r.id) as total_reviews")
      )
      .from("user_wanted_skills as uw")
      .join("skills as s", "uw.skill_id", "s.id")
      .join("user_offered_skills as uos", "uos.skill_id", "s.id")
      .join("users as u", "u.id", "uos.user_id")
      .leftJoin("reviews as r", "r.reviewee_id", "u.id")
      .where("uw.user_id", userId)
      .whereNot("u.id", userId)

      // Exclude users with pending or accepted barter requests
      .whereNotExists(function () {
        this.select(1)
          .from("barter_requests as br")
          .whereIn("br.status", ["pending", "accepted"])
          .andWhere(function () {
            this.where(function () {
              this.where("br.requester_id", userId)
                .whereColumn("br.receiver_id", "u.id");
            }).orWhere(function () {
              this.where("br.receiver_id", userId)
                .whereColumn("br.requester_id", "u.id");
            });
          });
      })

      .groupBy(
        "u.id",
        "u.name",
        "u.profile_pic",
        "s.name",
        "uos.level",
        "uos.id"
      );

    // Debug
    console.log("Current User:", userId);
    console.log("SQL:", query.toSQL().sql);
    console.log("Bindings:", query.toSQL().bindings);

    return query;
  }
}

module.exports = MatchModel;