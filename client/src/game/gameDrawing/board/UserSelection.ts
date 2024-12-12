import type { Road, Coordinate } from "shared";

export enum UserSelectionType {
    Crossing, Connection, Tile
}

export type UserSelectionDataType<T> = 
    T extends UserSelectionType.Connection ? Road : 
    T extends UserSelectionType.Crossing ? Coordinate :
    T extends UserSelectionType.Tile ? Coordinate : 
    never

export type UserSelectionOptions = {
    noAbort?: true
} | undefined

export type UserSelectionResult<T extends UserSelectionType, options extends UserSelectionOptions> = 
    options extends { noAbort: true } ? UserSelectionDataType<T> :
    UserSelectionDataType<T> | undefined

export type AnyUserSelectionResult = UserSelectionResult<UserSelectionType, UserSelectionOptions>

type InteractionPointsTemplate<T extends UserSelectionType> = {
    type: T,
    positions: UserSelectionDataType<T>[]
}

export type InteractionPoints =
    | InteractionPointsTemplate<UserSelectionType.Connection>
    | InteractionPointsTemplate<UserSelectionType.Tile>
    | InteractionPointsTemplate<UserSelectionType.Crossing>
