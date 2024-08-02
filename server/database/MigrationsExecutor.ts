import * as path from 'path'
import { promises as fs } from 'fs'
import {
    Migrator,
    FileMigrationProvider,
} from 'kysely'
import { db } from './Connection.js'
import { isProduction } from '../socketEvents/Common.js'

export async function migrateDbToLatest() {
    const migrator = new Migrator({
        db,
        provider: new FileMigrationProvider({
            fs,
            path,
            // This needs to be an absolute path.
            migrationFolder: path.join(__dirname, 'migrations/'),
        }),
    })

    if (process.argv.includes('-remigrate')) {
        if (isProduction) {
            console.warn('\x1b[31m\x1b[40m%s\x1b[0m', 
                '\nYOU ARE ABOUT TO MIGRATE THE PRODUCTION DATABASE DOWN\n' +
                'THIS POTENTIALLY WIPES ENITRE TABLES\n' +
                'SLEEPING FOR 15 SECONDS...\n\n' +
                'IF UNINTENTIONAL OR UNSURE, ABORT WITH CTRL+C\n' +
                'IF YOU ARE SURE AND THIS IS INTENTIONAL, CHECK THAT THE MIGRATION TO REDO IS ALSO PRESENT ON THE SERVER\n' +
                'E.G. MAKE SURE YOU HAVE RUN GIT PULL\n')

            await new Promise(resolve => setTimeout(resolve, 15000))
        }

        const down = await migrator.migrateDown()
        console.log(`reverting migration ${down.results?.[0].migrationName} with ${down.results?.[0].status}`)
    }

    const { error, results } = await migrator.migrateToLatest()

    results?.forEach((it) => {
        if (it.status === 'Success') {
            console.log(`migration "${it.migrationName}" was executed successfully`)
        } else if (it.status === 'Error') {
            console.error(`failed to execute migration "${it.migrationName}"`)
        }
    })

    if ((results?.length ?? 0) == 0)
        console.log('no migrations were executed.')

    if (error) {
        console.error('failed to migrate')
        console.error(error)
        process.exit(1)
    }

    await db.destroy()
}

migrateDbToLatest()