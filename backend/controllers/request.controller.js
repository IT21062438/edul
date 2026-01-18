const Request = require("../models/Request.model");
const User = require("../models/User.model");

// @desc    Create a new request
// @route   POST /api/requests
// @access  Private (Verified Schools only)
exports.createRequest = async (req, res) => {
  try {
    const {
      schoolName,
      contactPerson,
      contactEmail,
      contactPhone,
      category,
      title,
      description,
      quantity,
      urgency,
      location,
    } = req.body;

    // Check if user is a verified school
    const user = await User.findById(req.user.id);
    if (user.role !== "school") {
      return res.status(403).json({
        success: false,
        message: "Only schools can submit requests",
      });
    }

    if (user.status !== "verified") {
      return res.status(403).json({
        success: false,
        message: "Your account must be verified to submit requests",
      });
    }

    // Handle principal letter file upload
    let principalLetterPath = null;
    if (req.file) {
      principalLetterPath = req.file.filename;
    }

    const request = await Request.create({
      schoolId: req.user.id,
      schoolName,
      contactPerson,
      contactEmail,
      contactPhone,
      category,
      title,
      description,
      quantity,
      urgency,
      location,
      principalLetter: principalLetterPath,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Request submitted successfully! Awaiting admin approval.",
      request,
    });
  } catch (error) {
    console.error("Create request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create request",
      error: error.message,
    });
  }
};

// @desc    Get all verified requests
// @route   GET /api/requests
// @access  Public
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find({ status: "verified" })
      .populate("schoolId", "name schoolName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get requests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch requests",
      error: error.message,
    });
  }
};

// @desc    Get single request by ID
// @route   GET /api/requests/:id
// @access  Public
exports.getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate(
      "schoolId",
      "name schoolName email"
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Only show verified requests to public
    if (
      request.status !== "verified" &&
      request.schoolId._id.toString() !== req.user?.id
    ) {
      return res.status(403).json({
        success: false,
        message: "This request is not yet verified",
      });
    }

    res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    console.error("Get request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch request",
      error: error.message,
    });
  }
};

// @desc    Get requests by school (user's own requests)
// @route   GET /api/requests/my-requests
// @access  Private (Schools only)
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ schoolId: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get my requests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your requests",
      error: error.message,
    });
  }
};

// @desc    Mark request as completed
// @route   PUT /api/requests/complete/:id
// @access  Private (School owner only)
exports.completeRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Check if the request belongs to the school
    if (request.schoolId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only complete your own requests",
      });
    }

    // Only verified requests can be marked as completed
    if (request.status !== "verified") {
      return res.status(400).json({
        success: false,
        message: "Only verified requests can be marked as completed",
      });
    }

    request.status = "completed";
    await request.save();

    res.status(200).json({
      success: true,
      message: "Request marked as completed successfully",
      request,
    });
  } catch (error) {
    console.error("Complete request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to complete request",
      error: error.message,
    });
  }
};

// @desc    Get all pending requests (Admin)
// @route   GET /api/requests/admin/pending
// @access  Private (Admin only)
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await Request.find({ status: "pending" })
      .populate("schoolId", "name schoolName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get pending requests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending requests",
      error: error.message,
    });
  }
};

// @desc    Get all requests for admin (all statuses)
// @route   GET /api/requests/admin/all
// @access  Private (Admin only)
exports.getAllRequestsAdmin = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("schoolId", "name schoolName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get all requests error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch requests",
      error: error.message,
    });
  }
};

// @desc    Approve request (Admin)
// @route   PUT /api/requests/approve/:id
// @access  Private (Admin only)
exports.approveRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    request.status = "verified";
    await request.save();

    res.status(200).json({
      success: true,
      message: "Request approved successfully",
      request,
    });
  } catch (error) {
    console.error("Approve request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve request",
      error: error.message,
    });
  }
};

// @desc    Reject request (Admin)
// @route   PUT /api/requests/reject/:id
// @access  Private (Admin only)
exports.rejectRequest = async (req, res) => {
  try {
    const { reason } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    request.status = "rejected";
    request.rejectionReason = reason;
    await request.save();

    res.status(200).json({
      success: true,
      message: "Request rejected",
      request,
    });
  } catch (error) {
    console.error("Reject request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject request",
      error: error.message,
    });
  }
};

// @desc    Delete request (Admin)
// @route   DELETE /api/requests/:id
// @access  Private (Admin only)
exports.deleteRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    await request.deleteOne();

    res.status(200).json({
      success: true,
      message: "Request deleted successfully",
    });
  } catch (error) {
    console.error("Delete request error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete request",
      error: error.message,
    });
  }
};
