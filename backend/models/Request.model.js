const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    schoolName: {
      type: String,
      required: true,
    },
    contactPerson: {
      type: String,
      required: true,
    },
    contactEmail: {
      type: String,
      required: true,
    },
    contactPhone: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "books",
        "uniforms",
        "digital-devices",
        "stationery",
        "furniture",
        "other",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    quantity: {
      type: String,
      required: true,
    },
    urgency: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    principalLetter: {
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

module.exports = mongoose.model("Request", requestSchema);
