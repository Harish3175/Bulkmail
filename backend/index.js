const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const app = express();

app.use(cors({
  origin: "https://bulkmail-plum-alpha.vercel.app"
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running...");
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to DB"))
  .catch(err => console.log("DB Error:", err));

const credential = mongoose.model("credential", {}, "bulkmail");

app.post("/sendemail", async (req, res) => {
  try {
    const { msg, emailList } = req.body;

    const data = await credential.find();

    if (!data || data.length === 0) {
      return res.status(500).send("No credentials found");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: data[0].user,
        pass: data[0].pass,
      },
    });

    for (let i = 0; i < emailList.length; i++) {
      await transporter.sendMail({
        from: data[0].user,
        to: emailList[i],
        subject: "Msg from Bulkmail app",
        text: msg,
      });
    }

    res.send(true);

  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).send(false);
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});