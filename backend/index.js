const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(cors());
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

/* -------------------- SEND EMAIL -------------------- */
app.post("/sendemail", async (req, res) => {
  try {
    const { msg, emailList } = req.body;

    // ✅ validation
    if (!msg || !emailList || emailList.length === 0) {
      return res.status(400).send(false);
    }

    const data = await credential.find();

    if (!data || data.length === 0) {
      console.log("❌ No credentials found in DB");
      return res.status(500).send(false);
    }

    const user = data[0].user;
    const pass = data[0].pass;

    console.log("USER:", user);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    for (let i = 0; i < emailList.length; i++) {
      await transporter.sendMail({
        from: user,
        to: emailList[i],
        subject: "Message from BulkMail App",
        text: msg,
      });

      console.log("📧 Sent to:", emailList[i]);
    }

    res.send(true);

  } catch (error) {
    console.log("❌ ERROR:", error);
    res.status(500).send(false);
  }
});

/* -------------------- SERVER -------------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🚀 Server started on port " + PORT);
});