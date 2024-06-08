import { Kysely, SqliteDialect } from "kysely";
import { DB } from "./DBTypes";
import Database from "better-sqlite3";

export const db = new Kysely<DB>({
    dialect: new SqliteDialect({
        database: new Database(process.env.DATABASE_URL)
    })
})
