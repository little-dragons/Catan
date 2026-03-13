import { Board } from "shared";

// This file contains some data for tests to use. For convenience, the board is given as a json string
// which can be viewed in the devtools of this project.
// Ctrl + K, Ctrl + 0 may be a helpful shortcut to collapse the string (may be different for your machine)

const boardJSONString = `
{
        "columnCount": 7,
        "rowCount": 7,
        "tiles": [
            {
                "type": 1,
                "resource": 1,
                "number": 11,
                "coord": [
                    3,
                    3
                ]
            },
            {
                "type": 1,
                "resource": 0,
                "number": 3,
                "coord": [
                    3,
                    2
                ]
            },
            {
                "type": 1,
                "resource": 0,
                "number": 6,
                "coord": [
                    4,
                    2
                ]
            },
            {
                "type": 1,
                "resource": 2,
                "number": 5,
                "coord": [
                    4,
                    3
                ]
            },
            {
                "type": 1,
                "resource": 1,
                "number": 4,
                "coord": [
                    4,
                    4
                ]
            },
            {
                "type": 1,
                "resource": 3,
                "number": 9,
                "coord": [
                    3,
                    4
                ]
            },
            {
                "type": 1,
                "resource": 2,
                "number": 10,
                "coord": [
                    2,
                    3
                ]
            },
            {
                "type": 1,
                "resource": 0,
                "number": 8,
                "coord": [
                    2,
                    2
                ]
            },
            {
                "type": 1,
                "resource": 3,
                "number": 4,
                "coord": [
                    2,
                    1
                ]
            },
            {
                "type": 1,
                "resource": 2,
                "number": 11,
                "coord": [
                    3,
                    1
                ]
            },
            {
                "type": 1,
                "resource": 1,
                "number": 12,
                "coord": [
                    4,
                    1
                ]
            },
            {
                "type": 1,
                "resource": 3,
                "number": 9,
                "coord": [
                    5,
                    2
                ]
            },
            {
                "type": 1,
                "resource": 0,
                "number": 10,
                "coord": [
                    5,
                    3
                ]
            },
            {
                "type": 1,
                "resource": 4,
                "number": 8,
                "coord": [
                    5,
                    4
                ]
            },
            {
                "type": 2,
                "coord": [
                    4,
                    5
                ]
            },
            {
                "type": 1,
                "resource": 4,
                "number": 3,
                "coord": [
                    3,
                    5
                ]
            },
            {
                "type": 1,
                "resource": 4,
                "number": 6,
                "coord": [
                    2,
                    5
                ]
            },
            {
                "type": 1,
                "resource": 3,
                "number": 2,
                "coord": [
                    2,
                    4
                ]
            },
            {
                "type": 1,
                "resource": 2,
                "number": 5,
                "coord": [
                    1,
                    3
                ]
            },
            {
                "type": 3,
                "coord": [
                    1,
                    2
                ]
            },
            {
                "type": 0,
                "resource": 0,
                "orientation": 1,
                "coord": [
                    1,
                    1
                ]
            },
            {
                "type": 3,
                "coord": [
                    2,
                    0
                ]
            },
            {
                "type": 0,
                "resource": 11,
                "orientation": 0,
                "coord": [
                    3,
                    0
                ]
            },
            {
                "type": 3,
                "coord": [
                    4,
                    0
                ]
            },
            {
                "type": 0,
                "resource": 4,
                "orientation": 0,
                "coord": [
                    5,
                    0
                ]
            },
            {
                "type": 3,
                "coord": [
                    5,
                    1
                ]
            },
            {
                "type": 0,
                "resource": 11,
                "orientation": 0,
                "coord": [
                    6,
                    2
                ]
            },
            {
                "type": 3,
                "coord": [
                    6,
                    3
                ]
            },
            {
                "type": 0,
                "resource": 3,
                "orientation": 3,
                "coord": [
                    6,
                    4
                ]
            },
            {
                "type": 3,
                "coord": [
                    5,
                    5
                ]
            },
            {
                "type": 0,
                "resource": 2,
                "orientation": 3,
                "coord": [
                    5,
                    6
                ]
            },
            {
                "type": 3,
                "coord": [
                    4,
                    6
                ]
            },
            {
                "type": 0,
                "resource": 11,
                "orientation": 3,
                "coord": [
                    3,
                    6
                ]
            },
            {
                "type": 3,
                "coord": [
                    2,
                    6
                ]
            },
            {
                "type": 0,
                "resource": 11,
                "orientation": 5,
                "coord": [
                    1,
                    5
                ]
            },
            {
                "type": 3,
                "coord": [
                    1,
                    4
                ]
            },
            {
                "type": 0,
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
}
`

export const testBoard = JSON.parse(boardJSONString) as Board

const yellowHasLongestRoadJSON = `
{
    "columnCount": 7,
    "rowCount": 7,
    "tiles": [
        {
            "type": 1,
            "resource": 1,
            "number": 11,
            "coord": [
                3,
                3
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 3,
            "coord": [
                4,
                3
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 6,
            "coord": [
                4,
                4
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 5,
            "coord": [
                3,
                4
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 4,
            "coord": [
                2,
                3
            ]
        },
        {
            "type": 2,
            "coord": [
                3,
                2
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 9,
            "coord": [
                4,
                2
            ]
        },
        {
            "type": 1,
            "resource": 0,
            "number": 10,
            "coord": [
                5,
                2
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 8,
            "coord": [
                5,
                3
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 4,
            "coord": [
                5,
                4
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 11,
            "coord": [
                4,
                5
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 12,
            "coord": [
                3,
                5
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 9,
            "coord": [
                2,
                5
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 10,
            "coord": [
                2,
                4
            ]
        },
        {
            "type": 1,
            "resource": 0,
            "number": 8,
            "coord": [
                1,
                3
            ]
        },
        {
            "type": 1,
            "resource": 0,
            "number": 3,
            "coord": [
                2,
                2
            ]
        },
        {
            "type": 1,
            "resource": 0,
            "number": 6,
            "coord": [
                2,
                1
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 2,
            "coord": [
                3,
                1
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 5,
            "coord": [
                4,
                1
            ]
        },
        {
            "type": 3,
            "coord": [
                5,
                1
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 2,
            "coord": [
                6,
                2
            ]
        },
        {
            "type": 3,
            "coord": [
                6,
                3
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 3,
            "coord": [
                6,
                4
            ]
        },
        {
            "type": 3,
            "coord": [
                5,
                5
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 3,
            "coord": [
                5,
                6
            ]
        },
        {
            "type": 3,
            "coord": [
                4,
                6
            ]
        },
        {
            "type": 0,
            "resource": 3,
            "orientation": 4,
            "coord": [
                3,
                6
            ]
        },
        {
            "type": 3,
            "coord": [
                2,
                6
            ]
        },
        {
            "type": 0,
            "resource": 1,
            "orientation": 5,
            "coord": [
                1,
                5
            ]
        },
        {
            "type": 3,
            "coord": [
                1,
                4
            ]
        },
        {
            "type": 0,
            "resource": 2,
            "orientation": 5,
            "coord": [
                0,
                3
            ]
        },
        {
            "type": 3,
            "coord": [
                1,
                2
            ]
        },
        {
            "type": 0,
            "resource": 4,
            "orientation": 5,
            "coord": [
                1,
                1
            ]
        },
        {
            "type": 3,
            "coord": [
                2,
                0
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 0,
            "coord": [
                3,
                0
            ]
        },
        {
            "type": 3,
            "coord": [
                4,
                0
            ]
        },
        {
            "type": 0,
            "resource": 0,
            "orientation": 0,
            "coord": [
                5,
                0
            ]
        }
    ],
    "roads": [
        {
            "color": 4,
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
            "color": 0,
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
            "color": 0,
            "coord": [
                [
                    8,
                    5
                ],
                [
                    9,
                    5
                ]
            ]
        },
        {
            "color": 4,
            "coord": [
                [
                    11,
                    4
                ],
                [
                    11,
                    3
                ]
            ]
        },
        {
            "color": 0,
            "coord": [
                [
                    10,
                    5
                ],
                [
                    9,
                    5
                ]
            ]
        },
        {
            "color": 0,
            "coord": [
                [
                    11,
                    5
                ],
                [
                    10,
                    5
                ]
            ]
        },
        {
            "color": 0,
            "coord": [
                [
                    12,
                    5
                ],
                [
                    11,
                    5
                ]
            ]
        },
        {
            "color": 0,
            "coord": [
                [
                    12,
                    4
                ],
                [
                    12,
                    5
                ]
            ]
        }
    ],
    "robber": [
        4,
        3
    ],
    "buildings": [
        {
            "color": 4,
            "coord": [
                10,
                3
            ],
            "type": 0
        },
        {
            "color": 0,
            "coord": [
                6,
                4
            ],
            "type": 0
        },
        {
            "color": 0,
            "coord": [
                8,
                5
            ],
            "type": 0
        },
        {
            "color": 4,
            "coord": [
                11,
                4
            ],
            "type": 0
        }
    ]
}
`

