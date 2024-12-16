import { Board, Color, FullGameState, minimalGameState, Resource } from "shared";

// This file contains some data for tests to use. For convenience, the board is given as a json string
// which can be viewed in the devtools of this project.

const boardJSONString = `
{
    "board": {
        "columnCount": 7,
        "rowCount": 7,
        "tiles": [
            {
                "type": "resource",
                "resource": 1,
                "number": 11,
                "coord": [
                    3,
                    3
                ]
            },
            {
                "type": "resource",
                "resource": 0,
                "number": 3,
                "coord": [
                    3,
                    2
                ]
            },
            {
                "type": "resource",
                "resource": 0,
                "number": 6,
                "coord": [
                    4,
                    2
                ]
            },
            {
                "type": "resource",
                "resource": 2,
                "number": 5,
                "coord": [
                    4,
                    3
                ]
            },
            {
                "type": "resource",
                "resource": 1,
                "number": 4,
                "coord": [
                    4,
                    4
                ]
            },
            {
                "type": "resource",
                "resource": 3,
                "number": 9,
                "coord": [
                    3,
                    4
                ]
            },
            {
                "type": "resource",
                "resource": 2,
                "number": 10,
                "coord": [
                    2,
                    3
                ]
            },
            {
                "type": "resource",
                "resource": 0,
                "number": 8,
                "coord": [
                    2,
                    2
                ]
            },
            {
                "type": "resource",
                "resource": 3,
                "number": 4,
                "coord": [
                    2,
                    1
                ]
            },
            {
                "type": "resource",
                "resource": 2,
                "number": 11,
                "coord": [
                    3,
                    1
                ]
            },
            {
                "type": "resource",
                "resource": 1,
                "number": 12,
                "coord": [
                    4,
                    1
                ]
            },
            {
                "type": "resource",
                "resource": 3,
                "number": 9,
                "coord": [
                    5,
                    2
                ]
            },
            {
                "type": "resource",
                "resource": 0,
                "number": 10,
                "coord": [
                    5,
                    3
                ]
            },
            {
                "type": "resource",
                "resource": 4,
                "number": 8,
                "coord": [
                    5,
                    4
                ]
            },
            {
                "type": "desert",
                "coord": [
                    4,
                    5
                ]
            },
            {
                "type": "resource",
                "resource": 4,
                "number": 3,
                "coord": [
                    3,
                    5
                ]
            },
            {
                "type": "resource",
                "resource": 4,
                "number": 6,
                "coord": [
                    2,
                    5
                ]
            },
            {
                "type": "resource",
                "resource": 3,
                "number": 2,
                "coord": [
                    2,
                    4
                ]
            },
            {
                "type": "resource",
                "resource": 2,
                "number": 5,
                "coord": [
                    1,
                    3
                ]
            },
            {
                "type": "ocean",
                "coord": [
                    1,
                    2
                ]
            },
            {
                "type": "port",
                "resource": 0,
                "orientation": 1,
                "coord": [
                    1,
                    1
                ]
            },
            {
                "type": "ocean",
                "coord": [
                    2,
                    0
                ]
            },
            {
                "type": "port",
                "resource": "general",
                "orientation": 0,
                "coord": [
                    3,
                    0
                ]
            },
            {
                "type": "ocean",
                "coord": [
                    4,
                    0
                ]
            },
            {
                "type": "port",
                "resource": 4,
                "orientation": 0,
                "coord": [
                    5,
                    0
                ]
            },
            {
                "type": "ocean",
                "coord": [
                    5,
                    1
                ]
            },
            {
                "type": "port",
                "resource": "general",
                "orientation": 0,
                "coord": [
                    6,
                    2
                ]
            },
            {
                "type": "ocean",
                "coord": [
                    6,
                    3
                ]
            },
            {
                "type": "port",
                "resource": 3,
                "orientation": 3,
                "coord": [
                    6,
                    4
                ]
            },
            {
                "type": "ocean",
                "coord": [
                    5,
                    5
                ]
            },
            {
                "type": "port",
                "resource": 2,
                "orientation": 3,
                "coord": [
                    5,
                    6
                ]
            },
            {
                "type": "ocean",
                "coord": [
                    4,
                    6
                ]
            },
            {
                "type": "port",
                "resource": "general",
                "orientation": 3,
                "coord": [
                    3,
                    6
                ]
            },
            {
                "type": "ocean",
                "coord": [
                    2,
                    6
                ]
            },
            {
                "type": "port",
                "resource": "general",
                "orientation": 5,
                "coord": [
                    1,
                    5
                ]
            },
            {
                "type": "ocean",
                "coord": [
                    1,
                    4
                ]
            },
            {
                "type": "port",
                "resource": 1,
                "orientation": 5,
                "coord": [
                    0,
                    3
                ]
            }
        ],
        "roads": [
            {
                "color": 2,
                "coord": [
                    [
                        6,
                        3
                    ],
                    [
                        6,
                        2
                    ]
                ]
            },
            {
                "color": 4,
                "coord": [
                    [
                        9,
                        4
                    ],
                    [
                        9,
                        3
                    ]
                ]
            },
            {
                "color": 3,
                "coord": [
                    [
                        10,
                        3
                    ],
                    [
                        10,
                        2
                    ]
                ]
            },
            {
                "color": 3,
                "coord": [
                    [
                        6,
                        4
                    ],
                    [
                        7,
                        4
                    ]
                ]
            },
            {
                "color": 4,
                "coord": [
                    [
                        9,
                        5
                    ],
                    [
                        8,
                        5
                    ]
                ]
            },
            {
                "color": 2,
                "coord": [
                    [
                        9,
                        2
                    ],
                    [
                        8,
                        2
                    ]
                ]
            }
        ],
        "robber": [
            3,
            4
        ],
        "buildings": [
            {
                "color": 2,
                "coord": [
                    6,
                    3
                ],
                "type": 0
            },
            {
                "color": 4,
                "coord": [
                    9,
                    4
                ],
                "type": 0
            },
            {
                "color": 3,
                "coord": [
                    10,
                    3
                ],
                "type": 0
            },
            {
                "color": 3,
                "coord": [
                    6,
                    4
                ],
                "type": 0
            },
            {
                "color": 4,
                "coord": [
                    9,
                    5
                ],
                "type": 0
            },
            {
                "color": 2,
                "coord": [
                    9,
                    2
                ],
                "type": 0
            }
        ]
    },
    "currentPlayer": 2,
    "players": [
        {
            "color": 2,
            "handCardsCount": 5
        },
        {
            "color": 4,
            "handCardsCount": 2
        },
        {
            "color": 3,
            "handCardsCount": 2
        }
    ],
    "phase": {
        "type": 1,
        "subtype": 2,
        "tradeOffers": []
    },
    "self": {
        "color": 2,
        "handCards": [
            0,
            2,
            1,
            3,
            3
        ]
    }
}
`

