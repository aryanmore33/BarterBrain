const BaseModel = require("../models/libs/BaseModel");

class BarterModel extends BaseModel {
  constructor(userId) {
    super(userId);
    this.table = "barter_requests";
    this.usersTable = "users";
    this.skillsTable = "skills";
    this.offeredTable = "user_offered_skills";
  }

  // ===============================
  // CREATE REQUEST
  // ===============================
  async createRequest({
    requester_id,
    receiver_id,
    requester_skill_id,
    receiver_skill_id,
    message
  }) {
    const db = await this.getQueryBuilder();

    const insertData = this.insertStatement({
      requester_id,
      receiver_id,
      requester_skill_id,
      receiver_skill_id,
      message,
      status: "pending"
    });

    const [data] = await db(this.table)
      .insert(insertData)
      .returning("*");

    return data;
  }

  // ===============================
  // GET ALL REQUESTS (incoming + outgoing)
  // ===============================
  async getUserRequests(userId) {
    const db = await this.getQueryBuilder();

    return db(this.table)
      .where(function () {
        this.where("requester_id", userId)
            .orWhere("receiver_id", userId);
      })
      .orderBy("created_at", "desc");
  }

  // ===============================
  // GET INCOMING REQUESTS
  // ===============================
  async getIncomingRequests(userId) {
    const db = await this.getQueryBuilder();

    return db(this.table)
      .where("receiver_id", userId)
      .orderBy("created_at", "desc");
  }

  // ===============================
  // GET OUTGOING REQUESTS
  // ===============================
  async getOutgoingRequests(userId) {
    const db = await this.getQueryBuilder();

    return db(this.table)
      .where("requester_id", userId)
      .orderBy("created_at", "desc");
  }

  // ===============================
  // FIND BY ID
  // ===============================
  async findById(id) {
    const db = await this.getQueryBuilder();

    return db(this.table)
      .where(this.whereStatement({ id }))
      .first();
  }

  // ===============================
  // UPDATE STATUS (accept/reject/cancel)
  // ===============================
  async updateStatus(id, status) {
    const db = await this.getQueryBuilder();

    const [data] = await db(this.table)
      .where({ id })
      .update({
        status,
        updated_at: db.fn.now()
      })
      .returning("*");

    return data;
  }

  // ===============================
  // MARK COMPLETE
  // ===============================
  async markComplete(id) {
    const db = await this.getQueryBuilder();

    const [data] = await db(this.table)
      .where({ id })
      .update({
        status: "completed",
        updated_at: db.fn.now()
      })
      .returning("*");

    return data;
  }
}

module.exports = BarterModel;