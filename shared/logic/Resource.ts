import { BuildingType, ConnectionType } from "./Buildings.js"

export enum Resource {
    Grain,
    Ore,
    Wool,
    Lumber,
    Brick
}

export const allResources: readonly Resource[] = [Resource.Lumber, Resource.Brick, Resource.Wool, Resource.Grain, Resource.Ore]

export type CardList = readonly Resource[]
export function tryRemoveCard(cards: CardList, toRemove: Resource): CardList | undefined {
    const index = cards.indexOf(toRemove)
    if (index < 0)
        return undefined

    return cards.toSpliced(index, 1)
}
export function tryRemoveCards(cards: CardList, toRemove: CardList): CardList | undefined {
    return toRemove.reduce<CardList | undefined>((state, res) => state == undefined ? undefined : tryRemoveCard(state, res), cards)
}
export function addCards(cards: CardList, newCards: CardList): CardList {
    return cards.concat(newCards)
}
export function sameCards(c1: CardList, c2: CardList) {
    const m1 = countResources(c1)
    const m2 = countResources(c2)
    return allResources.every(x => m1.get(x)! == m2.get(x)!)
}

export function countResources(cards: CardList): Map<Resource, number> {
    return new Map<Resource, number>(allResources.map(res => [res, cards.filter(x => res == x).length]))
}

export function tryTransferCard(giver: CardList, receiver: CardList, res: Resource): [CardList, CardList] {
    const tryRemoved = tryRemoveCard(giver, res)
    if (tryRemoved == undefined)
        return [giver, receiver]
    else
        return [tryRemoved, addCards(receiver, [res])]
}

export function tryTransferCards(giver: CardList, receiver: CardList, res: Resource[]): [CardList, CardList] {
    const tryRemoved = tryRemoveCards(giver, res)
    if (tryRemoved == undefined)
        return [giver, receiver]
    else
        return [tryRemoved, addCards(receiver, res)]
}

export const devCardCost = [Resource.Ore, Resource.Wool, Resource.Grain] as const


export const roadCost: readonly Resource[] = [Resource.Lumber, Resource.Brick]
export const settlementCost: readonly Resource[] = [Resource.Lumber, Resource.Brick, Resource.Grain, Resource.Wool]
export const cityCost: readonly Resource[] = [Resource.Grain, Resource.Grain, Resource.Ore, Resource.Ore, Resource.Ore]

export function buildingCost(type: BuildingType) {
    switch (type) {
        case BuildingType.Settlement: return settlementCost
        case BuildingType.City: return cityCost
    }
}
export function connectionCost(type: ConnectionType) {
    switch (type) {
        case ConnectionType.Road: return roadCost
    }
}
