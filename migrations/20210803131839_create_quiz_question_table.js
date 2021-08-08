exports.up = function(knex) {
    return knex.schema.createTable('quiz_question',function(table){
        table.increments('question_id').notNullable();
        table.integer('quiz_id').notNullable();
        table.string('type',8);
        table.text('description');
        table.text('question');
        table.text('options');
        table.text('answer');
        table.integer('point');
        table.integer('punishment');
        table.timestamps(true,true);
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('quiz_question')
};
