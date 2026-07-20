const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../utils/utils/s3");

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: "public-read", // makes uploaded images publicly viewable
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, `harvesters/${uniqueName}`); // folder + filename inside the bucket
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit, adjust as needed
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const isValid = allowedTypes.test(file.mimetype);
    if (isValid) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (jpeg, jpg, png, webp)"));
    }
  },
});

module.exports = upload;