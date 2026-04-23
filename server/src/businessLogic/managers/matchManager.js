const MatchModel = require("../../models/matchModel");

class MatchManager {

  static async getMatches(userId) {
    const model = new MatchModel();
    return model.findMatches(userId);
  }
}

module.exports = MatchManager;