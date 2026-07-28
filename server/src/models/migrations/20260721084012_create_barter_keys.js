exports.up = async function (knex) {

    await knex.schema.createTable("barter_keys", table => {

        table
            .uuid("id")
            .primary()
            .defaultTo(knex.raw("gen_random_uuid()"));

        table
            .uuid("barter_id")
            .references("id")
            .inTable("barter_requests")
            .onDelete("CASCADE")
            .unique();

        table
            .string("algorithm", 30)
            .notNullable()
            .defaultTo("AES-256-GCM");

        table
            .text("encrypted_key_requester")
            .notNullable();

        table
            .text("encrypted_key_receiver")
            .notNullable();

        table
            .uuid("created_by")
            .references("id")
            .inTable("users")
            .onDelete("SET NULL");

        table.timestamp("rotated_at");

        table.timestamp("created_at").defaultTo(knex.fn.now());

        table.timestamp("updated_at").defaultTo(knex.fn.now());

    });

};

exports.down = async function (knex) {

    await knex.schema.dropTableIfExists("barter_keys");

};