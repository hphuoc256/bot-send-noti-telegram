
exports.up = function(knex) {
    return knex.schema.createTable('bot_noti', function (table) {
        table.increments();
        table.integer('user_id');
        table.string('type');
        table.string('value');
        table.timestamp('created_at').defaultTo(knex.fn.now())
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('bot_noti');
};
