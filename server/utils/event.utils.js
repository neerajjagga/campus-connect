import User from "../models/user.model.js";
import { transporter } from "./../lib/nodemailer.js";
import dotenv from "dotenv";
dotenv.config();

export const sendEventEmail = async (event) => {
    
  const subscribedUsers = await User.find({ isSubscribed: true }).lean();

  if (subscribedUsers.length === 0) return;

  const emailsList = subscribedUsers.map((user) => user.email);

  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: emailsList,
    subject: `📢 New Event: ${event.title} | CGC Campus Connect`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Event Created</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 650px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #0061aa;
            padding: 15px;
            text-align: center;
            color: #fff;
        }
        .header img {
            max-height: 60px;
        }
        .event-image {
            width: 100%;
            max-height: 280px;
            object-fit: cover;
            display: block;
        }
        .content {
            padding: 25px;
            text-align: center;
        }
        .content h1 {
            color: #222;
            margin-bottom: 15px;
            font-size: 26px;
        }
        .content p {
            color: #555;
            font-size: 16px;
            line-height: 1.6;
        }
        .event-details {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            text-align: left;
            font-size: 15px;
        }
        .event-details p {
            margin: 6px 0;
        }
        .event-details strong {
            color: #222;
        }
        .btn {
            display: inline-block;
            padding: 14px 28px;
            background-color: #0061aa;
            color: #ffffff !important;
            font-size: 16px;
            font-weight: bold;
            border-radius: 6px;
            text-decoration: none;
            transition: background 0.3s ease;
        }
        .btn:hover {
            background: #0056b3;
        }
        .footer {
            background: #f9f9f9;
            padding: 20px;
            text-align: center;
            font-size: 13px;
            color: #888;
        }
        .footer img {
            max-width: 100px;
            margin-bottom: 10px;
        }
        .footer a {
            color: #007bff;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h2>New Event Alert 🎉</h2>
        </div>

        <!-- Event Image -->
        ${
          event.eventImageUrl &&
          `<img class="event-image" src="${event.eventImageUrl}" alt="Event Image">`
        }

        <!-- Content -->
        <div class="content">
            <h1>${event.title}</h1>
            <p>${
              event?.description || "Join us for this amazing event at CGC!"
            }</p>

            <div class="event-details">
                <p><strong>📍 Location:</strong> ${event.location}</p>
                <p><strong>📅 Date:</strong> ${event.date}</p>
                ${
                  event.category &&
                  `<p>
                      <strong>🗂 Category:</strong> ${event.category}
                    </p>`
                }
            </div>

            <a href="http://localhost:5173/events/${
              event._id
            }" class="btn">View Event Details</a>
        </div>

        <!-- Footer -->
        <div class="footer">
            <img src="https://res.cloudinary.com/djc0bpez7/image/upload/v1759152810/footer_logo_sdqw3e.png" alt="CGC Footer Logo">
            <p>© ${new Date().getFullYear()} CGC Campus Connect. All rights reserved.</p>
            <p>If you no longer want to receive event updates, 
                <a href="http://localhost:5173/">unsubscribe here</a>.
            </p>
        </div>
    </div>
</body>
</html>
`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Emails sent successfully!");
  } catch (error) {
    console.error("Error sending emails:", error);
  }
};

export const sendSubscribedEmail = async (email) => {
  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: email,
    subject: `Welcome to CGC Campus Connect 🎉`,
    text: `Hello,

Thank you for subscribing to CGC Campus Connect! 
You’re now part of our growing community. Expect the latest updates, events, and exclusive opportunities straight from campus.

Explore more: http://localhost:5173/

If you didn’t subscribe, please ignore this email.`,

    html: `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to CGC Campus Connect</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
          }
          .container {
              max-width: 650px;
              margin: 20px auto;
              background: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .header {
              display: flex;
              align-items: center;
              gap: 16px;
              background: #ffffff;
              padding: 20px;
              text-align: center;
          }
          .header img {
              max-width: 100px;
          }
          .hero img {
              width: 100%;
              display: block;
          }
          .content {
              padding: 30px 25px;
              text-align: center;
          }
          .content h1 {
              color: #222;
              margin-bottom: 15px;
              font-size: 26px;
          }
          .content p {
              color: #555;
              font-size: 16px;
              line-height: 1.6;
              margin: 0 0 20px;
          }
          .btn {
              display: inline-block;
              padding: 14px 28px;
              background: #0061aa;
              color: #ffffff !important;
              font-size: 16px;
              font-weight: bold;
              border-radius: 6px;
              text-decoration: none;
              transition: background 0.3s ease;
          }
          .btn:hover {
              background: #0056b3;
          }
          .footer {
              background: #f9f9f9;
              padding: 20px;
              text-align: center;
              font-size: 13px;
              color: #888;
          }
          .footer img {
              max-width: 120px;
              margin-bottom: 10px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <!-- Hero Image -->
          <div class="hero">
              <img src="https://res.cloudinary.com/djc0bpez7/image/upload/v1759152810/hero_ndsaha.png" alt="Campus Connect Banner">
          </div>

          <!-- Content -->
          <div class="content">
            <div class="header">
              <img src="https://res.cloudinary.com/djc0bpez7/image/upload/v1759152812/logo_xonnh3.png" alt="CGC Campus Connect Logo">
              <h1>Welcome to Campus Connect 🎉</h1>
            </div>
            <p>
                  Thank you for subscribing to <strong>CGC Campus Connect</strong>!  
                  You’re now part of a vibrant community where you’ll receive the latest updates,  
                  event announcements, and exclusive opportunities right from campus life.
            </p>
            <a href="http://localhost:5173/" class="btn">Explore Campus Connect</a>
          </div>

          <!-- Footer -->
          <div class="footer">
              <img src="https://res.cloudinary.com/djc0bpez7/image/upload/v1759152810/footer_logo_sdqw3e.png" alt="CGC Footer Logo">
              <p>© ${new Date().getFullYear()} CGC Campus Connect. All rights reserved.</p>
              <p>If you didn’t subscribe, please ignore this email.</p>
          </div>
      </div>
  </body>
  </html>
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Emails sent successfully!");
  } catch (error) {
    console.error("Error sending emails:", error);
  }
};
