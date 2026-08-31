const MatchModel = require("../../models/matchModel");

class MatchManager {

  static async getMatches(userId) {
    console.log("Current User:", userId);
    const model = new MatchModel();
    return model.findMatches(userId);
  }
}

module.exports = MatchManager;