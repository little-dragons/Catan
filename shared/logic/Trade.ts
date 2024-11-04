import { Board, portsForColor } from "./Board.js";
import { Color } from "./Player.js";
import { allResources, Resource } from "./Resource.js";

export function isValidOffer(offered: readonly Resource[], desired: readonly Resource[]) {
    if (offered.length === 0)
        return false

    if (desired.length === 0)
        return false

    if (allResources.some(x => offered.includes(x) && desired.includes(x)))
        return false

    return true
}


function freeResourcesBy(offered: readonly Resource[], ports: readonly (Resource | 'general')[], resource: Resource) {
    const offeredCount = offered.filter(x => x === resource).length
    const ratio = 
        ports.includes(resource) ? 2 :
        ports.includes('general') ? 3 :
        4

    if (offeredCount % ratio !== 0)
        return false

    return offeredCount / ratio
}

function allFreeResources(offered: readonly Resource[], ports: readonly (Resource | 'general')[]) {
    const allResults = allResources.map(x => freeResourcesBy(offered, ports, x))
    let sum = 0
    for (const res of allResults) {
        if (res === false)
            return false
        sum += res
    }
    return sum
}

export function canTradeWithBank(board: Board, color: Color, offered: readonly Resource[], desired: readonly Resource[]) {
    if (!isValidOffer(offered, desired))
        return false

    const ports = portsForColor(board, color)
    const desiredResourcesAllowed = allFreeResources(offered, ports)
    if (desiredResourcesAllowed === false)
        return false

    return desired.length === desiredResourcesAllowed
}