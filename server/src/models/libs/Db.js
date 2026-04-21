const knexFileObject = require("../../../knexfile");
const { types } = require("pg");

// Prevent DATE timezone issues
types.setTypeParser(1082, (str) => str);

class Db {
  constructor() {
    this.queryBuilder = this._initQueryBuilder();
  }

  _initQueryBuilder() {
    // Use NODE_ENV (development by default)
    const env = process.env.NODE_ENV || "development";

    const config = knexFileObject[env];

    if (!config) {
      throw new Error(`Invalid DB environment: ${env}`);
    }

    console.log("✅ Using DB environment:", env);

    return require("knex")(config);
  }

  getQueryBuilder() {
    return this.queryBuilder;
  }

  getTransactionProvider() {
    return this.queryBuilder.transactionProvider();
  }
}

module.exports = new Db();