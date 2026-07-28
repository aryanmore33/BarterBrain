exports.up = async function (knex) {
  await knex.schema.dropTableIfExists("key_rotation_logs"); // Drop child first
  await knex.schema.dropTableIfExists("barter_keys");       // Then drop parent
};

exports.down = async function (knex) {
  // Recreate parent
  await knex.schema.createTable("barter_keys", table => {
     // ... (your barter_keys schema)
  });
  // Recreate child
  await knex.schema.createTable("key_rotation_logs", table => {
     // ... (your key_rotation_logs schema)
  });
};   