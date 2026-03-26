const express = require("express")
const cors = require("cors")
const app = express()

app.use(cors({
  origin: "https://bulkmail-plum-alpha.vercel.app",
  methods: ["GET", "POST"],
  credentials: true
}));
app.options('*',cors())
app.use(express.json())
const nodemailer = require("nodemailer");
const { default: mongoose } = require("mongoose")

app.get("/", function (req, res) {
    res.send("Backend is running...")
})

mongoose.connect(process.env.MONGO_URI).then(function(){
    console.log("Connected to DB")
}).catch(function(){console.log("Failed to connect")})

const credential = mongoose.model("credential",{},"bulkmail")


app.post("/sendemail", function (req, res) {

    const msg = req.body.msg;
    var emailList = req.body.emailList;

    credential.find().then(function(data){
    const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: data[0].toJSON().user,
        pass: data[0].toJSON().pass,
    },
});

  new Promise(async function(resolve,reject){
        
        try{
        for (var i = 0; i < emailList.length; i++)
            {
            await transporter.sendMail(
                {
                    from: "harishofficial317@gmail.com",
                    to: emailList[i],
                    subject: "Msg from Bulkmail app",
                    text: msg
                }
            )
            //console.log("Email sent to:"+emailList[i])
    }
    resolve("success")
    }
    catch(error)
    {
 
        reject("Failed")
    }

    }).then(function(){
        res.send(true)
    }).catch(function(){
        res.send(false)
    })


}).catch(function(error){
    console.log(error)
})

  

})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>{
    console.log("Server started on port" + PORT)
})
