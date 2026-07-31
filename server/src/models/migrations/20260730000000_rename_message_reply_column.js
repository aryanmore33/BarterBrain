exports.up = async function (knex) {
  const hasLegacyColumn = await knex.schema.hasColumn("messages", "reply_to");
  const hasExpectedColumn = await knex.schema.hasColumn("messages", "reply_to_message_id");

  if (hasLegacyColumn && !hasExpectedColumn) {
    await knex.schema.alterTable("messages", (table) => {
      table.renameColumn("reply_to", "reply_to_message_id");
    });
  }
};

exports.down = async function (knex) {
  const hasLegacyColumn = await knex.schema.hasColumn("messages", "reply_to");
  const hasExpectedColumn = await knex.schema.hasColumn("messages", "reply_to_message_id");

  if (hasExpectedColumn && !hasLegacyColumn) {
    await knex.schema.alterTable("messages", (table) => {
      table.renameColumn("reply_to_message_id", "reply_to");
    });
  }
};
