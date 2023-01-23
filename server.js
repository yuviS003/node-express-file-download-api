const path = require("path");
const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const fs = require('fs');
const fsPromises = require('fs').promises;

const PORT = 4500;

const app = express();

app.use(cors());
app.use(express.json());

app.post(
  "/uploadFile",
  fileUpload({ createParentPath: true }),
  async (req, res) => {
    console.log(req);
    const files = req.files;
    console.log(files);
    const uniqueFileNameArray = [];
    Object.keys(files).forEach((key) => {
      let uniqueCurrentFileName = `${uuidv4()}_${files[key].name}`;
      uniqueFileNameArray.push(uniqueCurrentFileName);
      const filePath = path.join(
        __dirname,
        "attachments",
        `${uniqueCurrentFileName}`
      );
      files[key].mv(filePath, (err) => {
        if (err) return res.status(500).json({ status: "error", message: err });
      });
    });
    return res.json({
      status: "success",
      message: uniqueFileNameArray,
    });
  }
);

app.get("/downloadFile/:fileName", async (req, res) => {
  try {
    const expectedFilePath = path.join(
      __dirname,
      "attachments",
      req.params.fileName
    );
    await fsPromises.access(expectedFilePath, fs.constants.F_OK);
    res.download(
      expectedFilePath,
      `${expectedFilePath.split("_").slice(1).join("_")}`
    );
  } catch (e) {
    console.log("error", e);
    res.status(404).json({ message: "File not found" });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
