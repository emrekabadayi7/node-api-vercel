const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
const port = 3001;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

console.log("bunu gorebiliyor musun?")

// MongoDB Connection
  mongoose.connect(process.env.MONGODB_URI);
  // MongoDB Connection

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB!");

  // Define a schema for the news collection
  const newsSchema = new mongoose.Schema({
    date: String,
    year: Number,
    title: String,
    desc1: String,
    img: String,
    imgText: String,
    desc2: String,
    img2: String,
    img2Text: String,
    desc3: String,
    img3: String,
    img3Text: String,
    desc4: String,
    img4: String,
    img4Text: String,
    img5: String,
    img5Text: String,
    img6: String,
    img6Text: String,
    img7: String,
    img7Text: String,
  });
  // Define a schema for the news collection

  // Create a model based on the schema
  const News = mongoose.model("newsDB", newsSchema, "news");

  console.log(News);
  // Example: Get all news documents
  app.get("/news", async (req, res) => {
    try {
      const result = await News.find({});
      res.send(result);
    } catch (err) {
      console.error("Error retrieving news:", err);
      res.status(500).send("Error retrieving news");
    }
  });

  app.get("/", (req, res) => {

    console.log("ananin ami kilicdaroglu");

  })

  // Code to insert a document

  /*
  
https://i.imgur.com/WnkbSHH.jpg
https://i.imgur.com/MKBDkqY.jpg
https://i.imgur.com/b9bTtRt.jpg
https://i.imgur.com/vsi87se.jpg

*/

  /* Code to insert a document
  const document = {
    
  };

  News.create(document)
    .then((result) => {
      console.log("Document inserted successfully:", result._id);
    })
    .catch((err) => {
      console.error("Error inserting document:", err);
    });

    */

  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
});
