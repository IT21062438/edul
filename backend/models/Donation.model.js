const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organizationName: {
      type: String,
      required: true,
    },
    contactPerson: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    donationType: {
      type: String,
      required: true,
      enum: [
        "books",
        "uniforms",
        "digital-devices",
        "stationery",
        "furniture",
        "funds",
        "other",
      ],
    },
    purpose: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    estimatedAmount: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected", "completed"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Donation", donationSchema);
