exports.up = async function (knex) {
  await knex.schema.createTable("user_wanted_skills", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));

    table
      .uuid("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table
      .integer("skill_id")
      .references("id")
      .inTable("skills")
      .onDelete("CASCADE");

    table.integer("priority").defaultTo(1);

    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("user_wanted_skills");
};