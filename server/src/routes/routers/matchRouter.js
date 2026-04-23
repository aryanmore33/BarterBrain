const express = require("express");
const router = express.Router();

const MatchManager = require("../../businessLogic/managers/matchManager");
const { appWrapper } = require("../routeWrapper");

router.get(
  "/",
  appWrapper(async (req) => {

    const userId = req.user.id;

    const matches = await MatchManager.getMatches(userId);

    return {
      success: true,
      data: matches
    };
  })
);

module.exports = router;