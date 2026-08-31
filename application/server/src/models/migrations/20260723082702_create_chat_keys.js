exports.up = async function (knex) {

    await knex.schema.createTable("chat_keys", (table) => {

        table
            .uuid("id")
            .primary()
            .defaultTo(knex.raw("gen_random_uuid()"));

        table
            .uuid("barter_id")
            .notNullable()
            .unique()
            .references("id")
            .inTable("barter_requests")
            .onDelete("CASCADE");

        /*
         * Random 32-byte salt encoded as Base64.
         * Shared by both participants.
         */
        table
            .text("salt")
            .notNullable();

        /*
         * Future-proofing.
         */
        table
            .integer("version")
            .notNullable()
            .defaultTo(1);

        table
            .string("algorithm")
            .notNullable()
            .defaultTo("HKDF-SHA256");

        table
            .uuid("created_by")
            .notNullable()
            .references("id")
            .inTable("users")
            .onDelete("CASCADE");

        table
            .timestamp("rotated_at")
            .nullable();

        table
            .timestamp("created_at")
            .defaultTo(knex.fn.now());

        table
            .timestamp("updated_at")
            .defaultTo(knex.fn.now());

    });

};

exports.down = async function (knex) {

    await knex.schema.dropTableIfExists("chat_keys");

};