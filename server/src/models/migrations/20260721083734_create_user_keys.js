exports.up = async function (knex) {

    await knex.schema.createTable("user_keys", table => {

        table
            .uuid("id")
            .primary()
            .defaultTo(knex.raw("gen_random_uuid()"));

        table
            .uuid("user_id")
            .references("id")
            .inTable("users")
            .onDelete("CASCADE")
            .unique();

        table
            .string("algorithm", 30)
            .notNullable()
            .defaultTo("X25519");

        table
            .text("public_key")
            .notNullable();

        table.timestamp("created_at").defaultTo(knex.fn.now());

        table.timestamp("updated_at").defaultTo(knex.fn.now());

    });

};

exports.down = async function (knex) {

    await knex.schema.dropTableIfExists("user_keys");

};