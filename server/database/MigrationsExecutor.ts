import * as path from 'path'
import { promises as fs } from 'fs'
import { Database as DbTypes } from './types/Database'
import {
  Kysely,
  Migrator,
  FileMigrationProvider,
  SqliteDialect,
} from 'kysely'
import Database from 'better-sqlite3'

export async function migrateDbToLatest() {
  const db = new Kysely<DbTypes>({
    dialect: new SqliteDialect({
        database: new Database(process.env.DATABASE_URL)
    }),
  })

  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      // This needs to be an absolute path.
      migrationFolder: path.join(__dirname, 'migrations/'),
    }),
  })

  const { error, results } = await migrator.migrateToLatest()

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`migration "${it.migrationName}" was executed successfully`)
    } else if (it.status === 'Error') {
      console.error(`failed to execute migration "${it.migrationName}"`)
    }
  })
  
  if (results?.length ?? 0 > 0)
    console.log('No Migrations were executed.')

  if (error) {
    console.error('failed to migrate')
    console.error(error)
    process.exit(1)
  }

  await db.destroy()
}

migrateDbToLatest()