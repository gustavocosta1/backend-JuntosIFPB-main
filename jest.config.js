module.exports = {
    roots: ['<rootDir>/src'],
    coverageDirectory: 'coverage',
    coverageProvider: 'babel',
    preset: '@shelf/jest-mongodb',
    maxWorkers: 1,
    testMatch: ['**/*.spec.js'], 
}