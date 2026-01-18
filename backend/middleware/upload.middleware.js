const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create type-based subdirectories
const uploadTypes = ["school", "donor", "volunteer", "donation"];
uploadTypes.forEach((type) => {
  const typeDir = path.join(uploadsDir, type);
  if (!fs.existsSync(typeDir)) {
    fs.mkdirSync(typeDir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine upload type from request path or body
    let uploadType = "general"; // default folder

    const url = req.originalUrl || req.url;

    if (
      url.includes("/school-profile") ||
      url.includes("/school/") ||
      url.includes("/requests")
    ) {
      uploadType = "school";
    } else if (url.includes("/donor-profile") || url.includes("/donor/")) {
      uploadType = "donor";
    } else if (
      url.includes("/volunteer-profile") ||
      url.includes("/volunteer/")
    ) {
      uploadType = "volunteer";
    } else if (url.includes("/donation")) {
      uploadType = "donation";
    }

    const destinationPath = path.join(uploadsDir, uploadType);

    // Ensure the specific type directory exists
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true });
    }

    cb(null, destinationPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, PDF, DOC, and DOCX files are allowed."
      )
    );
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
  fileFilter: fileFilter,
});

module.exports = upload;
