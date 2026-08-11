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
    pgm.createTable('saved_dishes', {
        id: {
            type: 'uuid',
            default: pgm.func('gen_random_uuid()'),
            primaryKey: true,
        },
        user_id: {
            type: 'uuid',
            notNull: true,
            references: '"users"',
            onDelete: 'CASCADE',
        },
        title: {
            type: 'varchar(255)',
            notNull: true,
        },
        serving_size: {
            type: 'varchar(50)',
            notNull: true,
        },
        recipe: {
            type: 'text[]', // Postgres array of instruction strings
            notNull: true,
        },
        ingredients: {
            type: 'jsonb', // Stores array of ingredient objects [{name, amount}]
            notNull: true,
        },
        macros: {
            type: 'jsonb', // Stores macro object {calories, protein, carbs, fat}
            notNull: true,
        },
        created_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });

    // 2. dish_history table (Daily Macro Logs)
    pgm.createTable('dish_history', {
        id: {
            type: 'uuid',
            default: pgm.func('gen_random_uuid()'),
            primaryKey: true,
        },
        user_id: {
            type: 'uuid',
            notNull: true,
            references: '"users"',
            onDelete: 'CASCADE',
        },
        title: {
            type: 'varchar(255)',
            notNull: true,
        },
        serving_size: {
            type: 'varchar(50)',
            notNull: true,
        },
        recipe: {
            type: 'text[]', 
            notNull: true,
        },
        ingredients: {
            type: 'jsonb',
            notNull: true,
        },
        macros: {
            type: 'jsonb', 
            notNull: true,
        },
        logged_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });

    // Index for fast daily graph queries on dish_history
    pgm.createIndex('dish_history', ['user_id', 'logged_at']);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => { 
    pgm.dropTable('saved_dishes');
    pgm.dropTable('dish_history');
};
