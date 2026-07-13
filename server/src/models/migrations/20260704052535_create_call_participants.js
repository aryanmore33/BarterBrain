exports.up = async function (knex) {
  await knex.schema.createTable("call_participants", (table) => {

    table.uuid("id")
      .primary()
      .defaultTo(knex.raw("gen_random_uuid()"));

    table.uuid("call_id")
      .notNullable()
      .references("id")
      .inTable("calls")
      .onDelete("CASCADE");

    table.uuid("user_id")
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table.timestamp("joined_at");

    table.timestamp("left_at");

    table.boolean("camera_enabled")
      .defaultTo(true);

    table.boolean("mic_enabled")
      .defaultTo(true);

    table.boolean("screen_shared")
      .defaultTo(false);

    table.boolean("connection_successful")
      .defaultTo(false);

    table.float("average_latency");

    table.timestamp("created_at")
      .defaultTo(knex.fn.now());

    table.unique(["call_id", "user_id"]);

    table.index(["call_id"]);
    table.index(["user_id"]);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("call_participants");
};