const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const path = require("path");
let cors=require("cors");


const errorMiddleware = require("./middleware/error");


// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({ path: "backend/config/config.env" });
  }

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload({usetempFiles:true}));

// Route Imports

const user = require("./routes/userRoute");
const service = require("./routes/serviceRoute");

app.use("/api/v1", user);
app.use("/api/v1", service);


  
if (process.env.NODE_ENV==='production')
 app.use(express.static(path.join(__dirname, "../frontend//build")));
 app.get("*", (req, res) => {
   res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
 });


// Middleware for Error
app.use(errorMiddleware);

module.exports=app