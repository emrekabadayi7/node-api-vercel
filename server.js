const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

dotenv.config();

const app = express();
const port = 3001;

// Middleware
app.use(cors()); // Enable CORS for frontend communication
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' })); // Increase limit for image data

// Rate limiting to prevent abuse
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 10; // Max 10 requests per minute

const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }

  const record = requestCounts.get(ip);

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW;
    return next();
  }

  if (record.count >= MAX_REQUESTS) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }

  record.count++;
  next();
};

// Input validation and sanitization
const validateNewsData = (data) => {
  const errors = [];

  if (!data.date || typeof data.date !== 'string') {
    errors.push("Date is required and must be a string");
  }

  if (!data.year || typeof data.year !== 'number') {
    errors.push("Year is required and must be a number");
  }

  if (!data.title || typeof data.title !== 'string') {
    errors.push("Title is required and must be a string");
  }

  if (!data.desc1 || typeof data.desc1 !== 'string') {
    errors.push("Description 1 is required and must be a string");
  }

  // Validate image URLs if provided
  const urlPattern = /^https?:\/\/.+/i;
  for (let i = 1; i <= 24; i++) {
    const imgKey = i === 1 ? 'img' : `img${i}`;
    if (data[imgKey] && !urlPattern.test(data[imgKey])) {
      errors.push(`${imgKey} must be a valid URL`);
    }
  }

  return errors;
};

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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
  const News = mongoose.model("News", newsSchema, "news");

  // Create schema for pending news review
  const pendingNewsSchema = new mongoose.Schema({
    ...newsSchema.obj, // Inherit all fields from news schema
    submittedAt: { type: Date, default: Date.now },
    status: { type: String, default: 'pending' }
  });

  const PendingNews = mongoose.model("PendingNews", pendingNewsSchema, "newsPendingReview");

  // ===== PENDING REVIEW ENDPOINTS =====

  // GET: Fetch all pending news for review
  app.get("/newsPendingReview", async (req, res) => {
    try {
      const result = await PendingNews.find({});
      res.json(result);
    } catch (err) {
      console.error("Error retrieving pending news:", err);
      res.status(500).json({ error: "Error retrieving pending news" });
    }
  });

  // POST: Submit news for review (instead of direct publish)
  app.post("/newsPendingReview", rateLimiter, async (req, res) => {
    try {
      // Validate input data
      const validationErrors = validateNewsData(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({ errors: validationErrors });
      }

      // Create new pending news document
      const pendingNewsData = new PendingNews({
        ...req.body,
        submittedAt: new Date(),
        status: 'pending'
      });
      const savedPendingNews = await pendingNewsData.save();

      console.log("News submitted for review:", savedPendingNews._id);
      res.status(201).json({ message: "News submitted for review", data: savedPendingNews });
    } catch (err) {
      console.error("Error submitting news for review:", err);
      res.status(500).json({ error: "Error submitting news for review" });
    }
  });

  // POST: Approve pending news (moves to main news collection)
  app.post("/newsPendingReview/:id/approve", rateLimiter, async (req, res) => {
    try {
      const { id } = req.params;

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid news ID" });
      }

      // Find pending news
      const pendingNews = await PendingNews.findById(id);

      if (!pendingNews) {
        return res.status(404).json({ error: "Pending news not found" });
      }

      // Remove pending-specific fields
      const newsToPublish = pendingNews.toObject();
      delete newsToPublish._id;
      delete newsToPublish.submittedAt;
      delete newsToPublish.status;
      delete newsToPublish.__v;

      // Add to main news collection
      newsToPublish.createdFromAdmin = true;
      newsToPublish.approvedAt = new Date();

      const publishedNews = new News(newsToPublish);
      await publishedNews.save();

      // Remove from pending
      await PendingNews.findByIdAndDelete(id);

      console.log("News approved and published:", publishedNews._id);
      res.json({ message: "News approved and published successfully", data: publishedNews });
    } catch (err) {
      console.error("Error approving news:", err);
      res.status(500).json({ error: "Error approving news" });
    }
  });

  // DELETE: Reject pending news
  app.delete("/newsPendingReview/:id", rateLimiter, async (req, res) => {
    try {
      const { id } = req.params;

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid news ID" });
      }

      // Delete the pending news
      const deletedPending = await PendingNews.findByIdAndDelete(id);

      if (!deletedPending) {
        return res.status(404).json({ error: "Pending news not found" });
      }

      console.log("Pending news rejected and deleted:", id);
      res.json({ message: "Pending news rejected and deleted", data: deletedPending });
    } catch (err) {
      console.error("Error rejecting pending news:", err);
      res.status(500).json({ error: "Error rejecting pending news" });
    }
  });

  // ===== END PENDING REVIEW ENDPOINTS =====

  // GET: Fetch all news documents
  app.get("/news", async (req, res) => {
    try {
      const result = await News.find({});
      res.json(result);
    } catch (err) {
      console.error("Error retrieving news:", err);
      res.status(500).json({ error: "Error retrieving news" });
    }
  });

  // POST: Direct creation DISABLED - use pending review workflow instead
  app.post("/news", (req, res) => {
    res.status(403).json({
      error: "Direct news creation is disabled. Use /newsPendingReview endpoint instead.",
      message: "All news must go through the review process before publication."
    });
  });

  // PUT: Update existing news article by ID
  app.put("/news/:id", rateLimiter, async (req, res) => {
    try {
      const { id } = req.params;

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid news ID" });
      }

      // Validate input data
      const validationErrors = validateNewsData(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({ errors: validationErrors });
      }

      // Update the news document
      const updatedNews = await News.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!updatedNews) {
        return res.status(404).json({ error: "News article not found" });
      }

      console.log("News article updated:", id);
      res.json({ message: "News updated successfully", data: updatedNews });
    } catch (err) {
      console.error("Error updating news:", err);
      res.status(500).json({ error: "Error updating news article" });
    }
  });

  // DELETE: Deletion DISABLED - use MongoDB Compass for manual deletion
  app.delete("/news/:id", (req, res) => {
    res.status(403).json({
      error: "Direct deletion is disabled for safety.",
      message: "Use MongoDB Compass to manually delete news articles."
    });
  });

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "Server is running" });
  });

  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
});