export const yellowHasLongestRoadBoard= JSON.parse(yellowHasLongestRoadJSON) as Board

const yellowHasLongestRoad2JSON = `
{
    "columnCount": 7,
    "rowCount": 7,
    "tiles": [
        {
            "type": 1,
            "resource": 1,
            "number": 11,
            "coord": [
                3,
                3
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 3,
            "coord": [
                4,
                3
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 6,
            "coord": [
                4,
                4
            ]
        },
        {
            "type": 1,
            "resource": 0,
            "number": 5,
            "coord": [
                3,
                4
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 4,
            "coord": [
                2,
                3
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 9,
            "coord": [
                3,
                2
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 10,
            "coord": [
                4,
                2
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 8,
            "coord": [
                5,
                2
            ]
        },
        {
            "type": 1,
            "resource": 0,
            "number": 4,
            "coord": [
                5,
                3
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 11,
            "coord": [
                5,
                4
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 12,
            "coord": [
                4,
                5
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 9,
            "coord": [
                3,
                5
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 10,
            "coord": [
                2,
                5
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 8,
            "coord": [
                2,
                4
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 3,
            "coord": [
                1,
                3
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 6,
            "coord": [
                2,
                2
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 2,
            "coord": [
                2,
                1
            ]
        },
        {
            "type": 1,
            "resource": 0,
            "number": 5,
            "coord": [
                3,
                1
            ]
        },
        {
            "type": 2,
            "coord": [
                4,
                1
            ]
        },
        {
            "type": 3,
            "coord": [
                5,
                1
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 0,
            "coord": [
                6,
                2
            ]
        },
        {
            "type": 3,
            "coord": [
                6,
                3
            ]
        },
        {
            "type": 0,
            "resource": 0,
            "orientation": 2,
            "coord": [
                6,
                4
            ]
        },
        {
            "type": 3,
            "coord": [
                5,
                5
            ]
        },
        {
            "type": 0,
            "resource": 4,
            "orientation": 3,
            "coord": [
                5,
                6
            ]
        },
        {
            "type": 3,
            "coord": [
                4,
                6
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 4,
            "coord": [
                3,
                6
            ]
        },
        {
            "type": 3,
            "coord": [
                2,
                6
            ]
        },
        {
            "type": 0,
            "resource": 3,
            "orientation": 4,
            "coord": [
                1,
                5
            ]
        },
        {
            "type": 3,
            "coord": [
                1,
                4
            ]
        },
        {
            "type": 0,
            "resource": 1,
            "orientation": 5,
            "coord": [
                0,
                3
            ]
        },
        {
            "type": 3,
            "coord": [
                1,
                2
            ]
        },
        {
            "type": 0,
            "resource": 2,
            "orientation": 1,
            "coord": [
                1,
                1
            ]
        },
        {
            "type": 3,
            "coord": [
                2,
                0
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 1,
            "coord": [
                3,
                0
            ]
        },
        {
            "type": 3,
            "coord": [
                4,
                0
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 0,
            "coord": [
                5,
                0
            ]
        }
    ],
    "roads": [
        {
            "color": 0,
            "coord": [
                [
                    6,
                    3
                ],
                [
                    7,
                    3
                ]
            ]
        },
        {
            "color": 3,
            "coord": [
                [
                    9,
                    5
                ],
                [
                    10,
                    5
                ]
            ]
        },
        {
            "color": 3,
            "coord": [
                [
                    5,
                    5
                ],
                [
                    4,
                    5
                ]
            ]
        },
        {
            "color": 0,
            "coord": [
                [
                    5,
                    4
                ],
                [
                    6,
                    4
                ]
            ]
        },
        {
            "color": 3,
            "coord": [
                [
                    8,
                    5
                ],
                [
                    9,
                    5
                ]
            ]
        },
        {
            "color": 3,
            "coord": [
                [
                    7,
                    5
                ],
                [
                    8,
                    5
                ]
            ]
        },
        {
            "color": 0,
            "coord": [
                [
                    7,
                    4
                ],
                [
                    7,
                    3
                ]
            ]
        },
        {
            "color": 0,
            "coord": [
                [
                    7,
                    4
                ],
                [
                    6,
                    4
                ]
            ]
        },
        {
            "color": 0,
            "coord": [
                [
                    5,
                    3
                ],
                [
                    5,
                    4
                ]
            ]
        }
    ],
    "robber": [
        5,
        3
    ],
    "buildings": [
        {
            "color": 0,
            "coord": [
                6,
                3
            ],
            "type": 0
        },
        {
            "color": 3,
            "coord": [
                9,
                5
            ],
            "type": 0
        },
        {
            "color": 3,
            "coord": [
                5,
                5
            ],
            "type": 0
        },
        {
            "color": 0,
            "coord": [
                5,
                4
            ],
            "type": 0
        }
    ]
}
`

