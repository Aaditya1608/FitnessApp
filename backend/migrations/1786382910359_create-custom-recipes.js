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
    pgm.createTable('custom-dishes',{
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
        prep_time: {
            type:'integer',
            notNull: true,
            default: 10
        },
        created_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable('custom-dishes');
};
