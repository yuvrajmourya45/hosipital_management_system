import User from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Appointment from "../models/AppointmentModel.js";


// Register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Please fill all fields" });

    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: "User already exists" });

    const hashPass = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashPass });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error while registering" });
  }
};

// Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1d" }
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error while logging in" });
  }
};

// Book Appointment (Protected)
export const bookAppointment = async (req, res) => {
  try {
    const { doctorName, date, time } = req.body;
    const userId = req.user.id;

    const newApp = new Appointment({ userId, doctorName, date, time });
    await newApp.save();

    res.status(201).json({ message: "Appointment booked successfully" });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ message: "Something went wrong while booking" });
  }
};
