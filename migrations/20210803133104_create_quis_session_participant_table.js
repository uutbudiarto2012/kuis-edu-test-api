exports.up = function(knex) {
    return knex.schema.createTable('quiz_session_participant',function(table){
        table.increments('id').notNullable();
        table.integer('quiz_session_id').notNullable();
        table.integer('user_id').notNullable();
        table.string('participant_code',100).notNullable();
        table.string('participant_name');
        table.integer('point_result');
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('quiz_session_participant')
};