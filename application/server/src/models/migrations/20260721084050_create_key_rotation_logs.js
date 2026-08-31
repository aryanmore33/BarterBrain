exports.up = async function (knex) {

    await knex.schema.createTable("key_rotation_logs", table => {

        table
            .uuid("id")
            .primary()
            .defaultTo(knex.raw("gen_random_uuid()"));

        table
            .uuid("barter_key_id")
            .references("id")
            .inTable("barter_keys")
            .onDelete("CASCADE");

        table.string("old_algorithm", 30);

        table.string("new_algorithm", 30);

        table.string("reason", 100);

        table
            .uuid("rotated_by")
            .references("id")
            .inTable("users")
            .onDelete("SET NULL");

        table.timestamp("created_at").defaultTo(knex.fn.now());

    });

};

exports.down = async function (knex) {

    await knex.schema.dropTableIfExists("key_rotation_logs");

};