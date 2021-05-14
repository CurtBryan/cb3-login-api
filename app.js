const express = require("express");
const app = express();
const port = 8080;

const { createLogin } = require("./controllers/login/createLogin");
const { login } = require("./controllers/login/login");

// * This checks your environment variable to see if you are running locally or not.
// ? If variables are not working, make sure to set an environment variable named ENVIRONMENT on your machine and set it to LOCAL (case sensitive)
if (process.env.ENVIRONMENT === "LOCAL") {
  require("dotenv").config();
}

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ? If having cors issues while calling from a front end app locally, uncomment the following two lines.
const cors = require("cors");
app.use(cors());

let client;

const { MongoClient } = require("mongodb");
const fs = require("fs");
let ca = [fs.readFileSync("./rds-combined-ca-bundle.pem")];

const mongoSetUp = async () => {
  const { DB_URL } = process.env;
  const buff = new Buffer(DB_URL, 'base64')
  const url = buff.toString("utf-8") 
  try {
    client = new MongoClient(url, {
      useUnifiedTopology: true,
      poolSize: 5
    });
    await client.connect();
    /*
    ? as of right now, there is an internal bug with warnings on the mongodb package that are not a worry
    ? it results with the warnings: 
    ? (node:11240) Warning: Accessing non-existent property 'MongoError' of module exports inside circular dependency
    ? (Use `node --trace-warnings ...` to show where the warning was created)
    ?
    ? Will keep an eye on the update that fizes this warning, but package is still safe to use.
    ? https://developer.mongodb.com/community/forums/t/warning-accessing-non-existent-property-mongoerror-of-module-exports-inside-circular-dependency/15411
    */
    app.set("dbClient", client);
    console.log("CONNECTED TO DB");
  } catch (err) {
    console.error(err);
    console.error("DB FAILURE - FAILED TO CONNECT");
  }
};

mongoSetUp();

const validate = require("express-jsonschema").validate;
const loginSchema = require("./Middleware/JSONSchemas/login.json")  
const createLoginSchema = require("./Middleware/JSONSchemas/createLogin")

app.get("/health-check", (req, res) => {
  console.log("ok");
  res.status(200).send("ok");
});

// * Login Endpoints
app.post("/api/v1/login", validate({body: loginSchema}), login);
app.post("/api/v1/login/create", validate({body: createLoginSchema}), createLogin);

// * this endpoint below is for catching errors, and will give us better errors on the console
app.use((req, res, next) => {
  res.status(404).send("404 Not Found");
});

app.use(function (err, req, res, next) {
  var responseData;

  if (err.name === "JsonSchemaValidation") {
    // Log the error however you please
    console.log(err.message);
    // logs "express-jsonschema: Invalid data found"

    // Set a bad request http response status or whatever you want
    res.status(400);

    // Format the response body however you want
    responseData = {
      statusText: "Bad Request",
      jsonSchemaValidation: true,
      validations: err.validations, // All of your validation information
    };

    // Take into account the content type if your app serves various content types
    if (req.xhr || req.get("Content-Type") === "application/json") {
      res.json(responseData);
    } else {
      // If this is an html request then you should probably have
      // some type of Bad Request html template to respond with
      res.render("badrequestTemplate", responseData);
    }
  } else {
    // pass error to next error middleware handler
    next(err);
  }
});

app.listen(port, () => {
  console.log(`cb3-login-api is running on port: ${port}`);
});
