const express = require("express")
const app = express()

const createApp = require("./createApp")


const PORT = process.env.PORT || 3001;

const server = createApp(app)


server.listen(PORT, () => {
    console.log("Server is running on port..." + PORT );
})