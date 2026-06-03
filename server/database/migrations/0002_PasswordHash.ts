/** biome-ignore-all lint/suspicious/noExplicitAny: Writing migrations with `any` is the preffered choice for kysely */
import type { Kysely } from 'kysely'

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
