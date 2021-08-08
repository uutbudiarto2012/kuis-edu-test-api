exports.up = function(knex) {
  return knex.schema.createTable('players',function(table){
      table.increments('id').notNullable();
      table.string('quiz_code',100).notNullable();
      table.string('email',255).notNullable();
      table.string('name',255).notNullable();
      table.datetime('time_submit');
      table.integer('score');
      table.timestamps(true,true)
  })
};
exports.down = function(knex) {
  return knex.schema.dropTable('players')
};