import multer from "multer";
import fs from "fs";
import path from "path";

// Utility function to ensure the directory exists or create it
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true }); // Create the directory if it doesn't exist
  }
};

// Utility function to create multer storage configuration
const createStorage = (destinationPath) => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      ensureDirectoryExists(destinationPath); // Ensure the directory exists
      cb(null, destinationPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname); // Use the original file extension
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  });
};

// Define storage configurations for different file types
const templateStorage = createStorage("public/templates");
const profileStorage = createStorage("public/profiles");
const modelStorage = createStorage("public/models");
const orderStorage = createStorage("public/orders");
const taskStorage = createStorage("public/tasks");

// Multer upload configurations
export const uploadTemplate = multer({ storage: templateStorage });
export const uploadProfile = multer({ storage: profileStorage });
export const uploadModel = multer({ storage: modelStorage });
export const uploadOrder = multer({ storage: orderStorage });
export const uploadTask = multer({ storage: taskStorage });
