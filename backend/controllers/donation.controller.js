const Donation = require("../models/Donation.model");
const User = require("../models/User.model");

// @desc    Create a new donation
// @route   POST /api/donations
// @access  Private (Verified Donors only)
exports.createDonation = async (req, res) => {
  try {
    const {
      organizationName,
      contactPerson,
      email,
      phone,
      donationType,
      purpose,
      description,
      estimatedAmount,
      imageUrl,
    } = req.body;

    // Check if user is a verified donor
    const user = await User.findById(req.user.id);
    if (user.role !== "donor") {
      return res.status(403).json({
        success: false,
        message: "Only donors can submit donations",
      });
    }

    if (user.status !== "verified") {
      return res.status(403).json({
        success: false,
        message: "Your account must be verified to submit donations",
      });
    }

    const donation = await Donation.create({
      donorId: req.user.id,
      organizationName,
      contactPerson,
      email,
      phone,
      donationType,
      purpose,
      description,
      estimatedAmount,
      imageUrl,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Donation submitted successfully! Awaiting admin approval.",
      donation,
    });
  } catch (error) {
    console.error("Create donation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create donation",
      error: error.message,
    });
  }
};

// @desc    Get all verified donations
// @route   GET /api/donations
// @access  Public
exports.getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ status: "verified" })
      .populate("donorId", "name organizationName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    console.error("Get donations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch donations",
      error: error.message,
    });
  }
};

// @desc    Get single donation by ID
// @route   GET /api/donations/:id
// @access  Public
exports.getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id).populate(
      "donorId",
      "name organizationName email"
    );

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    // Only show verified donations to public
    if (
      donation.status !== "verified" &&
      donation.donorId._id.toString() !== req.user?.id
    ) {
      return res.status(403).json({
        success: false,
        message: "This donation is not yet verified",
      });
    }

    res.status(200).json({
      success: true,
      donation,
    });
  } catch (error) {
    console.error("Get donation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch donation",
      error: error.message,
    });
  }
};

// @desc    Get donations by donor (user's own donations)
// @route   GET /api/donations/my-donations
// @access  Private (Donors only)
exports.getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    console.error("Get my donations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your donations",
      error: error.message,
    });
  }
};

// @desc    Mark donation as completed
// @route   PUT /api/donations/complete/:id
// @access  Private (Donor owner only)
exports.completeDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    // Check if the donation belongs to the donor
    if (donation.donorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only complete your own donations",
      });
    }

    // Only verified donations can be marked as completed
    if (donation.status !== "verified") {
      return res.status(400).json({
        success: false,
        message: "Only verified donations can be marked as completed",
      });
    }

    donation.status = "completed";
    await donation.save();

    res.status(200).json({
      success: true,
      message: "Donation marked as completed successfully",
      donation,
    });
  } catch (error) {
    console.error("Complete donation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to complete donation",
      error: error.message,
    });
  }
};

// @desc    Get all pending donations (Admin)
// @route   GET /api/donations/admin/pending
// @access  Private (Admin only)
exports.getPendingDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ status: "pending" })
      .populate("donorId", "name organizationName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    console.error("Get pending donations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending donations",
      error: error.message,
    });
  }
};

// @desc    Get all donations for admin (all statuses)
// @route   GET /api/donations/admin/all
// @access  Private (Admin only)
exports.getAllDonationsAdmin = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate("donorId", "name organizationName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    console.error("Get all donations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch donations",
      error: error.message,
    });
  }
};

// @desc    Approve donation (Admin)
// @route   PUT /api/donations/approve/:id
// @access  Private (Admin only)
exports.approveDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    donation.status = "verified";
    await donation.save();

    res.status(200).json({
      success: true,
      message: "Donation approved successfully",
      donation,
    });
  } catch (error) {
    console.error("Approve donation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve donation",
      error: error.message,
    });
  }
};

// @desc    Reject donation (Admin)
// @route   PUT /api/donations/reject/:id
// @access  Private (Admin only)
exports.rejectDonation = async (req, res) => {
  try {
    const { reason } = req.body;
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    donation.status = "rejected";
    donation.rejectionReason = reason;
    await donation.save();

    res.status(200).json({
      success: true,
      message: "Donation rejected",
      donation,
    });
  } catch (error) {
    console.error("Reject donation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject donation",
      error: error.message,
    });
  }
};

// @desc    Delete donation (Admin)
// @route   DELETE /api/donations/:id
// @access  Private (Admin only)
exports.deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    await donation.deleteOne();

    res.status(200).json({
      success: true,
      message: "Donation deleted successfully",
    });
  } catch (error) {
    console.error("Delete donation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete donation",
      error: error.message,
    });
  }
};
