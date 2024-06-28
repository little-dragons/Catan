import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.deleteFrom('members').execute()
    
    await db.schema
        .alterTable('members')
        .addColumn('password_hash', 'text', id => id.notNull())
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.alterTable('members').dropColumn('password_hash').execute()
}
