const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const app = express();

/* -------------------- CORS -------------------- */
app.use(cors({
  origin: "https://bulkmail-plum-alpha.vercel.app"
}));

/* -------------------- MIDDLEWARE -------------------- */
app.use(express.json());

/* -------------------- TEST ROUTE -------------------- */
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

/* -------------------- DB CONNECTION -------------------- */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to DB"))
  .catch((err) => console.log("❌ DB Error:", err));

/* -------------------- MODEL -------------------- */
const credential = mongoose.model("credential", {}, "bulkmail");

/* -------------------- SEND EMAIL API -------------------- */
app.post("/sendemail", async (req, res) => {
  try {
    const { msg, emailList } = req.body;

    // ✅ Validation
    if (!msg) {
      return res.status(400).send("Message is required");
    }

    if (!emailList || emailList.length === 0) {
      return res.status(400).send("Email list is empty");
    }

    // ✅ Get credentials from DB
    const data = await credential.find();

    if (!data || data.length === 0) {
      return res.status(500).send("No credentials found in DB");
    }

    const user = data[0].user;
    const pass = data[0].pass;

    // ✅ Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: user,
        pass: pass,
      },
    });

    // ✅ Send emails one by one
    for (let i = 0; i < emailList.length; i++) {
      await transporter.sendMail({
        from: user,
        to: emailList[i],
        subject: "Message from BulkMail App",
        text: msg,
      });

      console.log("📧 Sent to:", emailList[i]);
    }

    // ✅ Success response
    res.send(true);

  } catch (error) {
    console.log("❌ FULL ERROR:", error);
    res.status(500).send(false);
  }
});

/* -------------------- SERVER -------------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🚀 Server started on port " + PORT);
});