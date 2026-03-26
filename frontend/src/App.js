import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const App = () => {

  const [msg, setmsg] = useState("");
  const [status, setstatus] = useState(false);
  const [emailList, setEmailList] = useState([]);

  function handlemsg(e) {
    setmsg(e.target.value);
  }

  function handlefile(event) {
    const file = event.target.files[0];

    const reader = new FileReader();

    reader.onload = function (e) {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: "A" });

      const emails = jsonData
        .map(item => item.A)
        .filter(email => email);

      setEmailList(emails);
    };

    reader.readAsBinaryString(file);
  }

  function send() {
    setstatus(true);

    axios.post(
      "https://bulkmail-backend-qan1.onrender.com/sendemail",
      { msg, emailList }
    )
    .then(res => {
      if (res.data === true) {
        alert("✅ Email sent successfully");
      } else {
        alert("❌ Failed");
      }
      setstatus(false);
    })
    .catch(err => {
      console.log(err);
      alert("❌ Server error");
      setstatus(false);
    });
  }

  return (
    <div>
      <div className="bg-blue-950 text-white text-center">
        <h1 className="text-2xl font-medium px-5 py-3">BulkMail</h1>
      </div>

      <div className="bg-blue-800 text-white text-center">
        <h1 className="px-5 py-3">
          Send multiple emails at once
        </h1>
      </div>

      <div className="bg-blue-400 flex flex-col items-center px-5 py-5">

        <textarea
          onChange={handlemsg}
          value={msg}
          className="w-[80%] h-32 border p-2"
          placeholder="Enter message..."
        />

        <input
          type="file"
          onChange={handlefile}
          className="mt-4"
        />

        <p>Total Emails: {emailList.length}</p>

        <button
          onClick={send}
          className="bg-blue-950 text-white px-4 py-2 mt-3"
        >
          {status ? "Sending..." : "Send"}
        </button>

      </div>
    </div>
  );
};

export default App;