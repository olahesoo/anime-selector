import type {Config} from 'jest';

const config: Config = {
    testEnvironment: "node",
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest",
        "^.+\\.(js)$": "babel-jest",
    },
    transformIgnorePatterns: [],
};

export default config;