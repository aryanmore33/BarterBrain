exports.up = async function (knex) {

  await knex.schema.createTable("user_presence", (table) => {

    table
      .uuid("user_id")
      .primary()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table.boolean("online").defaultTo(false);

    table.boolean("typing").defaultTo(false);

    table.uuid("typing_in_barter");

    table.timestamp("last_seen");

    table.timestamp("updated_at").defaultTo(knex.fn.now());

  });

};

exports.down = async function (knex) {

  await knex.schema.dropTableIfExists("user_presence");

};