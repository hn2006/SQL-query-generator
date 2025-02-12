const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const fs = require("fs");
const generateSQL  = require("./sqlAgent");
const  parseSQLFile  = require("./parseSQL");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const UPLOAD_DIR = "./uploads";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename: (_, file, cb) => cb(null, "uploaded_schema.sql"),
});
const upload = multer({ storage });

app.get('/',async(req, res)=>{
  res.json({message : "welcome to sql query generator"});
})

app.post("/upload", upload.single("file"), (_, res) => {
  res.json({ message: "File uploaded successfully" });
});

app.get("/metadata", (_, res) => {
  try {
    const metadata = parseSQLFile("uploaded_schema.sql");
    // console.log(metadata)

    res.json({ "data":metadata });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error });
  }
});

app.post("/query", async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log(prompt)
    if (!prompt) return res.status(400).json({ error: "Missing query prompt." });

    const metadata = parseSQLFile("uploaded_schema.sql");
    const sqlQuery = await generateSQL(prompt, metadata);
    res.json({ query: sqlQuery });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});


app.listen(5000, () => console.log(`Server running on port 5000`));
