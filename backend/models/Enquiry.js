import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  message: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  response: { type: String, default: "" },
  status: {
    type: String,
    enum: ["pending", "under_review", "in_progress", "resolved"],
    default: "pending"
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Enquiry", enquirySchema);
