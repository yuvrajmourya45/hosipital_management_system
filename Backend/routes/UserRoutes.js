import express from "express";
import multer from "multer";
import User from "../models/UserModel.js";

const router = express.Router();

// ✅ multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profilePics"); // folder name
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ✅ Update profile route
router.put("/profile/:id", upload.single("profilePic"), async (req, res) => {
  try {
    const { name, phone, gender } = req.body;
    const updateData = { name, phone, gender };


    if (req.file) {
      updateData.profilePic = `/uploads/profilePics/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    res.json({ message: "✅ Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "❌ Error updating profile" });
  }
});

export default router;
