import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    reputation: { type: Number, default: 0 },
    solvedProblems: [{ type: Schema.Types.ObjectId, ref: "Problem" }],
    avatarBase64: { type: String, default: "" },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
