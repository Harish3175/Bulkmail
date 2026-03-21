const express = require("express")
const cors = require("cors")
const app = express()
const nodemailer = require("nodemailer")
app.use(cors())
const mongoose = require('mongoose')


app.use(express.json())
//install nodemailer

mongoose.connect(process.env.MONGO_URI).then(function () {
    console.log("connected to db")
}).catch(function () {
    console.log("Failed to connect")
})

const credential = mongoose.model("credential", {}, "bulkmail")

app.post("https://bulkmail-backend-qan1.onrender.com/sendemail", function (req, res) {

    var msg = req.body.msg
    var emailList = req.body.emailList


    credential.find().then(function (data) {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: data[0].toJSON().user,
            pass: data[0].toJSON().pass,
        },
    });

    new Promise(async function (resolve, reject) {
        try {
            for (var i = 0; i < emailList.length; i++) {
                await transporter.sendMail(
                    {
                        from: "harishofficial317@gmail.com",
                        to: emailList[i],
                        subject: "message from bulkmail app",
                        text: msg
                    },
                )
                console.log("Email sent to:" + emailList[i])
            }

            resolve("Success")

        } catch (error) {
            reject("Failed")
        }

    }).then(function () {
        res.send(true)
    }).catch(function () {
        res.send(false)
    })

    console.log(data[0].toJSON())
})
    .catch(function (error) {
        console.log(error)
    })


})

app.get("/",(req,res) => {
    res.send("Backend is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>{
    console.log("Server started on port"+PORT)
})
