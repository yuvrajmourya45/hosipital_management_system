import jwt from "jsonwebtoken";

const authAdmin = (req, res, next) => {
  const { atoken } = req.headers;
  if (!atoken) return res.status(401).json({ message: "Not authorized" });

  try {
    const decoded = jwt.verify(atoken, process.env.JWT_SECRET);
    if (
      decoded.email !== process.env.ADMIN_EMAIL ||
      decoded.password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({ message: "Not authorized" });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export default authAdmin;
