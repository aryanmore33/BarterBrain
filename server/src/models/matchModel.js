const Db = require("../models/libs/Db");
const db = Db.getQueryBuilder();

class MatchModel {

  async findMatches(userId) {

    return db
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
      .groupBy("u.id", "u.name", "u.profile_pic", "s.name", "uos.level", "uos.id");
  }
}

module.exports = MatchModel;