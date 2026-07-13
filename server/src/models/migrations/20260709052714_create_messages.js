exports.up = async function (knex) {

  await knex.schema.createTable("messages", (table) => {

    table
      .uuid("id")
      .primary()
      .defaultTo(knex.raw("gen_random_uuid()"));

    table
      .uuid("barter_id")
      .references("id")
      .inTable("barter_requests")
      .onDelete("CASCADE")
      .index();

    table
      .uuid("sender_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE")
      .index();

    // End-to-End encrypted payload
    table.text("ciphertext").notNullable();

    table.text("iv").notNullable();

    table.text("auth_tag").notNullable();

    table
      .enu("message_type", [
        "text",
        "image",
        "video",
        "audio",
        "file",
        "system"
      ])
      .defaultTo("text");

    table
      .uuid("reply_to")
      .references("id")
      .inTable("messages")
      .onDelete("SET NULL");

    table.boolean("edited").defaultTo(false);

    table.boolean("deleted_for_everyone").defaultTo(false);

    table.timestamp("edited_at");

    table.timestamp("created_at").defaultTo(knex.fn.now());

    table.timestamp("updated_at").defaultTo(knex.fn.now());

  });

};

exports.down = async function (knex) {

  await knex.schema.dropTableIfExists("messages");

};