export const yellowHasLongestRoad2Board= JSON.parse(yellowHasLongestRoad2JSON) as Board

const yellowHasLongestRoadWithCycleJSON = `
{
    "columnCount": 7,
    "rowCount": 7,
    "tiles": [
        {
            "type": 1,
            "resource": 1,
            "number": 11,
            "coord": [
                3,
                3
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 3,
            "coord": [
                4,
                3
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 6,
            "coord": [
                4,
                4
            ]
        },
        {
            "type": 1,
            "resource": 0,
            "number": 5,
            "coord": [
                3,
                4
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 4,
            "coord": [
                2,
                3
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 9,
            "coord": [
                3,
                2
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 10,
            "coord": [
                4,
                2
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 8,
            "coord": [
                5,
                2
            ]
        },
        {
            "type": 1,
            "resource": 0,
            "number": 4,
            "coord": [
                5,
                3
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 11,
            "coord": [
                5,
                4
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 12,
            "coord": [
                4,
                5
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 9,
            "coord": [
                3,
                5
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 10,
            "coord": [
                2,
                5
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 8,
            "coord": [
                2,
                4
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 3,
            "coord": [
                1,
                3
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 6,
            "coord": [
                2,
                2
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 2,
            "coord": [
                2,
                1
            ]
        },
        {
            "type": 1,
            "resource": 0,
            "number": 5,
            "coord": [
                3,
                1
            ]
        },
        {
            "type": 2,
            "coord": [
                4,
                1
            ]
        },
        {
            "type": 3,
            "coord": [
                5,
                1
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 0,
            "coord": [
                6,
                2
            ]
        },
        {
            "type": 3,
            "coord": [
                6,
                3
            ]
        },
        {
            "type": 0,
            "resource": 0,
            "orientation": 2,
            "coord": [
                6,
                4
            ]
        },
        {
            "type": 3,
            "coord": [
                5,
                5
            ]
        },
        {
            "type": 0,
            "resource": 4,
            "orientation": 3,
            "coord": [
                5,
                6
            ]
        },
        {
            "type": 3,
            "coord": [
                4,
                6
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 4,
            "coord": [
                3,
                6
            ]
        },
        {
            "type": 3,
            "coord": [
                2,
                6
            ]
        },
        {
            "type": 0,
            "resource": 3,
            "orientation": 4,
            "coord": [
                1,
                5
            ]
        },
        {
            "type": 3,
            "coord": [
                1,
                4
            ]
        },
        {
            "type": 0,
            "resource": 1,
            "orientation": 5,
            "coord": [
                0,
                3
            ]
        },
        {
            "type": 3,
            "coord": [
                1,
                2
            ]
        },
        {
            "type": 0,
            "resource": 2,
            "orientation": 1,
            "coord": [
                1,
                1
            ]
        },
        {
            "type": 3,
            "coord": [
                2,
                0
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 1,
            "coord": [
                3,
                0
            ]
        },
        {
            "type": 3,
            "coord": [
                4,
                0
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 0,
            "coord": [
                5,
                0
            ]
        }
    ],
    "roads": [
        {
            "color": 0,
            "coord": [
                [
                    6,
                    3
                ],
                [
                    7,
                    3
                ]
            ]
        },
        {
            "color": 3,
            "coord": [
                [
                    9,
                    5
                ],
                [
                    10,
                    5
                ]
            ]
        },
        {
            "color": 3,
            "coord": [
                [
                    5,
                    5
                ],
                [
                    4,
                    5
                ]
            ]
        },
        {
            "color": 0,
            "coord": [
                [
                    5,
                    4
                ],
                [
                    6,
                    4
                ]
            ]
        },
        {
            "color": 3,
            "coord": [
                [
                    8,
                    5
                ],
                [
                    9,
                    5
                ]
            ]
        },
        {
            "color": 3,
            "coord": [
                [
                    7,
                    5
                ],
                [
                    8,
                    5
                ]
            ]
        },
        {
            "color": 0,
            "coord": [
                [
                    7,
                    4
                ],
                [
                    7,
                    3
                ]
            ]
        },
        {
            "color": 0,
            "coord": [
                [
                    7,
                    4
                ],
                [
                    6,
                    4
                ]
            ]
        },
        {
            "color": 0,
            "coord": [
                [
                    5,
                    3
                ],
                [
                    5,
                    4
                ]
            ]
        },
        {
            "color": 0,
            "coord": [
                [
                    5,
                    3
                ],
                [
                    6,
                    3
                ]
            ]
        }
    ],
    "robber": [
        5,
        3
    ],
    "buildings": [
        {
            "color": 0,
            "coord": [
                6,
                3
            ],
            "type": 0
        },
        {
            "color": 3,
            "coord": [
                9,
                5
            ],
            "type": 0
        },
        {
            "color": 3,
            "coord": [
                5,
                5
            ],
            "type": 0
        },
        {
            "color": 0,
            "coord": [
                5,
                4
            ],
            "type": 0
        }
    ]
}
`

export const yellowHasLongestRoadWithCycle = JSON.parse(yellowHasLongestRoadWithCycleJSON) as Board

