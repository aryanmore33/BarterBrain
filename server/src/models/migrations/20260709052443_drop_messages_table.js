exports.up = async function(knex) {
  // Deletes the table
  return knex.schema.dropTable('messages');
};

exports.down = async function(knex) {
  // Recreates the table (rollback logic)
  return knex.schema.createTable('messages', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('message');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    // ... add other original columns here
  });
};   