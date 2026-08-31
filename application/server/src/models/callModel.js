const BaseModel = require("./libs/BaseModel");

class CallModel extends BaseModel {
  constructor(userId) {
    super(userId);

    this.callsTable = "calls";
    this.participantsTable = "call_participants";
    this.logsTable = "call_logs";
    this.barterTable = "barter_requests";
    this.usersTable = "users";
  }

  // =====================================================
  // CREATE CALL
  // =====================================================

  async createCall({
    barter_request_id,
    initiator_id,
    status = "ringing"
  }) {
    const db = await this.getQueryBuilder();

    const insertData = this.insertStatement({
      barter_request_id,
      initiator_id,
      status
    });

    const [call] = await db(this.callsTable)
      .insert(insertData)
      .returning("*");

    return call;
  }

  // =====================================================
  // FIND CALL
  // =====================================================

  async findCallById(callId) {
    const db = await this.getQueryBuilder();

    return db(this.callsTable)
      .where(this.whereStatement({ id: callId }))
      .first();
  }

  // =====================================================
  // FIND ACTIVE CALL OF BARTER
  // =====================================================

  async findActiveCallByBarter(barterRequestId) {
    const db = await this.getQueryBuilder();

    return db(this.callsTable)
      .where({
        barter_request_id: barterRequestId
      })
      .whereIn("status", [
        "ringing",
        "accepted"
      ])
      .orderBy("created_at", "desc")
      .first();
  }
  async findActiveCallByUser(userId) {

    const db = await this.getQueryBuilder();

    return db(this.callsTable)
      .join(
        this.participantsTable,
        `${this.callsTable}.id`,
        "call_participants.call_id"
      )
      .where("call_participants.user_id", userId)
      .whereIn(`${this.callsTable}.status`, [
        "ringing",
        "accepted"
      ])
      .select(`${this.callsTable}.*`)
      .first();

  }
  async getCallWithParticipants(callId) {

    const db = await this.getQueryBuilder();

    return db(this.callsTable)
      .leftJoin(
        this.participantsTable,
        `${this.callsTable}.id`,
        "call_participants.call_id"
      )
      .where(`${this.callsTable}.id`, callId)
      .select(
        `${this.callsTable}.*`,
        "call_participants.user_id"
      );


  }
  async getReceiver(callId, senderId) {

    const participants =
      await this.getParticipants(callId);

    return participants.find(
      p => p.user_id !== senderId
    );
  }

  async isParticipant(callId, userId) {

    const db = await this.getQueryBuilder();

    const participant =
      await db(this.participantsTable)
        .where({
          call_id: callId,
          user_id: userId
        })
        .first();

    return !!participant;

  }

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  async updateCallStatus(callId, status) {
    const db = await this.getQueryBuilder();

    const [call] = await db(this.callsTable)
      .where({ id: callId })
      .update(await this.updateStatement({
        status,
        updated_at: db.fn.now()
      }))
      .returning("*");

    return call;
  }

  // =====================================================
  // START CALL
  // =====================================================

  async startCall(callId) {
    const db = await this.getQueryBuilder();

    const [call] = await db(this.callsTable)
      .where({ id: callId })
      .update(await this.updateStatement({
        status: "accepted",
        started_at: db.fn.now(),
        updated_at: db.fn.now()
      }))
      .returning("*");

    return call;
  }

  // =====================================================
  // END CALL
  // =====================================================

  async endCall(callId) {
    const db = await this.getQueryBuilder();

    const call = await this.findCallById(callId);

    if (!call) return null;

    let duration = 0;

    if (call.started_at) {
      duration = Math.floor(
        (new Date() - new Date(call.started_at)) / 1000
      );
    }

    const [updated] = await db(this.callsTable)
      .where({ id: callId })
      .update(await this.updateStatement({
        status: "ended",
        ended_at: db.fn.now(),
        duration,
        updated_at: db.fn.now()
      }))
      .returning("*");

    return updated;
  }
  async removeAllParticipants(callId) {
    const db = await this.getQueryBuilder();

    return db(this.participantsTable)
      .where({
        call_id: callId
      })
      .update(await this.updateStatement({
        left_at: db.fn.now()
      }));
  }

