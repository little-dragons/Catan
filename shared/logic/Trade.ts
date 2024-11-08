import { Freeze } from "structurajs";
import { Board, portsForColor } from "./Board.js";
import { Color } from "./Player.js";
import { allResources, CardList, Resource, sameCards, tryRemoveCards } from "./Resource.js";


export type TradeOffer = {
    offeringColor: Color
    offeredCards: CardList
    desiredCards: CardList
}

export enum TradeStatusByColor {
    Accepting, Rejecting, Undecided
}
export type OpenTradeOffer = TradeOffer & {
    otherColors: Freeze<{
        color: Color,
        status: TradeStatusByColor
    }[]>
}
export type FinalizedTrade = TradeOffer & {
    tradePartner: Color
}

export function sameTradeOffer(t1: TradeOffer, t2: TradeOffer) {
    return t1.offeringColor == t2.offeringColor && sameCards(t1.offeredCards, t2.offeredCards) && sameCards(t1.desiredCards, t2.desiredCards)
}
export function isValidOffer(offered: CardList, desired: CardList) {
    if (offered.length === 0)
        return false

    if (desired.length === 0)
        return false

    if (allResources.some(x => offered.includes(x) && desired.includes(x)))
        return false

    return true
}

function freeResourcesBy(offered: CardList, ports: readonly (Resource | 'general')[], resource: Resource) {
    const offeredCount = offered.filter(x => x === resource).length
    const ratio = 
        ports.includes(resource) ? 2 :
        ports.includes('general') ? 3 :
        4

    if (offeredCount % ratio !== 0)
        return false

    return offeredCount / ratio
}

function allFreeResources(offered: CardList, ports: readonly (Resource | 'general')[]) {
    const allResults = allResources.map(x => freeResourcesBy(offered, ports, x))
    let sum = 0
    for (const res of allResults) {
        if (res === false)
            return false
        sum += res
    }
    return sum
}

export function canTradeWithBank(board: Board, color: Color, offered: CardList, desired: CardList) {
    if (!isValidOffer(offered, desired))
        return false

    const ports = portsForColor(board, color)
    const desiredResourcesAllowed = allFreeResources(offered, ports)
    if (desiredResourcesAllowed === false)
        return false

    return desired.length === desiredResourcesAllowed
}
