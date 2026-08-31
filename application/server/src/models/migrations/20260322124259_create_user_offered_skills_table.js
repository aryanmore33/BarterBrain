exports.up = async function (knex) {
  await knex.schema.createTable("user_offered_skills", (table) => {
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

    table.string("level", 20); // beginner/intermediate/expert
    table.text("description");

    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("user_offered_skills");
};