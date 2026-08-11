/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
    pgm.createTable('user_details', {
        id: {
            type: 'uuid',
            default: pgm.func('gen_random_uuid()'),
            primaryKey: true
        },
        user_id: {
            type: 'uuid',
            notNull: true,
            unique: true,
            references: 'users',
            onDelete: 'CASCADE'
        },
        weight: {
            type: 'numeric(5,2)',
            notNull: true
        },
        height: {
            type: 'numeric(5,2)',
            notNull: true
        },
        age: {
            type: 'integer',
            notNull: true
        },
        sex: {
            type: 'varchar(10)',
            notNull: true
        },
        lifestyle: {
            type: 'varchar(30)',
            notNull: true,
        },
        goal: {
            type: 'varchar(20)',
            notNull: true,
        },
        target_calories: {
            type: 'integer',
            notNull: true,
        },
        updated_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });
    pgm.addConstraint('user_details','check_sex',{
        check: "sex in ('female','male','other')",
    });

    pgm.addConstraint('user_details','check_goal',{
        check: "goal IN ('weight_loss','weight_gain')",
    });

    pgm.addConstraint('user_details','check_lifestyle',{
        check: "lifestyle in ('sedentary','lightly_active', 'moderately_active', 'highly_active', 'extra_active')",
    })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => { 
    pgm.dropTable('user_details');
};
