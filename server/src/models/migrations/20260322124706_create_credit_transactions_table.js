exports.up = async function (knex) {
  await knex.schema.createTable("credit_transactions", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

    table
      .uuid("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table.integer("amount").notNullable(); // +1 or -1

    table
      .enu("type", ["earn", "spend", "bonus", "penalty"])
      .notNullable();

    table.text("reason");

    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("credit_transactions");
};