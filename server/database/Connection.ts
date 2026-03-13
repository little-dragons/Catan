import { Kysely } from "kysely";
import { DB } from "./DBTypes";
import { Database } from 'bun:sqlite'
import { BunSqliteDialect } from "kysely-bun-sqlite";

export const db = new Kysely<DB>({
    dialect: new BunSqliteDialect({
        database: new Database(process.env.DATABASE_URL)
    })
})
