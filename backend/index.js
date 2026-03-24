// import packages
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

// middleware
app.use(cors({
  origin: "https://bulkmail-plum-alpha.vercel.app", // your frontend URL
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// send email route
app.post("/sendemail", async (req, res) => {
  try {
    const { msg, emailList } = req.body;

    // validation
    if (!msg || !emailList || emailList.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message or email list is missing"
      });
    }

    // transporter setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // send emails in parallel
    await Promise.all(
      emailList.map((email) =>
        transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Bulk Mail Message",
          text: msg,
        })
      )
    );

    // success response
    res.json({
      success: true,
      message: "Emails sent successfully"
    });

  } catch (error) {
    console.log("Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send emails"
    });
  }
});

// start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});