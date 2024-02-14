module.exports = {
    mongodbMemoryServerOptions: {
        autoStart: false,
        binary: {skipMD5: true},
        instance: {dbName: 'jest'},
    }
}