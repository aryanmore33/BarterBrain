exports.up = async function (knex) {

  await knex.schema.createTable("call_logs", (table) => {

    table.uuid("id")
      .primary()
      .defaultTo(knex.raw("gen_random_uuid()"));

    table.uuid("call_id")
      .notNullable()
      .references("id")
      .inTable("calls")
      .onDelete("CASCADE");

    table.uuid("user_id")
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");

    table.enu("event_type", [

      "call_started",

      "incoming_call",

      "call_accepted",

      "call_rejected",

      "call_missed",

      "offer_sent",

      "offer_received",

      "answer_sent",

      "answer_received",

      "ice_candidate_sent",

      "ice_candidate_received",

      "peer_connected",

      "peer_disconnected",

      "camera_enabled",

      "camera_disabled",

      "mic_enabled",

      "mic_disabled",

      "screen_share_started",

      "screen_share_stopped",

      "call_ended",

      "call_failed"

    ]);

    table.jsonb("metadata");

    table.timestamp("created_at")
      .defaultTo(knex.fn.now());

    table.index(["call_id"]);

    table.index(["event_type"]);

  });

};

exports.down = async function (knex) {

  await knex.schema.dropTableIfExists("call_logs");

};