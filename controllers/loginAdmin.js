const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const isValidUsername = await bcrypt.compare(
      username,
      process.env.ADMIN_USERNAME
    );
    const isValidPassword = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD
    );

    if (!isValidUsername || !isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      { username, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.json({ success: true, token, expiresIn: "24h" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};
module.exports = { loginAdmin };
