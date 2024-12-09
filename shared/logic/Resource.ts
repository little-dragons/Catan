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