exports.up = async function (knex) {

  await knex.schema.createTable("message_receipts", (table) => {

    table
      .uuid("id")
      .primary()
      .defaultTo(knex.raw("gen_random_uuid()"));

    table
      .uuid("message_id")
      .references("id")
      .inTable("messages")
      .onDelete("CASCADE")
      .index();

    table
      .uuid("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE")
      .index();

    table
      .enu("status", [
        "sent",
        "delivered",
        "read"
      ])
      .defaultTo("sent");

    table.timestamp("delivered_at");

    table.timestamp("read_at");

    table.timestamp("created_at").defaultTo(knex.fn.now());

    table.unique(["message_id", "user_id"]);

  });

};

exports.down = async function (knex) {

  await knex.schema.dropTableIfExists("message_receipts");

};