import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: String,
  gender: String,
  profilePic: String,
  role: { type: String, enum: ["user", "doctor", "admin"], default: "user" },
});

const User = mongoose.model("User", userSchema);
export default User;