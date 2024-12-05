import { JestConfigWithTsJest } from 'ts-jest'

const config: JestConfigWithTsJest = {
    preset: 'ts-jest',

    testEnvironment: "node",
    transform: {
        "^.+.tsx?$": ["ts-jest", { useESM: true }],
    },
    resolver: 'jest-ts-webcompat-resolver',
    extensionsToTreatAsEsm: ['.ts'],
}

export default config
