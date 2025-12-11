const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "changeme";

exports.verifyToken = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

exports.requireExco = (req, res, next) => {
  if (!req.user || req.user.role !== "exco") return res.status(403).json({ message: "Only EXCO can perform this action." });
  next();
};

exports.requireCoach = (req, res, next) => {
  if (!req.user || req.user.role !== "coach") return res.status(403).json({ message: "Only Coach can perform this action." });
  next();
};
