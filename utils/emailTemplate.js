const createEmailTemplate = (name, content) => {
  const logoUrl = "https://ayurvedakumbh.in/assets/Kumbhlogo.png";
  const websiteUrl = "https://ayurvedakumbh.in";

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Ayurveda Kumbh 2025</title>

    <style>
      body {
        margin: 0;
        padding: 0;
        background: #f4f4f4;
        font-family: Arial, sans-serif;
      }
      .container {
        max-width: 600px;
        margin: auto;
        background: #ffffff;
        border-radius: 8px;
        overflow: hidden;
      }
      .header {
        background: #F9DD96;
        text-align: center;
        padding: 25px 15px;
        color: #fff;
      }
      .header img {
        width: 110px;
        margin-bottom: 10px;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
        font-weight: bold;
      }
      .section {
        padding: 25px;
        color: #333;
        font-size: 15px;
        line-height: 1.6;
      }
      .section-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 10px;
        color: #2f8f46;
      }
      .info-box {
        background: #f1f8f3;
        padding: 15px;
        border-left: 4px solid #4caf50;
        border-radius: 5px;
        margin-top: 15px;
      }
      .cta {
        text-align: center;
        margin: 25px 0;
      }
      .cta a {
        background: #ff6b00;
        color: #fff !important;
        padding: 12px 25px;
        text-decoration: none;
        font-size: 16px;
        border-radius: 5px;
        display: inline-block;
      }
      .footer {
        text-align: center;
        padding: 20px;
        background: #222;
        color: #bbb;
        font-size: 13px;
      }
      .footer a {
        color: #4caf50;
        text-decoration: none;
      }
    </style>

  </head>

  <body>
    <div class="container">

      <!-- Header -->
      <div class="header">
        <img src="${logoUrl}" alt="Ayurveda Kumbh" />
        <h1>Ayurveda Kumbh 2025</h1>
        <div>चलो कुंभ चले!</div>
      </div>

      <!-- Message -->
      <div class="section">
        <p>Dear <strong>${name}</strong>,</p>

        <p>${content}</p>

        <!-- Event Info -->
        <div class="info-box">
          <strong>Event Details:</strong><br />
          📅 <b>December 22–24, 2025</b><br />
          📍 Prem Nagar Ashram, Haridwar<br />
          🎯 Theme: Rasa Chikitsa & Cancer Management
        </div>

        <!-- CTA -->
        <div class="cta">
          <a href="${websiteUrl}/registration/delegate">Register Now</a>
        </div>

      </div>

      <!-- Footer -->
      <div class="footer">
        © 2025 Ayurveda Kumbh • 
        <a href="${websiteUrl}">Website</a> • 
        <a href="${websiteUrl}/contact">Contact</a>
        <br/><br/>
        Jivan Amrit Ayurveda, Gonda, India
      </div>

    </div>
  </body>
  </html>
  `;
};

module.exports = { createEmailTemplate };
