const express = require("express");
const router = express.Router();
const requestController = require("../controllers/request.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

// Admin routes (must be before :id route)
router.get(
  "/admin/all",
  protect,
  authorize("admin"),
  requestController.getAllRequestsAdmin
);
router.get(
  "/admin/pending",
  protect,
  authorize("admin"),
  requestController.getPendingRequests
);
router.put(
  "/approve/:id",
  protect,
  authorize("admin"),
  requestController.approveRequest
);
router.put(
  "/reject/:id",
  protect,
  authorize("admin"),
  requestController.rejectRequest
);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  requestController.deleteRequest
);

// Protected routes - Schools only
const upload = require("../middleware/upload.middleware");
router.post(
  "/",
  protect,
  authorize("school"),
  upload.single("principalLetter"),
  requestController.createRequest
);
router.get(
  "/my-requests",
  protect,
  authorize("school"),
  requestController.getMyRequests
);
router.put(
  "/complete/:id",
  protect,
  authorize("school"),
  requestController.completeRequest
);

// Public routes (must be after specific routes)
router.get("/", requestController.getAllRequests);
router.get("/:id", requestController.getRequestById);

module.exports = router;
