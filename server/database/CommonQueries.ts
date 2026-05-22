import { db } from "./Connection";

export async function getUserFromDb(name: string) {
    return await db.selectFrom('members').where('name', '=', name).selectAll().executeTakeFirst()
}

export async function addUserToDb(name: string, passwordHash: string) {
    return await db.insertInto('members').values({
        name: name,
        password_hash: passwordHash,
    }).executeTakeFirst()
}

export async function hasUserInDb(name: string) {
    return await getUserFromDb(name) != undefined
}
