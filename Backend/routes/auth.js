import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { registerUser, loginUser, updateUserProfile } from "../controllers/userController.js";
import { loginAdmin } from "../controllers/adminController.js";

const router = express.Router();

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin-login", loginAdmin);
router.put("/profile/:id", upload.single("profilePic"), updateUserProfile);

export default router;
