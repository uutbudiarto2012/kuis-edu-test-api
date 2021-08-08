exports.up = function(knex) {
    return knex.schema.createTable('quiz_question_type',function(table){
        table.increments('id');
        table.string('type',16).notNullable()
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('quiz_question_type')
};