const yellowHasLongerThanGreenJSON = `
{
    "columnCount": 7,
    "rowCount": 7,
    "tiles": [
        {
            "type": 1,
            "resource": 1,
            "number": 11,
            "coord": [
                3,
                3
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 3,
            "coord": [
                4,
                3
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 6,
            "coord": [
                4,
                4
            ]
        },
        {
            "type": 1,
            "resource": 0,
            "number": 5,
            "coord": [
                3,
                4
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 4,
            "coord": [
                2,
                3
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 9,
            "coord": [
                3,
                2
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 10,
            "coord": [
                4,
                2
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 8,
            "coord": [
                5,
                2
            ]
        },
        {
            "type": 1,
            "resource": 0,
            "number": 4,
            "coord": [
                5,
                3
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 11,
            "coord": [
                5,
                4
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 12,
            "coord": [
                4,
                5
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 9,
            "coord": [
                3,
                5
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 10,
            "coord": [
                2,
                5
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 8,
            "coord": [
                2,
                4
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 3,
            "coord": [
                1,
                3
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 6,
            "coord": [
                2,
                2
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 2,
            "coord": [
                2,
                1
            ]
        },
        {
            "type": 1,
            "resource": 0,
            "number": 5,
            "coord": [
                3,
                1
            ]
        },
        {
            "type": 2,
            "coord": [
                4,
                1
            ]
        },
        {
            "type": 3,
            "coord": [
                5,
                1
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 0,
            "coord": [
                6,
                2
            ]
        },
        {
            "type": 3,
            "coord": [
                6,
                3
            ]
        },
        {
            "type": 0,
            "resource": 0,
            "orientation": 2,
            "coord": [
                6,
                4
            ]
        },
        {
            "type": 3,
            "coord": [
                5,
                5
            ]
        },
        {
            "type": 0,
            "resource": 4,
            "orientation": 3,
            "coord": [
                5,
                6
            ]
        },
        {
            "type": 3,
            "coord": [
                4,
                6
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 4,
            "coord": [
                3,
                6
            ]
        },
        {
            "type": 3,
            "coord": [
                2,
                6
            ]
        },
        {
            "type": 0,
            "resource": 3,
            "orientation": 4,
            "coord": [
                1,
                5
            ]
        },
        {
            "type": 3,
            "coord": [
                1,
                4
            ]
        },
        {
            "type": 0,
            "resource": 1,
            "orientation": 5,
            "coord": [
                0,
                3
            ]
        },
        {
            "type": 3,
            "coord": [
                1,
                2
            ]
        },
        {
            "type": 0,
            "resource": 2,
            "orientation": 1,
            "coord": [
                1,
                1
            ]
        },
        {
            "type": 3,
            "coord": [
                2,
                0
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 1,
            "coord": [
                3,
                0
            ]
        },
        {
            "type": 3,
            "coord": [
                4,
                0
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 0,
            "coord": [
                5,
                0
            ]
        }
    ],
    "roads": [
        {
            "color": 0,
            "coord": [
                [
                    6,
                    3
                ],
                [
                    7,
                    3
                ]
            ]
        },
        {
            "color": 3,
            "coord": [
                [
                    9,
                    5
                ],
                [
                    10,
                    5
                ]
            ]
        },
        {
            "color": 3,
            "coord": [
                [
                    5,
                    5
                ],
                [
                    4,
                    5
                ]
            ]
        },
        {
            "color": 0,
            "coord": [
                [
                    5,
                    4
                ],
                [
                    6,
                    4
                ]
            ]
        },
        {
            "color": 3,
            "coord": [
                [
                    8,
                    5
                ],
                [
                    9,
                    5
                ]
            ]
        },
        {
            "color": 3,
            "coord": [
                [
                    7,
                    5
                ],
                [
                    8,
                    5
                ]
            ]
        },
        {
            "color": 0,
            "coord": [
                [
                    7,
                    4
                ],
                [
                    7,
                    3
                ]
            ]
        },
        {
            "color": 0,
            "coord": [
                [
                    7,
                    4
                ],
                [
                    6,
                    4
                ]
            ]
        },
        {
            "color": 0,
            "coord": [
                [
                    5,
                    3
                ],
                [
                    5,
                    4
                ]
            ]
        },
        {
            "color": 0,
            "coord": [
                [
                    5,
                    3
                ],
                [
                    6,
                    3
                ]
            ]
        },
        {
            "color": 3,
            "coord": [
                [
                    6,
                    5
                ],
                [
                    7,
                    5
                ]
            ]
        },
        {
            "color": 3,
            "coord": [
                [
                    10,
                    4
                ],
                [
                    10,
                    5
                ]
            ]
        }
    ],
    "robber": [
        5,
        3
    ],
    "buildings": [
        {
            "color": 0,
            "coord": [
                6,
                3
            ],
            "type": 0
        },
        {
            "color": 3,
            "coord": [
                9,
                5
            ],
            "type": 0
        },
        {
            "color": 3,
            "coord": [
                5,
                5
            ],
            "type": 0
        },
        {
            "color": 0,
            "coord": [
                5,
                4
            ],
            "type": 0
        }
    ]
}
`

export const yellowHasLongerThanGreen = JSON.parse(yellowHasLongerThanGreenJSON) as Board

const yellowAndGreenSameLengthJSON = `
{
    "columnCount": 7,
    "rowCount": 7,
    "tiles": [
        {
            "type": 1,
            "resource": 1,
            "number": 11,
            "coord": [
                3,
                3
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 3,
            "coord": [
                4,
                3
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 6,
            "coord": [
                4,
                4
            ]
        },
        {
            "type": 1,
            "resource": 0,
            "number": 5,
            "coord": [
                3,
                4
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 4,
            "coord": [
                2,
                3
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 9,
            "coord": [
                3,
                2
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 10,
            "coord": [
                4,
                2
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 8,
            "coord": [
                5,
                2
            ]
        },
        {
            "type": 1,
            "resource": 0,
            "number": 4,
            "coord": [
                5,
                3
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 11,
            "coord": [
                5,
                4
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 12,
            "coord": [
                4,
                5
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 9,
            "coord": [
                3,
                5
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 10,
            "coord": [
                2,
                5
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 8,
            "coord": [
                2,
                4
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 3,
            "coord": [
                1,
                3
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 6,
            "coord": [
                2,
                2
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 2,
            "coord": [
                2,
                1
            ]
        },
        {
            "type": 1,
            "resource": 0,
            "number": 5,
            "coord": [
                3,
                1
            ]
        },
        {
            "type": 2,
            "coord": [
                4,
                1
            ]
        },
        {
            "type": 3,
            "coord": [
                5,
                1
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 0,
            "coord": [
                6,
                2
            ]
        },
        {
            "type": 3,
            "coord": [
                6,
                3
            ]
        },
        {
            "type": 0,
            "resource": 0,
            "orientation": 2,
            "coord": [
                6,
                4
            ]
        },
        {
            "type": 3,
            "coord": [
                5,
                5
            ]
        },
        {
            "type": 0,
            "resource": 4,
            "orientation": 3,
            "coord": [
                5,
                6
            ]
        },
        {
            "type": 3,
            "coord": [
                4,
                6
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 4,
            "coord": [
                3,
                6
            ]
        },
        {
            "type": 3,
            "coord": [
                2,
                6
            ]
        },
        {
            "type": 0,
            "resource": 3,
            "orientation": 4,
            "coord": [
                1,
                5
            ]
        },
        {
            "type": 3,
            "coord": [
                1,
                4
            ]
        },
        {
            "type": 0,
            "resource": 1,
            "orientation": 5,
            "coord": [
                0,
                3
            ]
        },
        {
            "type": 3,
            "coord": [
                1,
                2
            ]
        },
        {
            "type": 0,
            "resource": 2,
            "orientation": 1,
            "coord": [
                1,
                1
            ]
        },
        {
            "type": 3,
            "coord": [
                2,
                0
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 1,
            "coord": [
                3,
                0
            ]
        },
        {
            "type": 3,
            "coord": [
                4,
                0
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 0,
            "coord": [
                5,
                0
            ]
        }
    ],
    "roads": [
        {
            "color": 0,
            "coord": [
                [
                    6,
                    3
                ],
                [
                    7,
                    3
                ]
            ]
        },
        {
            "color": 3,
            "coord": [
                [
                    9,
                    5
                ],
                [
                    10,
                    5
                ]
            ]
        },
        {
            "color": 3,
            "coord": [
                [
                    5,
                    5
                ],
                [
                    4,
                    5
                ]
            ]
        },
        {
            "color": 0,
            "coord": [
                [
                    5,
                    4
                ],
                [
                    6,
                    4
                ]
            ]
        },
        {
            "color": 3,
            "coord": [
                [
                    8,
                    5
                ],
                [
                    9,
                    5
                ]
            ]
        },
        {
            "color": 3,
            "coord": [
                [
                    7,
                    5
                ],
                [
                    8,
                    5
                ]
            ]
        },
        {
            "color": 0,
            "coord": [
                [
                    7,
                    4
                ],
                [
                    7,
                    3
                ]
            ]
        },
        {
            "color": 0,
            "coord": [
                [
                    7,
                    4
                ],
                [
                    6,
                    4
                ]
            ]
        },
        {
            "color": 0,
            "coord": [
                [
                    5,
                    3
                ],
                [
                    5,
                    4
                ]
            ]
        },
        {
            "color": 0,
            "coord": [
                [
                    5,
                    3
                ],
                [
                    6,
                    3
                ]
            ]
        },
        {
            "color": 3,
            "coord": [
                [
                    6,
                    5
                ],
                [
                    7,
                    5
                ]
            ]
        },
        {
            "color": 3,
            "coord": [
                [
                    10,
                    4
                ],
                [
                    10,
                    5
                ]
            ]
        },
        {
            "color": 3,
            "coord": [
                [
                    11,
                    4
                ],
                [
                    10,
                    4
                ]
            ]
        }
    ],
    "robber": [
        5,
        3
    ],
    "buildings": [
        {
            "color": 0,
            "coord": [
                6,
                3
            ],
            "type": 0
        },
        {
            "color": 3,
            "coord": [
                9,
                5
            ],
            "type": 0
        },
        {
            "color": 3,
            "coord": [
                5,
                5
            ],
            "type": 0
        },
        {
            "color": 0,
            "coord": [
                5,
                4
            ],
            "type": 0
        }
    ]
}
`

