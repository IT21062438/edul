const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/auth.controller");
const { protect, authorize } = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

// Validation rules
const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .isIn(["school", "donor", "volunteer"])
    .withMessage("Invalid role"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Public routes
router.post(
  "/register/basic",
  registerValidation,
  authController.registerBasic
);
router.post("/login", loginValidation, authController.login);

// Get verified volunteers (public)
router.get("/volunteers", authController.getVerifiedVolunteers);

// School profile completion
router.post(
  "/register/school-profile",
  upload.fields([
    { name: "registrationProof", maxCount: 1 },
    { name: "endorsementLetter", maxCount: 1 },
  ]),
  authController.completeSchoolProfile
);

// Donor profile completion
router.post(
  "/register/donor-profile",
  upload.single("identityCertificate"),
  authController.completeDonorProfile
);

// Volunteer profile completion
router.post(
  "/register/volunteer-profile",
  upload.fields([
    { name: "nicFront", maxCount: 1 },
    { name: "nicBack", maxCount: 1 },
  ]),
  authController.completeVolunteerProfile
);

// Protected routes
router.get("/me", protect, authController.getMe);
router.put("/update-profile", protect, authController.updateProfile);
router.put("/change-password", protect, authController.changePassword);
router.post("/logout", protect, authController.logout);

// Admin routes
router.get(
  "/pending-users",
  protect,
  authorize("admin"),
  authController.getPendingUsers
);
router.get(
  "/all-users",
  protect,
  authorize("admin"),
  authController.getAllUsers
);
router.get("/profile", protect, authController.getUserProfile);
router.put(
  "/approve-user/:userId",
  protect,
  authorize("admin"),
  authController.approveUser
);
router.put(
  "/reject-user/:userId",
  protect,
  authorize("admin"),
  authController.rejectUser
);
router.delete(
  "/delete-user/:userId",
  protect,
  authorize("admin"),
  authController.deleteUser
);

module.exports = router;
