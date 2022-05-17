const mongoose = require("mongoose");
require("dotenv").config({path:"backend/config/config.env"})

const DB=process.env.DB_URL;
console.log(DB);
const connectDatabase = () => {
  mongoose.connect(DB)
    .then((data) => {
      console.log(`Mongodb connected with server:${data.connection.host}`);
    });
};

module.exports = connectDatabase;