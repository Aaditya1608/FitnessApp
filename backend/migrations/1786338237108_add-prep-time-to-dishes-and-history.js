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
    pgm.addColumn('saved_dishes',{
        prep_time:{
            type:'integer',
            notNull: true,
            default: 10
        }
    })
    pgm.addColumn('dish_history',{
        prep_time:{
            type:'integer',
            notNull: true,
            default: 10
        }
    })
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropColumn('dish_history','prep_time');
    pgm.dropColumn('saved_dishes','prep_time');
};
