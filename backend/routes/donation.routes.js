const express = require("express");
const router = express.Router();
const donationController = require("../controllers/donation.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

// Admin routes (must be before :id route)
router.get(
  "/admin/all",
  protect,
  authorize("admin"),
  donationController.getAllDonationsAdmin
);
router.get(
  "/admin/pending",
  protect,
  authorize("admin"),
  donationController.getPendingDonations
);
router.put(
  "/approve/:id",
  protect,
  authorize("admin"),
  donationController.approveDonation
);
router.put(
  "/reject/:id",
  protect,
  authorize("admin"),
  donationController.rejectDonation
);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  donationController.deleteDonation
);

// Protected routes - Donors only
router.post(
  "/",
  protect,
  authorize("donor"),
  donationController.createDonation
);
router.get(
  "/my-donations",
  protect,
  authorize("donor"),
  donationController.getMyDonations
);
router.put(
  "/complete/:id",
  protect,
  authorize("donor"),
  donationController.completeDonation
);

// Public routes (must be after specific routes)
router.get("/", donationController.getAllDonations);
router.get("/:id", donationController.getDonationById);

module.exports = router;
