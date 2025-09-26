import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL, // generated ethereal user
    pass: process.env.PASS, // generated ethereal password
  },
});

export const sendOtpEmail = async (to, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL, // sender address
    to, // list of receivers
    subject: "Reset your password", // Subject line
    html: `<p>Your OTP for password reset is: <b>${otp}</b>. It is valid for 5 minutes.</p>`,
  });
};
