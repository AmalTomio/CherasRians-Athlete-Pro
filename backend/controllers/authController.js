// backend/controllers/authController.js
const User = require("../models/User");
const Session = require("../models/Session");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { encrypt, decrypt } = require("../utils/crypto");

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

// helper
const isValidNRIC = (val) => /^[0-9]{12}$/.test(val);
const VALID_ROLES = ["student", "coach", "exco"];
const VALID_SPORTS = ["football", "volleyball", "sepak_takraw", "badminton", "netball"];

// REGISTER
exports.registerUser = async (req, res) => {
  try {
    const {
      role,
      firstName,
      lastName,
      email,
      staffId,
      nric,
      sport,
      classGroup,
      year,
    } = req.body;

    if (!role || !firstName || !lastName || !email) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }

    if (role === "student") {
      if (!nric) return res.status(400).json({ message: "NRIC is required." });
      if (!isValidNRIC(nric))
        return res.status(400).json({ message: "NRIC must be 12 digits." });
      if (!classGroup) return res.status(400).json({ message: "Class required." });
      if (!year || year < 1 || year > 5)
        return res.status(400).json({ message: "Year must be between 1 and 5." });
    }

    if ((role === "coach" || role === "exco") && !staffId)
      return res.status(400).json({ message: "Staff ID required." });
    if (role === "coach" && !VALID_SPORTS.includes(sport))
      return res.status(400).json({ message: "Invalid sport." });

    // Check duplicates email
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists." });

    // Hash staffId (if provided)
    const hashedStaffId = staffId ? await bcrypt.hash(staffId, 10) : undefined;
    const encryptedNRIC = nric ? encrypt(nric) : undefined;

    const user = new User({
      role,
      firstName,
      lastName,
      email,
      staffId: hashedStaffId,
      nricEncrypted: encryptedNRIC,
      sport: role === "coach" ? sport : undefined,
      classGroup: role === "student" ? classGroup : undefined,
      year: role === "student" ? year : undefined,
    });

    await user.save();
    return res.status(201).json({ message: "Registration successful." });
  } catch (err) {
    console.error("REG ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { role, identifier } = req.body;
    if (!role || !identifier) return res.status(400).json({ message: "Missing fields." });
    if (!VALID_ROLES.includes(role)) return res.status(400).json({ message: "Invalid role." });

    if (role === "student" && !isValidNRIC(identifier))
      return res.status(400).json({ message: "Invalid NRIC format." });

    // Find active users by role
    const candidates = await User.find({ role, isActive: true });

    if (!candidates || candidates.length === 0) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    let matched = null;

    if (role === "student") {
      // compare identifier against decrypted NRIC of each
      for (const u of candidates) {
        if (!u.nricEncrypted) continue;
        const dec = decrypt(u.nricEncrypted);
        if (dec === identifier) {
          matched = u;
          break;
        }
      }
    } else {
      // coach/exco: compare staffId hash
      for (const u of candidates) {
        if (!u.staffId) continue;
        const match = await bcrypt.compare(identifier, u.staffId);
        if (match) {
          matched = u;
          break;
        }
      }
    }

    if (!matched) {
      return res.status(400).json({ message: role === "student" ? "Invalid NRIC." : "Invalid Staff ID." });
    }

    // create JWT
    const token = jwt.sign(
      {
        userId: matched._id,
        role: matched.role,
        firstName: matched.firstName,
        sport: matched.sport,
      },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "1d" }
    );

    // save session record (optional)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await Session?.create?.({ userId: matched._id, jwtToken: token, expiresAt });

    // respond with decrypted NRIC only if role allows? We'll not include nric in user object
    return res.json({
      message: "Login successful.",
      token,
      user: {
        userId: matched._id,
        role: matched.role,
        firstName: matched.firstName,
        lastName: matched.lastName,
        email: matched.email,
        sport: matched.sport,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
