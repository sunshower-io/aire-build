module.exports = {
    testEnvironment: 'node',
    roots: [
        "<rootDir>/src"
    ],
    moduleFileExtensions: [
        "ts",
        "js",
        "json",
    ],
    moduleNameMapper: {
        "^gen/(.*)": "<rootDir>/dist/$1",
        "^aire/(.*)": "<rootDir>/src/main/$1",
        "^test/(.*)": "<rootDir>/src/test/$1",
    },
    modulePaths: [
        "<rootDir>/src",
        "<rootDir>/node_modules"
    ]
};