export const yellowAndGreenSameLength = JSON.parse(yellowAndGreenSameLengthJSON) as Board

const yellowAndGreenSameLength2JSON = `
{
    "columnCount": 7,
    "rowCount": 7,
    "tiles": [
        {
            "type": 1,
            "resource": 1,
            "number": 11,
            "coord": [
                3,
                3
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 3,
            "coord": [
                4,
                3
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 6,
            "coord": [
                4,
                4
            ]
        },
        {
            "type": 1,
            "resource": 0,
            "number": 5,
            "coord": [
                3,
                4
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 4,
            "coord": [
                2,
                3
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 9,
            "coord": [
                3,
                2
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 10,
            "coord": [
                4,
                2
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 8,
            "coord": [
                5,
                2
            ]
        },
        {
            "type": 1,
            "resource": 0,
            "number": 4,
            "coord": [
                5,
                3
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 11,
            "coord": [
                5,
                4
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 12,
            "coord": [
                4,
                5
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 9,
            "coord": [
                3,
                5
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 10,
            "coord": [
                2,
                5
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 8,
            "coord": [
                2,
                4
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 3,
            "coord": [
                1,
                3
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 6,
            "coord": [
                2,
                2
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 2,
            "coord": [
                2,
                1
            ]
        },
        {
            "type": 1,
            "resource": 0,
            "number": 5,
            "coord": [
                3,
                1
            ]
        },
        {
            "type": 2,
            "coord": [
                4,
                1
            ]
        },
        {
            "type": 3,
            "coord": [
                5,
                1
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 0,
            "coord": [
                6,
                2
            ]
        },
        {
            "type": 3,
            "coord": [
                6,
                3
            ]
        },
        {
            "type": 0,
            "resource": 0,
            "orientation": 2,
            "coord": [
                6,
                4
            ]
        },
        {
            "type": 3,
            "coord": [
                5,
                5
            ]
        },
        {
            "type": 0,
            "resource": 4,
            "orientation": 3,
            "coord": [
                5,
                6
            ]
        },
        {
            "type": 3,
            "coord": [
                4,
                6
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 4,
            "coord": [
                3,
                6
            ]
        },
        {
            "type": 3,
            "coord": [
                2,
                6
            ]
        },
        {
            "type": 0,
            "resource": 3,
            "orientation": 4,
            "coord": [
                1,
                5
            ]
        },
        {
            "type": 3,
            "coord": [
                1,
                4
            ]
        },
        {
            "type": 0,
            "resource": 1,
            "orientation": 5,
            "coord": [
                0,
                3
            ]
        },
        {
            "type": 3,
            "coord": [
                1,
                2
            ]
        },
        {
            "type": 0,
            "resource": 2,
            "orientation": 1,
            "coord": [
                1,
                1
            ]
        },
        {
            "type": 3,
            "coord": [
                2,
                0
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 1,
            "coord": [
                3,
                0
            ]
        },
        {
            "type": 3,
            "coord": [
                4,
                0
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 0,
            "coord": [
                5,
                0
            ]
        }
    ],
    "roads": [
        {
            "color": 0,
            "coord": [
                [
                    6,
                    3
                ],
                [
                    7,
                    3
                ]
            ]
        },
        {
            "color": 3,
            "coord": [
                [
                    9,
                    5
                ],
                [
                    10,
                    5
                ]
            ]
        },
        {
            "color": 3,
            "coord": [
                [
                    5,
                    5
                ],
                [
                    4,
                    5
                ]
            ]
        },
        {
            "color": 0,
            "coord": [
                [
                    5,
                    4
                ],
                [
                    6,
                    4
                ]
            ]
        },
        {
            "color": 3,
            "coord": [
                [
                    8,
                    5
                ],
                [
                    9,
                    5
                ]
            ]
        },
        {
            "color": 3,
            "coord": [
                [
                    7,
                    5
                ],
                [
                    8,
                    5
                ]
            ]
        },
        {
            "color": 0,
            "coord": [
                [
                    7,
                    4
                ],
                [
                    7,
                    3
                ]
            ]
        },
        {
            "color": 0,
            "coord": [
                [
                    7,
                    4
                ],
                [
                    6,
                    4
                ]
            ]
        },
        {
            "color": 0,
            "coord": [
                [
                    5,
                    3
                ],
                [
                    5,
                    4
                ]
            ]
        },
        {
            "color": 0,
            "coord": [
                [
                    5,
                    3
                ],
                [
                    6,
                    3
                ]
            ]
        },
        {
            "color": 3,
            "coord": [
                [
                    6,
                    5
                ],
                [
                    7,
                    5
                ]
            ]
        },
        {
            "color": 3,
            "coord": [
                [
                    10,
                    4
                ],
                [
                    10,
                    5
                ]
            ]
        },
        {
            "color": 3,
            "coord": [
                [
                    11,
                    4
                ],
                [
                    10,
                    4
                ]
            ]
        },
        {
            "color": 3,
            "coord": [
                [
                    9,
                    4
                ],
                [
                    10,
                    4
                ]
            ]
        }
    ],
    "robber": [
        5,
        2
    ],
    "buildings": [
        {
            "color": 0,
            "coord": [
                6,
                3
            ],
            "type": 0
        },
        {
            "color": 3,
            "coord": [
                9,
                5
            ],
            "type": 0
        },
        {
            "color": 3,
            "coord": [
                5,
                5
            ],
            "type": 0
        },
        {
            "color": 0,
            "coord": [
                5,
                4
            ],
            "type": 0
        }
    ]
}
`

