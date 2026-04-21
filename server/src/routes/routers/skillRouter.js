const express = require("express");
const router = express.Router();

const SkillManager = require("../../businessLogic/managers/skillManager");
const { appWrapper } = require("../routeWrapper");

// ===============================
// ADD OFFERED SKILL
// ===============================
router.post(
  "/offered",
  appWrapper(async (req) => {
    const userId = req.user.id;

    const data = await SkillManager.addOfferedSkill(userId, req.body);

    return {
      success: true,
      data,
      message: "Offered skill added"
    };
  })
);

// ===============================
// ADD WANTED SKILL
// ===============================
router.post(
  "/wanted",
  appWrapper(async (req) => {
    const userId = req.user.id;

    const data = await SkillManager.addWantedSkill(userId, req.body);

    return {
      success: true,
      data,
      message: "Wanted skill added"
    };
  })
);

// ===============================
// GET MY OFFERED SKILLS
// ===============================
router.get(
  "/offered",
  appWrapper(async (req) => {
    const userId = req.user.id;

    const data = await SkillManager.getMyOfferedSkills(userId);

    return {
      success: true,
      data
    };
  })
);

// ===============================
// GET MY WANTED SKILLS
// ===============================
router.get(
  "/wanted",
  appWrapper(async (req) => {
    const userId = req.user.id;

    const data = await SkillManager.getMyWantedSkills(userId);

    return {
      success: true,
      data
    };
  })
);

module.exports = router;