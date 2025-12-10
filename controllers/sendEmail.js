const fs = require("fs");
const csv = require("csv-parser");
require("dotenv").config();
const nodemailer = require("nodemailer");
const { createEmailTemplate } = require("../utils/emailTemplate.js");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Delay
const wait = (ms) => new Promise((res) => setTimeout(res, ms));

const sendEmail = async (req, res) => {
  const io = req.app.get("io");

  if (!req.file) {
    return res.status(400).json({ error: "CSV file is required" });
  }

  const emails = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => emails.push(row))
    .on("end", () => {
      fs.unlinkSync(req.file.path);

      res.json({
        message: "Bulk email started",
        total: emails.length,
      });

      processEmails(emails, io, req.body);
    });
};

async function processEmails(emails, io, body) {
  const subject = body.subject || "Ayurveda Kumbh 2025";
  const content = body.html || body.text || "";

  const batchSize = 10;
  let sent = 0;
  let failed = [];

  io.emit("bulkStart", { total: emails.length });

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (row) => {
        const html = createEmailTemplate(
          row.name || "",
          content.replace("{{name}}", row.name || "")
        );

        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: row.email,
            subject,
            html,
          });

          sent++;
          io.emit("emailSent", { email: row.email, sent });
        } catch (err) {
          failed.push(row.email);
          io.emit("emailFailed", { email: row.email, reason: err.message });
        }
      })
    );

    await wait(1000);
  }

  io.emit("bulkDone", {
    total: emails.length,
    sent,
    failed,
  });

  console.log("Bulk email done", sent, failed.length);
}

module.exports = { sendEmail };