export const yellowAndGreenSameLength2 = JSON.parse(yellowAndGreenSameLength2JSON) as Board

export const blueAndRedTriangleJSON = `
{
    "columnCount": 7,
    "rowCount": 7,
    "tiles": [
        {
            "type": 1,
            "resource": 0,
            "number": 11,
            "coord": [
                3,
                3
            ]
        },
        {
            "type": 2,
            "coord": [
                3,
                2
            ]
        },
        {
            "type": 1,
            "resource": 0,
            "number": 3,
            "coord": [
                4,
                2
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 6,
            "coord": [
                4,
                3
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 5,
            "coord": [
                4,
                4
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 4,
            "coord": [
                3,
                4
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 9,
            "coord": [
                2,
                3
            ]
        },
        {
            "type": 1,
            "resource": 0,
            "number": 10,
            "coord": [
                2,
                2
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 8,
            "coord": [
                2,
                1
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 4,
            "coord": [
                3,
                1
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 11,
            "coord": [
                4,
                1
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 12,
            "coord": [
                5,
                2
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 9,
            "coord": [
                5,
                3
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 10,
            "coord": [
                5,
                4
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 8,
            "coord": [
                4,
                5
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 3,
            "coord": [
                3,
                5
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 6,
            "coord": [
                2,
                5
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 2,
            "coord": [
                2,
                4
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 5,
            "coord": [
                1,
                3
            ]
        },
        {
            "type": 3,
            "coord": [
                1,
                2
            ]
        },
        {
            "type": 0,
            "resource": 0,
            "orientation": 5,
            "coord": [
                1,
                1
            ]
        },
        {
            "type": 3,
            "coord": [
                2,
                0
            ]
        },
        {
            "type": 0,
            "resource": 1,
            "orientation": 1,
            "coord": [
                3,
                0
            ]
        },
        {
            "type": 3,
            "coord": [
                4,
                0
            ]
        },
        {
            "type": 0,
            "resource": 2,
            "orientation": 0,
            "coord": [
                5,
                0
            ]
        },
        {
            "type": 3,
            "coord": [
                5,
                1
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 0,
            "coord": [
                6,
                2
            ]
        },
        {
            "type": 3,
            "coord": [
                6,
                3
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 2,
            "coord": [
                6,
                4
            ]
        },
        {
            "type": 3,
            "coord": [
                5,
                5
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 3,
            "coord": [
                5,
                6
            ]
        },
        {
            "type": 3,
            "coord": [
                4,
                6
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 3,
            "coord": [
                3,
                6
            ]
        },
        {
            "type": 3,
            "coord": [
                2,
                6
            ]
        },
        {
            "type": 0,
            "resource": 3,
            "orientation": 5,
            "coord": [
                1,
                5
            ]
        },
        {
            "type": 3,
            "coord": [
                1,
                4
            ]
        },
        {
            "type": 0,
            "resource": 4,
            "orientation": 5,
            "coord": [
                0,
                3
            ]
        }
    ],
    "roads": [
        {
            "color": 4,
            "coord": [
                [
                    11,
                    4
                ],
                [
                    11,
                    3
                ]
            ]
        },
        {
            "color": 2,
            "coord": [
                [
                    7,
                    2
                ],
                [
                    6,
                    2
                ]
            ]
        },
        {
            "color": 2,
            "coord": [
                [
                    6,
                    5
                ],
                [
                    6,
                    4
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
                    10,
                    4
                ]
            ]
        },
        {
            "color": 4,
            "coord": [
                [
                    8,
                    4
                ],
                [
                    9,
                    4
                ]
            ]
        },
        {
            "color": 2,
            "coord": [
                [
                    7,
                    5
                ],
                [
                    6,
                    5
                ]
            ]
        },
        {
            "color": 2,
            "coord": [
                [
                    5,
                    5
                ],
                [
                    6,
                    5
                ]
            ]
        },
        {
            "color": 4,
            "coord": [
                [
                    9,
                    3
                ],
                [
                    9,
                    4
                ]
            ]
        },
        {
            "color": 4,
            "coord": [
                [
                    8,
                    3
                ],
                [
                    9,
                    3
                ]
            ]
        }
    ],
    "robber": [
        3,
        5
    ],
    "buildings": [
        {
            "color": 4,
            "coord": [
                11,
                4
            ],
            "type": 0
        },
        {
            "color": 2,
            "coord": [
                7,
                2
            ],
            "type": 0
        },
        {
            "color": 2,
            "coord": [
                6,
                5
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
        }
    ]
}
`

export const blueAndRedTriangle = JSON.parse(blueAndRedTriangleJSON) as Board

