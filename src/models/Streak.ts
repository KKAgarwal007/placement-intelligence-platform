import mongoose, { Schema } from "mongoose";

const StreakSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true }, // Normalized to 00:00:00 of the day
    hasSubmitted: { type: Boolean, default: false },
    submissionsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound index to ensure 1 streak document per user per day
StreakSchema.index({ user: 1, date: 1 }, { unique: true });

export const Streak = mongoose.models.Streak || mongoose.model("Streak", StreakSchema);
