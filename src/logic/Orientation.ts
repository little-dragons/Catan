export enum Orientation {
    LeftDown,
    RightDown,
    Left,
    LeftUp,
    RightUp,
    Right
}

export const allOrientations: readonly Orientation[] = [Orientation.LeftDown, Orientation.Left, Orientation.RightDown, Orientation.LeftUp, Orientation.Right, Orientation.RightUp]


export function neighborTile(pos: [number, number], orientation: Orientation): [number, number] {
    switch (orientation) {
        case Orientation.Left:
            return [pos[0] - 1, pos[1]]
        case Orientation.Right:
            return [pos[0] + 1, pos[1]]
        case Orientation.LeftDown:
            if (pos[1] % 2 == 0)
                return [pos[0] - 1, pos[1] - 1]
            else
                return [pos[0], pos[1] - 1]
        case Orientation.RightDown:
            if (pos[1] % 2 == 0)
                return [pos[0], pos[1] - 1]
            else
                return [pos[0] + 1, pos[1] - 1]
        case Orientation.LeftUp:
            if (pos[1] % 2 == 0)
                return [pos[0] - 1, pos[1] + 1]
            else
                return [pos[0], pos[1] + 1]
        case Orientation.RightUp:
            if (pos[1] % 2 == 0)
                return [pos[0], pos[1] + 1]
            else
                return [pos[0] + 1, pos[1] + 1]
    }
}

export function opposite(orientation: Orientation): Orientation {
    switch (orientation) {
        case Orientation.Left:
            return Orientation.Right
        case Orientation.LeftDown:
            return Orientation.RightUp
        case Orientation.RightDown:
            return Orientation.LeftUp
        case Orientation.Right:
            return Orientation.Left
        case Orientation.RightUp:
            return Orientation.LeftDown
        case Orientation.LeftUp:
            return Orientation.RightDown
    }
}

export function counterclockwise(orientation: Orientation): Orientation {
    switch (orientation) {
        case Orientation.Left:
            return Orientation.LeftDown
        case Orientation.LeftDown:
            return Orientation.RightDown
        case Orientation.RightDown:
            return Orientation.Right
        case Orientation.Right:
            return Orientation.RightUp
        case Orientation.RightUp:
            return Orientation.LeftUp
        case Orientation.LeftUp:
            return Orientation.Left
    }
}

export function clockwise(orientation: Orientation): Orientation {
    switch (orientation) {
        case Orientation.RightUp:
            return Orientation.Right
        case Orientation.Right:
            return Orientation.RightDown
        case Orientation.RightDown:
            return Orientation.LeftDown
        case Orientation.LeftDown:
            return Orientation.Left
        case Orientation.Left:
            return Orientation.LeftUp
        case Orientation.LeftUp:
            return Orientation.RightUp
    }
}