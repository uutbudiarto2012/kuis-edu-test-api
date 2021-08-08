exports.up = function(knex) {
    return knex.schema.createTable('quiz_session',function(table){
        table.increments('quiz_id').notNullable();
        table.string('access_code',255).notNullable();
        table.string('title',200);
        table.text('description');
        table.string('media',255);
        table.integer('type_session_id',1);
        table.integer('author');
        table.timestamps(true,true)
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('quiz_session')
};
