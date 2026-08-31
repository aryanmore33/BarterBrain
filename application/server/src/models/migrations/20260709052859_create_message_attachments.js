exports.up = async function (knex) {

  await knex.schema.createTable("message_attachments", (table) => {

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

    table.text("file_url").notNullable();

    table.text("thumbnail_url");

    table.string("file_name");

    table.string("mime_type");

    table.bigInteger("file_size");

    table.integer("width");

    table.integer("height");

    table.integer("duration");

    table.timestamp("created_at").defaultTo(knex.fn.now());

  });

};

exports.down = async function (knex) {

  await knex.schema.dropTableIfExists("message_attachments");

};