export const testBoard = JSON.parse(boardJSONString) as Board

const state: FullGameState = {
    board: {
        columnCount: 7,
        rowCount: 7,
        tiles: [
            {
                type: "resource",
                resource: Resource.Ore,
                number: 11,
                coord: [3, 3]
            },
            {
                type: "resource",
                resource: Resource.Grain,
                number: 3,
                coord: [3, 2]
            },
            {
                type: "resource",
                resource: Resource.Grain,
                number: 6,
                coord: [4, 2]
            },
            {
                type: "resource",
                resource: Resource.Wool,
                number: 5,
                coord: [4, 3]
            },
            {
                type: "resource",
                resource: Resource.Ore,
                number: 4,
                coord: [4, 4]
            },
            {
                type: "resource",
                resource: Resource.Lumber,
                number: 9,
                coord: [3, 4]
            },
            {
                type: "resource",
                resource: Resource.Wool,
                number: 10,
                coord: [2, 3]
            },
            {
                type: "resource",
                resource: Resource.Grain,
                number: 8,
                coord: [2, 2]
            },
            {
                type: "resource",
                resource: Resource.Lumber,
                number: 4,
                coord: [2, 1]
            },
            {
                type: "resource",
                resource: Resource.Wool,
                number: 11,
                coord: [3, 1]
            },
            {
                type: "resource",
                resource: Resource.Ore,
                number: 12,
                coord: [4, 1]
            },
            {
                type: "resource",
                resource: Resource.Lumber,
                number: 9,
                coord: [5, 2]
            },
            {
                type: "resource",
                resource: Resource.Grain,
                number: 10,
                coord: [5, 3]
            },
            {
                type: "resource",
                resource: Resource.Brick,
                number: 8,
                coord: [5, 4]
            },
            {
                type: "desert",
                coord: [4, 5]
            },
            {
                type: "resource",
                resource: Resource.Brick,
                number: 3,
                coord: [3, 5]
            },
            {
                type: "resource",
                resource: Resource.Brick,
                number: 6,
                coord: [2, 5]
            },
            {
                type: "resource",
                resource: Resource.Lumber,
                number: 2,
                coord: [2, 4]
            },
            {
                type: "resource",
                resource: Resource.Wool,
                number: 5,
                coord: [1, 3]
            },
            {
                type: "ocean",
                coord: [1, 2]
            },
            {
                type: "port",
                resource: Resource.Grain,
                orientation: 1,
                coord: [1, 1]
            },
            {
                type: "ocean",
                coord: [2, 0]
            },
            {
                type: "port",
                resource: "general",
                orientation: 0,
                coord: [3, 0]
            },
            {
                type: "ocean",
                coord: [4, 0]
            },
            {
                type: "port",
                resource: Resource.Brick,
                orientation: 0,
                coord: [5, 0]
            },
            {
                type: "ocean",
                coord: [5, 1]
            },
            {
                type: "port",
                resource: "general",
                orientation: 0,
                coord: [6, 2]
            },
            {
                type: "ocean",
                coord: [6, 3]
            },
            {
                type: "port",
                resource: Resource.Lumber,
                orientation: 3,
                coord: [6, 4]
            },
            {
                type: "ocean",
                coord: [5, 5]
            },
            {
                type: "port",
                resource: Resource.Wool,
                orientation: 3,
                coord: [5, 6]
            },
            {
                type: "ocean",
                coord: [4, 6]
            },
            {
                type: "port",
                resource: "general",
                orientation: 3,
                coord: [3, 6]
            },
            {
                type: "ocean",
                coord: [2, 6]
            },
            {
                type: "port",
                resource: "general",
                orientation: 5,
                coord: [1, 5]
            },
            {
                type: "ocean",
                coord: [1, 4]
            },
            {
                type: "port",
                resource: Resource.Ore,
                orientation: 5,
                coord: [0, 3]
            }
        ],
        roads: [
            {
                color: Color.Red,
                coord: [[6, 3], [6, 2]]
            },
            {
                color: Color.Blue,
                coord: [[9, 4], [9, 3]]
            },
            {
                color: Color.Green,
                coord: [[10, 3], [10, 2]]
            },
            {
                color: Color.Green,
                coord: [[6, 4], [7, 4]]
            },
            {
                color: Color.Blue,
                coord: [[9, 5], [8, 5]]
            },
            {
                color: Color.Red,
                coord: [[9, 2], [8, 2]]
            }
        ],
        robber: [3, 4],
        buildings: [
            {
                color: Color.Red,
                coord: [6, 3],
                type: 0
            },
            {
                color: Color.Blue,
                coord: [9, 4],
                type: 0
            },
            {
                color: Color.Green,
                coord: [10, 3],
                type: 0
            },
            {
                color: Color.Green,
                coord: [6, 4],
                type: 0
            },
            {
                color: Color.Blue,
                coord: [9, 5],
                type: 0
            },
            {
                color: Color.Red,
                coord: [9, 2],
                type: 0
            }
        ]
    },
    currentPlayer: 2,
    players: [
        {
            color: Color.Red,
            handCards: []
        },
        {
            color: Color.Blue,
            handCards: []
        },
        {
            color: Color.Green,
            handCards: []
        }
    ],
    phase: {
        type: 1,
        subtype: 2,
        tradeOffers: []
    }
}

const minimalState = minimalGameState(state)