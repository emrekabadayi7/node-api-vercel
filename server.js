const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");


const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

console.log("bunu gorebiliyor musun?")
// MongoDB Connection
  mongoose.connect(process.env.MONGODB_URI);
  // MongoDB Connection
console.log(typeof process.env.MONGODB_URI);

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
    img8: String,
    img8Text: String,
    img9: String,
    img9Text: String,
    img10: String,
    img10Text: String,
    img11: String,
    img11Text: String,
    img12: String,
    img12Text: String,
    img13: String,
    img13Text: String,
    img14: String,
    img14Text: String,
    img15: String,
    img15Text: String,
    img16: String,
    img16Text: String,
    img17: String,
    img17Text: String,
    img18: String,
    img18Text: String,
    img19: String,
    img19Text: String,
    img20: String,
    img20Text: String,
    img21: String,
    img21Text: String,
    img22: String,
    img22Text: String,
    img23: String,
    img23Text: String,
    img24: String,
    img24Text: String,
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
