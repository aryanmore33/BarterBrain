const BaseModel = require("../models/libs/BaseModel");

class SkillModel extends BaseModel {
  constructor(userId) {
    super(userId);
    this.skillsTable = "skills";
    this.offeredTable = "user_offered_skills";
    this.wantedTable = "user_wanted_skills";
    this.hasCreatedBy = false;
  }

  // ===============================
  // SKILLS TABLE
  // ===============================

  async findSkillByName(name) {
    const db = await this.getQueryBuilder();

    return db(this.skillsTable)
      .where(this.whereStatement({ name }))
      .first();
  }
  async findOfferedSkillById(id) {
  const db = await this.getQueryBuilder();

  return db(this.offeredTable)
    .where({ id })
    .first();
}

  async createSkill({ name, category = null }) {
    const db = await this.getQueryBuilder();

    const insertData = this.insertStatement({
      name,
      category
    });

    const [skill] = await db(this.skillsTable)
      .insert(insertData)
      .returning("*");

    return skill;
  }

  // ===============================
  // OFFERED SKILLS
  // ===============================

  async addOfferedSkill({ user_id, skill_id, level, description }) {
    const db = await this.getQueryBuilder();

    const insertData = this.insertStatement({
      user_id,
      skill_id,
      level,
      description
    });

    const [data] = await db(this.offeredTable)
      .insert(insertData)
      .returning("*");

    return data;
  }

  async findOfferedSkill(user_id, skill_id) {
    const db = await this.getQueryBuilder();

    return db(this.offeredTable)
      .where(this.whereStatement({ user_id, skill_id }))
      .first();
  }

  async getUserOfferedSkills(user_id) {
    const db = await this.getQueryBuilder();

    return db(this.offeredTable)
      .join(this.skillsTable, `${this.offeredTable}.skill_id`, `${this.skillsTable}.id`)
      .where(`${this.offeredTable}.user_id`, user_id)
      .select(
        `${this.offeredTable}.*`,
        `${this.skillsTable}.name`,
        `${this.skillsTable}.category`
      );
  }

  // ===============================
  // WANTED SKILLS
  // ===============================

  async addWantedSkill({ user_id, skill_id, priority }) {
    const db = await this.getQueryBuilder();

    const insertData = this.insertStatement({
      user_id,
      skill_id,
      priority
    });

    const [data] = await db(this.wantedTable)
      .insert(insertData)
      .returning("*");

    return data;
  }

  async findWantedSkill(user_id, skill_id) {
    const db = await this.getQueryBuilder();

    return db(this.wantedTable)
      .where(this.whereStatement({ user_id, skill_id }))
      .first();
  }

  async getUserWantedSkills(user_id) {
    const db = await this.getQueryBuilder();

    return db(this.wantedTable)
      .join(this.skillsTable, `${this.wantedTable}.skill_id`, `${this.skillsTable}.id`)
      .where(`${this.wantedTable}.user_id`, user_id)
      .select(
        `${this.wantedTable}.*`,
        `${this.skillsTable}.name`,
        `${this.skillsTable}.category`
      );
  }
}

module.exports = SkillModel;