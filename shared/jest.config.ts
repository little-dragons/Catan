import type { Config } from '@jest/types';

export default <Config.InitialOptions>{
    verbose: true,
    // this is explictly written out to allow uppercase Test.ts file names
    testMatch: [
        "**/__tests__/**/*.[jt]s?(x)",
        "**/?(*.)+(spec|test|Test).[tj]s?(x)"
    ],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
};