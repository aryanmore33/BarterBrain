exports.up = async function (knex) {
  await knex.schema.createTable("calls", (table) => {
    table.uuid("id")
      .primary()
      .defaultTo(knex.raw("gen_random_uuid()"));

    // Every call belongs to one barter request
    table.uuid("barter_request_id")
      .notNullable()
      .references("id")
      .inTable("barter_requests")
      .onDelete("CASCADE");

    // Who initiated the call
    table.uuid("initiator_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table.enu("status", [
      "ringing",
      "accepted",
      "rejected",
      "missed",
      "ended",
      "failed",
      "cancelled"
    ]).defaultTo("ringing");

    table.timestamp("started_at");

    table.timestamp("ended_at");

    // Duration in seconds
    table.integer("duration").defaultTo(0);

    table.timestamp("created_at").defaultTo(knex.fn.now());

    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.index(["barter_request_id"]);
    table.index(["initiator_id"]);
    table.index(["status"]);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("calls");
};