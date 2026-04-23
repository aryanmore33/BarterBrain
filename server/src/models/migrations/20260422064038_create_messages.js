/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable("messages", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

    table
      .uuid("barter_id")
      .references("id")
      .inTable("barter_requests")
      .onDelete("CASCADE");

    table
      .uuid("sender_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table.text("message");

    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists("messages");
};