const blueAndRedMoreTrianglesJSON = `
{
    "columnCount": 7,
    "rowCount": 7,
    "tiles": [
        {
            "type": 1,
            "resource": 0,
            "number": 11,
            "coord": [
                3,
                3
            ]
        },
        {
            "type": 2,
            "coord": [
                3,
                2
            ]
        },
        {
            "type": 1,
            "resource": 0,
            "number": 3,
            "coord": [
                4,
                2
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 6,
            "coord": [
                4,
                3
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 5,
            "coord": [
                4,
                4
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 4,
            "coord": [
                3,
                4
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 9,
            "coord": [
                2,
                3
            ]
        },
        {
            "type": 1,
            "resource": 0,
            "number": 10,
            "coord": [
                2,
                2
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 8,
            "coord": [
                2,
                1
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 4,
            "coord": [
                3,
                1
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 11,
            "coord": [
                4,
                1
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 12,
            "coord": [
                5,
                2
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 9,
            "coord": [
                5,
                3
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 10,
            "coord": [
                5,
                4
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 8,
            "coord": [
                4,
                5
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 3,
            "coord": [
                3,
                5
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 6,
            "coord": [
                2,
                5
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 2,
            "coord": [
                2,
                4
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 5,
            "coord": [
                1,
                3
            ]
        },
        {
            "type": 3,
            "coord": [
                1,
                2
            ]
        },
        {
            "type": 0,
            "resource": 0,
            "orientation": 5,
            "coord": [
                1,
                1
            ]
        },
        {
            "type": 3,
            "coord": [
                2,
                0
            ]
        },
        {
            "type": 0,
            "resource": 1,
            "orientation": 1,
            "coord": [
                3,
                0
            ]
        },
        {
            "type": 3,
            "coord": [
                4,
                0
            ]
        },
        {
            "type": 0,
            "resource": 2,
            "orientation": 0,
            "coord": [
                5,
                0
            ]
        },
        {
            "type": 3,
            "coord": [
                5,
                1
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 0,
            "coord": [
                6,
                2
            ]
        },
        {
            "type": 3,
            "coord": [
                6,
                3
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 2,
            "coord": [
                6,
                4
            ]
        },
        {
            "type": 3,
            "coord": [
                5,
                5
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 3,
            "coord": [
                5,
                6
            ]
        },
        {
            "type": 3,
            "coord": [
                4,
                6
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 3,
            "coord": [
                3,
                6
            ]
        },
        {
            "type": 3,
            "coord": [
                2,
                6
            ]
        },
        {
            "type": 0,
            "resource": 3,
            "orientation": 5,
            "coord": [
                1,
                5
            ]
        },
        {
            "type": 3,
            "coord": [
                1,
                4
            ]
        },
        {
            "type": 0,
            "resource": 4,
            "orientation": 5,
            "coord": [
                0,
                3
            ]
        }
    ],
    "roads": [
        {
            "color": 4,
            "coord": [
                [
                    11,
                    4
                ],
                [
                    11,
                    3
                ]
            ]
        },
        {
            "color": 2,
            "coord": [
                [
                    7,
                    2
                ],
                [
                    6,
                    2
                ]
            ]
        },
        {
            "color": 2,
            "coord": [
                [
                    6,
                    5
                ],
                [
                    6,
                    4
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
                    10,
                    4
                ]
            ]
        },
        {
            "color": 4,
            "coord": [
                [
                    8,
                    4
                ],
                [
                    9,
                    4
                ]
            ]
        },
        {
            "color": 2,
            "coord": [
                [
                    7,
                    5
                ],
                [
                    6,
                    5
                ]
            ]
        },
        {
            "color": 2,
            "coord": [
                [
                    5,
                    5
                ],
                [
                    6,
                    5
                ]
            ]
        },
        {
            "color": 4,
            "coord": [
                [
                    9,
                    3
                ],
                [
                    9,
                    4
                ]
            ]
        },
        {
            "color": 4,
            "coord": [
                [
                    8,
                    3
                ],
                [
                    9,
                    3
                ]
            ]
        },
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
                    7,
                    4
                ],
                [
                    8,
                    4
                ]
            ]
        },
        {
            "color": 4,
            "coord": [
                [
                    10,
                    3
                ],
                [
                    9,
                    3
                ]
            ]
        }
    ],
    "robber": [
        4,
        5
    ],
    "buildings": [
        {
            "color": 4,
            "coord": [
                11,
                4
            ],
            "type": 0
        },
        {
            "color": 2,
            "coord": [
                7,
                2
            ],
            "type": 0
        },
        {
            "color": 2,
            "coord": [
                6,
                5
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
        }
    ]
}
`

export const blueAndRedMoreTriangles = JSON.parse(blueAndRedMoreTrianglesJSON) as Board


const complexBlueRoadJSON = `
{
    "columnCount": 7,
    "rowCount": 7,
    "tiles": [
        {
            "type": 1,
            "resource": 0,
            "number": 11,
            "coord": [
                3,
                3
            ]
        },
        {
            "type": 2,
            "coord": [
                3,
                2
            ]
        },
        {
            "type": 1,
            "resource": 0,
            "number": 3,
            "coord": [
                4,
                2
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 6,
            "coord": [
                4,
                3
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 5,
            "coord": [
                4,
                4
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 4,
            "coord": [
                3,
                4
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 9,
            "coord": [
                2,
                3
            ]
        },
        {
            "type": 1,
            "resource": 0,
            "number": 10,
            "coord": [
                2,
                2
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 8,
            "coord": [
                2,
                1
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 4,
            "coord": [
                3,
                1
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 11,
            "coord": [
                4,
                1
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 12,
            "coord": [
                5,
                2
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 9,
            "coord": [
                5,
                3
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 10,
            "coord": [
                5,
                4
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 8,
            "coord": [
                4,
                5
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 3,
            "coord": [
                3,
                5
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 6,
            "coord": [
                2,
                5
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 2,
            "coord": [
                2,
                4
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 5,
            "coord": [
                1,
                3
            ]
        },
        {
            "type": 3,
            "coord": [
                1,
                2
            ]
        },
        {
            "type": 0,
            "resource": 0,
            "orientation": 5,
            "coord": [
                1,
                1
            ]
        },
        {
            "type": 3,
            "coord": [
                2,
                0
            ]
        },
        {
            "type": 0,
            "resource": 1,
            "orientation": 1,
            "coord": [
                3,
                0
            ]
        },
        {
            "type": 3,
            "coord": [
                4,
                0
            ]
        },
        {
            "type": 0,
            "resource": 2,
            "orientation": 0,
            "coord": [
                5,
                0
            ]
        },
        {
            "type": 3,
            "coord": [
                5,
                1
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 0,
            "coord": [
                6,
                2
            ]
        },
        {
            "type": 3,
            "coord": [
                6,
                3
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 2,
            "coord": [
                6,
                4
            ]
        },
        {
            "type": 3,
            "coord": [
                5,
                5
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 3,
            "coord": [
                5,
                6
            ]
        },
        {
            "type": 3,
            "coord": [
                4,
                6
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 3,
            "coord": [
                3,
                6
            ]
        },
        {
            "type": 3,
            "coord": [
                2,
                6
            ]
        },
        {
            "type": 0,
            "resource": 3,
            "orientation": 5,
            "coord": [
                1,
                5
            ]
        },
        {
            "type": 3,
            "coord": [
                1,
                4
            ]
        },
        {
            "type": 0,
            "resource": 4,
            "orientation": 5,
            "coord": [
                0,
                3
            ]
        }
    ],
    "roads": [
        {
            "color": 4,
            "coord": [
                [
                    11,
                    4
                ],
                [
                    11,
                    3
                ]
            ]
        },
        {
            "color": 2,
            "coord": [
                [
                    7,
                    2
                ],
                [
                    6,
                    2
                ]
            ]
        },
        {
            "color": 2,
            "coord": [
                [
                    6,
                    5
                ],
                [
                    6,
                    4
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
                    10,
                    4
                ]
            ]
        },
        {
            "color": 4,
            "coord": [
                [
                    8,
                    4
                ],
                [
                    9,
                    4
                ]
            ]
        },
        {
            "color": 2,
            "coord": [
                [
                    7,
                    5
                ],
                [
                    6,
                    5
                ]
            ]
        },
        {
            "color": 2,
            "coord": [
                [
                    5,
                    5
                ],
                [
                    6,
                    5
                ]
            ]
        },
        {
            "color": 4,
            "coord": [
                [
                    9,
                    3
                ],
                [
                    9,
                    4
                ]
            ]
        },
        {
            "color": 4,
            "coord": [
                [
                    8,
                    3
                ],
                [
                    9,
                    3
                ]
            ]
        },
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
                    7,
                    4
                ],
                [
                    8,
                    4
                ]
            ]
        },
        {
            "color": 4,
            "coord": [
                [
                    10,
                    3
                ],
                [
                    9,
                    3
                ]
            ]
        },
        {
            "color": 4,
            "coord": [
                [
                    10,
                    3
                ],
                [
                    11,
                    3
                ]
            ]
        },
        {
            "color": 4,
            "coord": [
                [
                    10,
                    4
                ],
                [
                    11,
                    4
                ]
            ]
        },
        {
            "color": 4,
            "coord": [
                [
                    7,
                    3
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
                    7,
                    3
                ],
                [
                    8,
                    3
                ]
            ]
        },
        {
            "color": 4,
            "coord": [
                [
                    8,
                    5
                ],
                [
                    8,
                    4
                ]
            ]
        }
    ],
    "robber": [
        4,
        5
    ],
    "buildings": [
        {
            "color": 4,
            "coord": [
                11,
                4
            ],
            "type": 1
        },
        {
            "color": 2,
            "coord": [
                7,
                2
            ],
            "type": 0
        },
        {
            "color": 2,
            "coord": [
                6,
                5
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
        }
    ]
}
`

