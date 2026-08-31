// New migration file: e.g., 20260723090000_cleanup_tables.js

exports.up = async function (knex) {
  // 1. Drop the child table first (removes the dependency)
  await knex.schema.dropTableIfExists("key_rotation_logs");

  // 2. Drop the parent table (now safe to drop)
  await knex.schema.dropTableIfExists("barter_keys");
};

exports.down = async function (knex) {
  // Re-create parent first
  await knex.schema.createTable("barter_keys", table => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("barter_id").references("id").inTable("barter_requests").onDelete("CASCADE").unique();
    table.string("algorithm", 30).notNullable().defaultTo("AES-256-GCM");
    table.text("encrypted_key_requester").notNullable();
    table.text("encrypted_key_receiver").notNullable();
    table.uuid("created_by").references("id").inTable("users").onDelete("SET NULL");
    table.timestamp("rotated_at");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });

  // Re-create child second
  await knex.schema.createTable("key_rotation_logs", table => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.uuid("barter_key_id").references("id").inTable("barter_keys").onDelete("CASCADE");
    table.string("old_algorithm", 30);
    table.string("new_algorithm", 30);
    table.string("reason", 100);
    table.uuid("rotated_by").references("id").inTable("users").onDelete("SET NULL");
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};   