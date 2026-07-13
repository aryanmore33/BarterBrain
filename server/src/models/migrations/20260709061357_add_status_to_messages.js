/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // Check if column already exists to prevent errors
  const hasStatus = await knex.schema.hasColumn('messages', 'status');

  if (!hasStatus) {
    await knex.schema.alterTable('messages', (table) => {
      table
        .enu('status', ['sending', 'sent', 'failed'])
        .defaultTo('sent');
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  // Rollback: drop the column
  const hasStatus = await knex.schema.hasColumn('messages', 'status');
  
  if (hasStatus) {
    await knex.schema.alterTable('messages', (table) => {
      table.dropColumn('status');
    });
  }
};   