import multer from "multer";

function ensureJPGExtension(extension) {
  if (extension === "jpeg") {
    return "jpg";
  }
  return extension;
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/templates");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + "." + file.mimetype.split("/")[1]
    );
  },
});

const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/profiles");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + "." + file.mimetype.split("/")[1]
    );
  },
});

const modelStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/models");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + "." + file.mimetype.split("/")[1]
    );
  },
});

export const upload = multer({ storage: storage });
export const uploadProfile = multer({ storage: profileStorage });
export const uploadModel = multer({ storage: modelStorage });
