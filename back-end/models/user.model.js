import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
<<<<<<< HEAD
      enum: ["student", "teacher", "admin"],
      required: true,
    },
=======
      enum: ["student", "teacher", "admin", "maintainer"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    slackUserId: {
      type: String,
      trim: true,
      default: "",
    },
    githubUsername: {
      type: String,
      trim: true,
      default: "",
    },
    linkedinUrl: {
      type: String,
      trim: true,
      default: "",
    },
    lastLoginFingerprints: {
      type: [String],
      default: [],
      select: false,
    },
>>>>>>> 844f25bde1b009521ef4ff56a4e8de3314c0f183
    age: {
      type: Number,
      required: function requireAge() {
        return this.role === "student";
      },
    },
    institution: {
      type: String,
      trim: true,
      default: "",
    },
    fieldOfStudy: {
      type: String,
      trim: true,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      default: "",
      maxlength: [600, "Bio cannot exceed 600 characters"],
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("fullName").get(function fullName() {
  return `${this.firstname} ${this.lastname}`.trim();
});

const User = mongoose.model("user", userSchema);

export default User;
