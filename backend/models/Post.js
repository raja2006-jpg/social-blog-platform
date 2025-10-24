const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      default: "",
    },
    fileType: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
