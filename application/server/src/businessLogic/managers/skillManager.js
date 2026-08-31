const SkillModel = require("../../models/skillModel");
const AppError = require("../../errorHandlers/AppError");

class SkillManager {

  // ===============================
  // ADD OFFERED SKILL
  // ===============================
  static async addOfferedSkill(userId, { name, category, level, description }) {

    if (!name) {
      throw new AppError("Skill name is required", 400, "Skill name is required");
    }

    const skillModel = new SkillModel(userId);

    // normalize
    name = name.trim().toLowerCase();

    // 1. check if skill exists
    let skill = await skillModel.findSkillByName(name);

    // 2. if not → create
    if (!skill) {
      skill = await skillModel.createSkill({ name, category });
    }

    // 3. prevent duplicate offered skill
    const existing = await skillModel.findOfferedSkill(userId, skill.id);

    if (existing) {
      throw new AppError("Skill already added as offered", 400, "Duplicate offered skill");
    }

    // 4. insert
    return skillModel.addOfferedSkill({
      user_id: userId,
      skill_id: skill.id,
      level,
      description
    });
  }

  // ===============================
  // ADD WANTED SKILL
  // ===============================
  static async addWantedSkill(userId, { name, category, priority }) {

    if (!name) {
      throw new AppError("Skill name is required", 400, "Skill name is required");
    }

    const skillModel = new SkillModel(userId);

    // normalize
    name = name.trim().toLowerCase();

    // 1. check if skill exists
    let skill = await skillModel.findSkillByName(name);

    // 2. if not → create
    if (!skill) {
      skill = await skillModel.createSkill({ name, category });
    }

    // 3. prevent duplicate
    const existing = await skillModel.findWantedSkill(userId, skill.id);

    if (existing) {
      throw new AppError("Skill already added as wanted", 400, "Duplicate wanted skill");
    }

    // 4. insert
    return skillModel.addWantedSkill({
      user_id: userId,
      skill_id: skill.id,
      priority: priority || 1
    });
  }

  // ===============================
  // GET USER OFFERED SKILLS
  // ===============================
  static async getMyOfferedSkills(userId) {
    const skillModel = new SkillModel(userId);
    return skillModel.getUserOfferedSkills(userId);
  }

  // ===============================
  // GET USER WANTED SKILLS
  // ===============================
  static async getMyWantedSkills(userId) {
    const skillModel = new SkillModel(userId);
    return skillModel.getUserWantedSkills(userId);
  }
}

module.exports = SkillManager;