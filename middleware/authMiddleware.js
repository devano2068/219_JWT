const jwt = require("jsonwebtoken");
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        message: "Authorization token tidak ditemukan.",
      });
    }
    const [scheme, token, ...extraParts] = authHeader.trim().split(/\s+/);
    if (
      scheme.toLowerCase() !== "bearer" ||
      !token ||
      extraParts.length > 0
    ) {
      return res.status(401).json({
        message: "Format token tidak valid.",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Token tidak valid atau telah kadaluarsa.",
    });
  }
};

module.exports = authMiddleware;