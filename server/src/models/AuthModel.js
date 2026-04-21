const BaseModel = require("../models/libs/BaseModel");

class AuthModel extends BaseModel {
  constructor(userId) {
    super(userId);
    this.table = "users";
  }

  // REGISTER USER
  async createUser({ name, email, password, bio = null, profile_pic = null }) {
    const db = await this.getQueryBuilder();

    const insertData = this.insertStatement({
      name,
      email,
      password,
      bio,
      profile_pic,
      credits: 5, // default from schema (explicit is safer)
    });

    const [user] = await db(this.table)
      .insert(insertData)
      .returning([
        "id",
        "name",
        "email",
        "bio",
        "profile_pic",
        "credits",
        "created_at",
      ]);

    return user;
  }

  // FIND USER BY EMAIL (for login)
  async findByEmail(email) {
    const db = await this.getQueryBuilder();

    return db(this.table)
      .where(this.whereStatement({ email }))
      .first();
  }

  // FIND USER BY ID (useful for auth middleware)
  async findById(id) {
    const db = await this.getQueryBuilder();

    return db(this.table)
      .where(this.whereStatement({ id }))
      .first();
  }
}

module.exports = AuthModel;