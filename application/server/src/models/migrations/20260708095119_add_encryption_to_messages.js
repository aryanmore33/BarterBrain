exports.up = async function (knex) {
  const hasCiphertext = await knex.schema.hasColumn('messages', 'ciphertext');
  
  if (!hasCiphertext) {
    await knex.schema.alterTable("messages", (table) => {
      table.text("ciphertext").defaultTo('');
      table.text("iv").defaultTo('');
      table.text("auth_tag").defaultTo('');
      table.enu("message_type", ["text", "image", "video", "audio", "file", "system"]).defaultTo("text");
      table.uuid("reply_to").references("id").inTable("messages").onDelete("SET NULL");
      table.boolean("edited").defaultTo(false);
      table.boolean("deleted_for_everyone").defaultTo(false);
      table.timestamp("edited_at");
    });

    // Enforce NOT NULL after ensuring defaults exist
    await knex.schema.alterTable("messages", (table) => {
      table.text("ciphertext").notNullable().alter();
      table.text("iv").notNullable().alter();
      table.text("auth_tag").notNullable().alter();
    });
  }
};

exports.down = async function (knex) {
  return knex.schema.alterTable("messages", (table) => {
    table.dropColumn("ciphertext");
    table.dropColumn("iv");
    table.dropColumn("auth_tag");
    table.dropColumn("message_type");
    table.dropColumn("reply_to");
    table.dropColumn("edited");
    table.dropColumn("deleted_for_everyone");
    table.dropColumn("edited_at");
  });
};   