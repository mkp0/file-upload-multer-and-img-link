const express = require("express");
const app = express();
const multer = require("multer");
const path = require("path");
const schedule = require("node-schedule");
const fs = require("fs");

//multer image
const storage = multer.diskStorage({
  destination: "public/upload",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

//init upload
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 5 }, //5mb limit
  fileFilter: function (req, file, cb) {
    filterimg(file, cb);
  },
}).single("myimg");

//filter part
function filterimg(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("You can upload Images Only!");
  }
}

const PORT = process.env.PORT || 3004;
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) res.render("index", { msg: err });
    else {
      console.log(req.file.path);
      let pathNameOfPic =
        "https://file-uploder-ausm.herokuapp.com" + req.file.path.substr(6);
      console.log(pathNameOfPic);
      res.json({ linkOfImage: pathNameOfPic });
    }
  });
});

const directory = "public/upload";

schedule.scheduleJob({ hour: 00, minute: 00 }, () => {
  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(directory, file), (err) => {
        if (err) throw err;
      });
    }
  });
});

app.listen(PORT, () => {
  console.log("https://file-uploder-ausm.herokuapp.com/");
});
