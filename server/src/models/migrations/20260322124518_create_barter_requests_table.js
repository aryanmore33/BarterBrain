exports.up = async function (knex) {
  await knex.schema.createTable("barter_requests", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

    table
      .uuid("requester_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table
      .uuid("receiver_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table
      .uuid("requester_skill_id")
      .references("id")
      .inTable("user_offered_skills")
      .onDelete("CASCADE");

    table
      .uuid("receiver_skill_id")
      .references("id")
      .inTable("user_offered_skills")
      .onDelete("CASCADE");

    table.text("message");

    table
      .enu("status", ["pending", "accepted", "rejected", "completed", "cancelled"])
      .defaultTo("pending");

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("barter_requests");
};