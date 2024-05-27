import { Coordinate } from "./Board"
import { Color } from "./Player"
import { Resource } from "./Resource"

export type GameAction = {
    type: 'roll dice'
    result: [number, number]
    cards: Map<Color, Resource[]>
} | {
    type: 'place building'
    building: 'road' | 'settlement' | 'city'
    coordinate: Coordinate
} | {
    type: 'accepted trade'
    tradePartner: 'bank' | Color
    givenCards: Resource[]
    receivedCards: Resource[]
} | {
    type: 'rejected trade'
    givenCards: Resource[]
    receivedCards: Resource[]
}

export type RequestGameAction = {
    type: 'roll dice'
} | {
    type: 'place building'
    building: 'settlement' | 'city'
    coordinate: Coordinate
} | {
    type: 'place building'
    building: 'road'
    coordinates: [Coordinate, Coordinate]
} | {
    type: 'trade offer'
    tradePartner: 'bank' | 'player'
    givenCards: Resource[]
    receivedCards: Resource[]
} | {
    type: 'place initial buildings'
    settlement: Coordinate
    road: [Coordinate, Coordinate]
} | {
    type: 'finish turn'
}

