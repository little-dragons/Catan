import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('members')
        .addColumn('id', 'integer', id => id.notNull().primaryKey().autoIncrement())
        .addColumn('name', 'text', name => name.notNull())
        .addColumn('created_at', 'text', ca => ca.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
        .execute()

    await db.schema
        .createTable('games')
        .addColumn('id', 'integer', id => id.notNull().primaryKey().autoIncrement())
        .execute()
}
export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('members').execute()
    await db.schema.dropTable('games').execute()
}