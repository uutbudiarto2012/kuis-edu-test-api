exports.up = function(knex) {
    return knex.schema.createTable('users',function(table){
        table.increments('user_id');
        table.string('username',100).notNullable().unique()
        table.string('email',255).notNullable().unique()
        table.string('password',255).notNullable()
        table.string('profile_picture',255)
        table.string('display_name',255)
        table.string('phone',16)
        table.integer('level',1).defaultTo(0)
        table.integer('point_collection').defaultTo(0)
        table.integer('status',1).defaultTo(1)
        table.integer('role_id',1).defaultTo(3)
        table.timestamps(true,true);
    })
};

exports.down = function(knex) {
    return knex.schema.dropTable('users')
};
