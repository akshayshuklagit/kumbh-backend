const fs = require("fs");
const csv = require("csv-parser");
const io = require("../server.js");
require("dotenv").config();
const nodemailer = require("nodemailer");
const { createEmailTemplate } = require("../utils/emailTemplate.js");
const { authenticateToken } = require("../middleware/auth.js");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (req, res) => {
  const io = req.app.get("io");
  if (!req.file) {
    return res.status(400).json({ error: "CSV file is required" });
  }

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => results.push(row))
    .on("end", async () => {
      fs.unlinkSync(req.file.path);

      let success = [];
      let failed = [];
      let sent = 0;

      const subject = req.body.subject || "Ayurveda Kumbh2025";
      const bodyContent = req.body.html || req.body.text || "";

      io.emit("bulkStart", { total: results.length });

      for (const row of results) {
        const personalizedHtml = createEmailTemplate(
          row.name || "",
          bodyContent.replace("{{name}}", row.name || "")
        );

        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: row.email,
            subject,
            html: personalizedHtml,
          });
          success.push(row.email);
          sent++;
          io.emit("emailSent", { email: row.email, sent });

          await delay(1500);
        } catch (err) {
          io.emit("emailFailed", { email: row.email, reason: err.message });
          failed.push({ email: row.email, error: err.message });

          // --- Retry once after waiting ---
          await delay(2500);

          try {
            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: row.email,
              subject,
              html: personalizedHtml,
            });

            success.push(row.email);
            failed = failed.filter((f) => f.email !== row.email);
          } catch (retryErr) {}
        }
      }

      io.emit("bulkDone", {
        total: results.length,
        sent,
        failed,
      });

      return res.json({
        message: "Bulk email process completed",
        total: results.length,
        success: success,
        sent: success.length,
        failed: failed.length,
        failedList: failed,
      });
    });
};

module.exports = { sendEmail };
