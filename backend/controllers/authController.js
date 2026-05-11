//controllers/authController.js
const User = require("../models/User");
const Session = require("../models/Session");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { sendMail } = require("../utils/mailer");
const { encrypt, decrypt } = require("../utils/crypto");

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

const isValidNRIC = (val) => /^[0-9]{12}$/.test(val);
const VALID_ROLES = ["student", "coach", "exco"];
const VALID_SPORTS = [
  "football",
  "volleyball",
  "sepak_takraw",
  "badminton",
  "netball",
];

const isStrongPassword = (password) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
    password,
  );
};

const getCategoryByYear = (year) => {
  const y = Number(year);

  if (y >= 1 && y <= 3) return "U-15";
  if (y >= 4 && y <= 5) return "U-18";

  return "";
};
exports.registerUser = async (req, res) => {
  try {
    const {
      role,
      firstName,
      lastName,
      email,
      staffId,
      nric,
      password,
      confirmPassword,
      sport,
      classGroup,
      year,
    } = req.body;

    if (!role || !firstName || !lastName || !email)
      return res.status(400).json({ message: "Missing required fields." });

    if (!VALID_ROLES.includes(role))
      return res.status(400).json({ message: "Invalid role." });

    if (!password || !confirmPassword) {
      return res.status(400).json({
        message: "Password and confirm password are required.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match.",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.",
      });
    }

    if (role === "student") {
      if (!nric) return res.status(400).json({ message: "NRIC is required." });
      if (!isValidNRIC(nric))
        return res.status(400).json({ message: "NRIC must be 12 digits." });

      if (!classGroup)
        return res.status(400).json({ message: "Class required." });
      if (!year || year < 1 || year > 5)
        return res
          .status(400)
          .json({ message: "Year must be between 1 and 5." });
    }

    if ((role === "coach" || role === "exco") && !staffId)
      return res.status(400).json({ message: "Staff ID required." });

    if (role === "coach" && !VALID_SPORTS.includes(sport))
      return res.status(400).json({ message: "Invalid sport." });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already exists." });

    // const hashedStaffId = staffId ? await bcrypt.hash(staffId, 10) : undefined;
    const passwordHash = await bcrypt.hash(password, 12);
    const encryptedNRIC = nric ? encrypt(nric) : undefined;

    const user = new User({
      role,
      firstName,
      lastName,
      email,
      staffId:
        role === "coach" || role === "exco"
          ? staffId.trim().toUpperCase()
          : undefined,
      nricEncrypted: encryptedNRIC,
      passwordHash,
      sport: role === "coach" ? sport : undefined,
      classGroup: role === "student" ? classGroup : undefined,
      year: role === "student" ? year : undefined,
      category: role === "student" ? getCategoryByYear(year) : undefined,
    });

    await user.save();

    return res.status(201).json({ message: "Registration successful." });
  } catch (err) {
    console.error("REG ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { role, identifier, password } = req.body;

    /* ================= REQUIRED FIELDS ================= */
    if (!role || !identifier || !password) {
      return res.status(400).json({
        message: "Missing fields.",
      });
    }

    /* ================= ROLE VALIDATION ================= */
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({
        message: "Invalid role.",
      });
    }

    /* ================= STUDENT NRIC VALIDATION ================= */
    if (role === "student" && !isValidNRIC(identifier)) {
      return res.status(400).json({
        message: "Invalid NRIC format.",
      });
    }

    let matched = null;

    /* =====================================================
       STUDENT LOGIN (NRIC + PASSWORD)
    ====================================================== */
    if (role === "student") {
      const students = await User.find({
        role,
        isActive: true,
      }).select("+passwordHash");

      for (const u of students) {
        if (!u.nricEncrypted) continue;

        if (decrypt(u.nricEncrypted) === identifier) {
          matched = u;
          break;
        }
      }
    } else {
      /* =====================================================
       COACH / EXCO LOGIN (STAFFID + PASSWORD)
    ====================================================== */
      matched = await User.findOne({
        role,
        staffId: identifier.trim().toUpperCase(),
        isActive: true,
      }).select("+passwordHash");
    }

    /* ================= INVALID USER ================= */
    if (!matched) {
      return res.status(400).json({
        message:
          role === "student"
            ? "Invalid NRIC or password."
            : "Invalid Staff ID or password.",
      });
    }

    /* ================= ACCOUNT LOCK CHECK ================= */
    if (matched.lockUntil && matched.lockUntil > Date.now()) {
      return res.status(423).json({
        message:
          "Account temporarily locked due to multiple failed login attempts. Please try again in 1 minute.",
      });
    }

    /* ================= PASSWORD VERIFY ================= */
    const isPasswordValid = await bcrypt.compare(
      password,
      matched.passwordHash,
    );

    /* ================= INVALID PASSWORD ================= */
    if (!isPasswordValid) {
      matched.failedLoginAttempts += 1;

      if (matched.failedLoginAttempts >= 5) {
        matched.lockUntil = new Date(Date.now() + 60 * 1000);
        matched.failedLoginAttempts = 0;
      }

      await matched.save();

      return res.status(400).json({
        message:
          role === "student"
            ? "Invalid NRIC or password."
            : "Invalid Staff ID or password.",
      });
    }

    /* ================= RESET FAILED ATTEMPTS ================= */
    matched.failedLoginAttempts = 0;
    matched.lockUntil = null;

    await matched.save();

    /* ================= JWT TOKEN ================= */
    const token = jwt.sign(
      {
        userId: matched._id,
        _id: matched._id,
        role: matched.role,
        firstName: matched.firstName,
        lastName: matched.lastName,
        sport: matched.sport,
      },
      JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES || "1d",
      },
    );

    /* ================= SESSION TRACKING ================= */
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await Session?.create?.({
      userId: matched._id,
      jwtToken: token,
      expiresAt,
    });

    /* ================= RESPONSE ================= */
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

    return res.status(500).json({
      message: "Server error",
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      isActive: true,
    }).select("+resetPasswordToken");

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email.",
      });
    }

    /* ================= GENERATE TOKEN ================= */
    const resetToken = crypto.randomBytes(32).toString("hex");

    /* ================= HASH TOKEN ================= */
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    /* ================= SAVE TOKEN ================= */
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    /* ================= RESET URL ================= */
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    /* ================= EMAIL TEMPLATE ================= */
    const html = `
      <div style="font-family: Arial, sans-serif;">
        <h2>Password Reset Request</h2>

        <p>Hello ${user.firstName},</p>

        <p>
          You requested to reset your password for CherasRians Athletes Pro.
        </p>

        <p>
          Click the button below to reset your password:
        </p>

        <a
          href="${resetURL}"
          style="
            display:inline-block;
            padding:12px 20px;
            background:#2563eb;
            color:white;
            text-decoration:none;
            border-radius:6px;
          "
        >
          Reset Password
        </a>

        <p style="margin-top:20px;">
          This link will expire in 15 minutes.
        </p>

        <p>
          If you did not request this reset, please ignore this email.
        </p>
      </div>
    `;

    /* ================= SEND EMAIL ================= */
    await sendMail(
      user.email,
      "CherasRians Athletes Pro - Password Reset",
      html,
    );

    return res.json({
      message: "Password reset email sent successfully.",
    });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    /* ================= VALIDATION ================= */
    if (!password || !confirmPassword) {
      return res.status(400).json({
        message: "Password and confirm password are required.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match.",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.",
      });
    }

    /* ================= HASH TOKEN ================= */
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    /* ================= FIND USER ================= */
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+passwordHash +resetPasswordToken");

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token.",
      });
    }

    /* ================= UPDATE PASSWORD ================= */
    user.passwordHash = await bcrypt.hash(password, 12);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.passwordChangedAt = new Date();

    await user.save();

    return res.json({
      message: "Password reset successful.",
    });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const id = req.user.userId || req.user._id;

    const user = await User.findById(id).select("-nricEncrypted -staffId -__v");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json(user);
  } catch (err) {
    console.error("AUTH ME ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
