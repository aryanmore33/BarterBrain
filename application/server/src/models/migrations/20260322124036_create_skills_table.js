exports.up = async function (knex) {
  await knex.schema.createTable("skills", (table) => {
    table.increments("id").primary();

    table.string("name", 100).notNullable().unique();
    table.string("category", 100);

    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("skills");
};