  // =====================================================
  // CREATE PARTICIPANT
  // =====================================================

  async addParticipant({
    call_id,
    user_id
  }) {
    const db = await this.getQueryBuilder();

    const insertData = this.insertStatement({
      call_id,
      user_id,
      joined_at: db.fn.now()
    });

    const [participant] = await db(this.participantsTable)
      .insert(insertData)
      .onConflict(["call_id", "user_id"])
      .ignore()
      .returning("*");

    return participant;
  }

  // =====================================================
  // GET PARTICIPANTS
  // =====================================================

  async getParticipants(callId) {
    const db = await this.getQueryBuilder();

    return db(this.participantsTable)
      .join(
        this.usersTable,
        `${this.usersTable}.id`,
        `${this.participantsTable}.user_id`
      )
      .where(`${this.participantsTable}.call_id`, callId)
      .select(
        `${this.participantsTable}.*`,
        `${this.usersTable}.name`,
        `${this.usersTable}.profile_pic`
      );
  }

  // =====================================================
  // UPDATE PARTICIPANT
  // =====================================================

  async updateParticipant(userId, callId, payload) {
    const db = await this.getQueryBuilder();

    const [participant] = await db(this.participantsTable)
      .where({
        user_id: userId,
        call_id: callId
      })
      .update(await this.updateStatement({
        ...payload
      }))
      .returning("*");

    return participant;
  }

  // =====================================================
  // REMOVE PARTICIPANT
  // =====================================================

  async removeParticipant(callId, userId) {
    const db = await this.getQueryBuilder();

    const [participant] = await db(this.participantsTable)
      .where({
        call_id: callId,
        user_id: userId
      })
      .update(await this.updateStatement({
        left_at: db.fn.now()
      }))
      .returning("*");

    return participant;
  }

  // =====================================================
  // GET CALL USING BARTER
  // =====================================================

  async getCallByBarter(barterRequestId) {
    const db = await this.getQueryBuilder();

    return db(this.callsTable)
      .where({
        barter_request_id: barterRequestId
      })
      .orderBy("created_at", "desc")
      .first();
  }

  // =====================================================
  // CREATE LOG
  // =====================================================

  async createLog({
    call_id,
    user_id,
    event_type,
    metadata = {}
  }) {
    const db = await this.getQueryBuilder();

    const insertData = this.insertStatement({
      call_id,
      user_id,
      event_type,
      metadata
    });

    const [log] = await db(this.logsTable)
      .insert(insertData)
      .returning("*");

    return log;
  }

  // =====================================================
  // GET LOGS
  // =====================================================

  async getLogs(callId) {
    const db = await this.getQueryBuilder();

    return db(this.logsTable)
      .where({
        call_id: callId
      })
      .orderBy("created_at", "asc");
  }

  // =====================================================
  // CHECK USER BELONGS TO BARTER
  // =====================================================

  async validateBarterAccess(userId, barterRequestId) {
    const db = await this.getQueryBuilder();

    const barter = await db(this.barterTable)
      .where({
        id: barterRequestId
      })
      .first();

    if (!barter) return false;

    if (barter.status !== "accepted")
      return false;

    return (
      barter.requester_id === userId ||
      barter.receiver_id === userId
    );
  }

  // =====================================================
  // GET OTHER USER
  // =====================================================

  async getOtherParticipant(userId, barterRequestId) {
    const db = await this.getQueryBuilder();

    const barter = await db(this.barterTable)
      .where({
        id: barterRequestId
      })
      .first();

    if (!barter) return null;

    return barter.requester_id === userId
      ? barter.receiver_id
      : barter.requester_id;
  }
}

module.exports = CallModel;