export const complexBlueRoad = JSON.parse(complexBlueRoadJSON) as Board

const moreComplexBlueRoadJSON = `
{
    "columnCount": 7,
    "rowCount": 7,
    "tiles": [
        {
            "type": 1,
            "resource": 0,
            "number": 11,
            "coord": [
                3,
                3
            ]
        },
        {
            "type": 2,
            "coord": [
                3,
                2
            ]
        },
        {
            "type": 1,
            "resource": 0,
            "number": 3,
            "coord": [
                4,
                2
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 6,
            "coord": [
                4,
                3
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 5,
            "coord": [
                4,
                4
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 4,
            "coord": [
                3,
                4
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 9,
            "coord": [
                2,
                3
            ]
        },
        {
            "type": 1,
            "resource": 0,
            "number": 10,
            "coord": [
                2,
                2
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 8,
            "coord": [
                2,
                1
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 4,
            "coord": [
                3,
                1
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 11,
            "coord": [
                4,
                1
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 12,
            "coord": [
                5,
                2
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 9,
            "coord": [
                5,
                3
            ]
        },
        {
            "type": 1,
            "resource": 4,
            "number": 10,
            "coord": [
                5,
                4
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 8,
            "coord": [
                4,
                5
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 3,
            "coord": [
                3,
                5
            ]
        },
        {
            "type": 1,
            "resource": 3,
            "number": 6,
            "coord": [
                2,
                5
            ]
        },
        {
            "type": 1,
            "resource": 1,
            "number": 2,
            "coord": [
                2,
                4
            ]
        },
        {
            "type": 1,
            "resource": 2,
            "number": 5,
            "coord": [
                1,
                3
            ]
        },
        {
            "type": 3,
            "coord": [
                1,
                2
            ]
        },
        {
            "type": 0,
            "resource": 0,
            "orientation": 5,
            "coord": [
                1,
                1
            ]
        },
        {
            "type": 3,
            "coord": [
                2,
                0
            ]
        },
        {
            "type": 0,
            "resource": 1,
            "orientation": 1,
            "coord": [
                3,
                0
            ]
        },
        {
            "type": 3,
            "coord": [
                4,
                0
            ]
        },
        {
            "type": 0,
            "resource": 2,
            "orientation": 0,
            "coord": [
                5,
                0
            ]
        },
        {
            "type": 3,
            "coord": [
                5,
                1
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 0,
            "coord": [
                6,
                2
            ]
        },
        {
            "type": 3,
            "coord": [
                6,
                3
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 2,
            "coord": [
                6,
                4
            ]
        },
        {
            "type": 3,
            "coord": [
                5,
                5
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 3,
            "coord": [
                5,
                6
            ]
        },
        {
            "type": 3,
            "coord": [
                4,
                6
            ]
        },
        {
            "type": 0,
            "resource": 11,
            "orientation": 3,
            "coord": [
                3,
                6
            ]
        },
        {
            "type": 3,
            "coord": [
                2,
                6
            ]
        },
        {
            "type": 0,
            "resource": 3,
            "orientation": 5,
            "coord": [
                1,
                5
            ]
        },
        {
            "type": 3,
            "coord": [
                1,
                4
            ]
        },
        {
            "type": 0,
            "resource": 4,
            "orientation": 5,
            "coord": [
                0,
                3
            ]
        }
    ],
    "roads": [
        {
            "color": 4,
            "coord": [
                [
                    11,
                    4
                ],
                [
                    11,
                    3
                ]
            ]
        },
        {
            "color": 2,
            "coord": [
                [
                    7,
                    2
                ],
                [
                    6,
                    2
                ]
            ]
        },
        {
            "color": 2,
            "coord": [
                [
                    6,
                    5
                ],
                [
                    6,
                    4
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
                    10,
                    4
                ]
            ]
        },
        {
            "color": 4,
            "coord": [
                [
                    8,
                    4
                ],
                [
                    9,
                    4
                ]
            ]
        },
        {
            "color": 2,
            "coord": [
                [
                    7,
                    5
                ],
                [
                    6,
                    5
                ]
            ]
        },
        {
            "color": 2,
            "coord": [
                [
                    5,
                    5
                ],
                [
                    6,
                    5
                ]
            ]
        },
        {
            "color": 4,
            "coord": [
                [
                    9,
                    3
                ],
                [
                    9,
                    4
                ]
            ]
        },
        {
            "color": 4,
            "coord": [
                [
                    8,
                    3
                ],
                [
                    9,
                    3
                ]
            ]
        },
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
                    7,
                    4
                ],
                [
                    8,
                    4
                ]
            ]
        },
        {
            "color": 4,
            "coord": [
                [
                    10,
                    3
                ],
                [
                    9,
                    3
                ]
            ]
        },
        {
            "color": 4,
            "coord": [
                [
                    10,
                    3
                ],
                [
                    11,
                    3
                ]
            ]
        },
        {
            "color": 4,
            "coord": [
                [
                    10,
                    4
                ],
                [
                    11,
                    4
                ]
            ]
        },
        {
            "color": 4,
            "coord": [
                [
                    7,
                    3
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
                    7,
                    3
                ],
                [
                    8,
                    3
                ]
            ]
        },
        {
            "color": 4,
            "coord": [
                [
                    8,
                    5
                ],
                [
                    8,
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
            "color": 4,
            "coord": [
                [
                    10,
                    5
                ],
                [
                    9,
                    5
                ]
            ]
        },
        {
            "color": 4,
            "coord": [
                [
                    10,
                    5
                ],
                [
                    10,
                    4
                ]
            ]
        }
    ],
    "robber": [
        3,
        5
    ],
    "buildings": [
        {
            "color": 4,
            "coord": [
                11,
                4
            ],
            "type": 1
        },
        {
            "color": 2,
            "coord": [
                7,
                2
            ],
            "type": 0
        },
        {
            "color": 2,
            "coord": [
                6,
                5
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
        }
    ]
}
`

export const moreComplexBlueRoad = JSON.parse(moreComplexBlueRoadJSON) as Board
