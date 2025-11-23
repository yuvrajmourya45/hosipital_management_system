import jwt from "jsonwebtoken";
import User from "../models/UserModel.js"; // Doctor user model

const authDoctor = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user in DB
    const user = await User.findById(decoded.id);
    if (!user || user.role !== "doctor") {
      return res.status(403).json({ success: false, message: "Doctor access only" });
    }

    req.user = user; // attach doctor info to request
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export default authDoctor;
