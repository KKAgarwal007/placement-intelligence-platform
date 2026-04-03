import mongoose, { Schema } from "mongoose";

const SubmissionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    problem: { type: Schema.Types.ObjectId, ref: "Problem", required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    status: {
      type: String,
      enum: ["Accepted", "Wrong Answer", "Time Limit Exceeded", "Runtime Error", "Compilation Error"],
      required: true,
    },
    executionTime: { type: Number },
    memory: { type: Number },
  },
  { timestamps: true }
);

export const Submission = mongoose.models.Submission || mongoose.model("Submission", SubmissionSchema);
