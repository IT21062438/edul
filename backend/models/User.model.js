const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // Basic account info
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ["admin", "school", "donor", "volunteer"],
      default: "donor",
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: null,
    },

    // School-specific fields
    schoolName: String,
    schoolId: String,
    schoolType: {
      type: String,
      enum: ["National", "Provincial", "Private", "International", "Other"],
    },
    province: String,
    district: String,
    address: String,
    schoolContact: String,
    schoolEmail: String,
    principalName: String,
    principalContact: String,
    website: String,
    registrationProof: String, // file path
    verifyingAuthority: String,
    authorityContact: String,
    endorsementLetter: String, // file path

    // Donor-specific fields
    organizationName: String,
    registrationNumber: String,
    organizationType: {
      type: String,
      enum: [
        "NGO",
        "Company",
        "Foundation",
        "Individual",
        "Religious Group",
        "Alumni Association",
        "Other",
      ],
    },
    contactNumber: String,
    identityCertificate: String, // file path
    representativeName: String,
    representativePosition: String,
    representativeEmail: String,
    representativePhone: String,
    referencePartner: String,

    // Volunteer-specific fields
    fullName: String,
    nicFront: String, // file path
    nicBack: String, // file path
    vehicleType: {
      type: String,
      enum: ["none", "car", "van", "truck", "bike"],
    },
    availability: String,
    skills: String,

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// Method to get user object without sensitive data
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model("User", userSchema);
