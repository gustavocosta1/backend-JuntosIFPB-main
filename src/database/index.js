
const mongoose = require("mongoose")
require('dotenv').config()

try {
     mongoose.connect(
        process.env.NODE_ENV==="test" ? global.__MONGO_URI__ : process.env.DATABASE,      
      { useNewUrlParser: true, useUnifiedTopology: true },
      () => console.log(" Mongoose is connected")
    );

  } catch (e) {
    console.log("could not connect");
  }
mongoose.Promise = global.Promise;

module.exports = mongoose;