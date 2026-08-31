exports.up = async function (knex) {
  await knex.schema.createTable("reviews", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

    table
      .uuid("barter_id")
      .references("id")
      .inTable("barter_requests")
      .onDelete("CASCADE");

    table
      .uuid("reviewer_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table
      .uuid("reviewee_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table.integer("rating").notNullable();
    table.text("comment");

    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("reviews");
};