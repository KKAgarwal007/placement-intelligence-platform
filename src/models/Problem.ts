import mongoose, { Schema } from "mongoose";

const TestCaseSchema = new Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
});

const ProblemSchema = new Schema(
  {
    title: { type: String, required: true, unique: true },
    titleSlug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    tags: [{ type: String }],
    testCases: [TestCaseSchema],
    hints: [{ type: String }],
    starterCode: {
      cpp: { type: String, default: "" },
      java: { type: String, default: "" },
      python: { type: String, default: "" },
      javascript: { type: String, default: "" },
    },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Problem = mongoose.models.Problem || mongoose.model("Problem", ProblemSchema);
