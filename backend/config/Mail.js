import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()
const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user:process.env.EMAIL,
    pass:process.env.EMAIL_PASS,
  },
});

const sendMail=async (to,otp)=>{
await transporter.sendMail({
    from:`${process.env.EMAIL}`,
    to,
    subject: "Reset Your Password",
    html:`<body style="margin:0; padding:0; background-color:#f4f6f9; font-family:Arial, Helvetica, sans-serif;"><table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:30px auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 8px 25px rgba(0,0,0,0.08);"><tr><td align="center" style="background:linear-gradient(135deg,#6a11cb,#2575fc); padding:30px 20px;"><img src="https://i.ibb.co/Jjt8kYWM/favicon.png" alt="QalbConverfy Logo" width="80" style="margin-bottom:15px;border-radius:10px;" /><h1 style="color:#ffffff; margin:0; font-size:26px;letter-spacing:1px;">QalbConverfy</h1><p style="color:#e0e0e0; margin-top:5px; font-size:14px;">ZEAIPC (Zikr-e-Ameen Innovations & Programming Corporation)</p></td> </tr><tr><td style="padding:35px 30px;"><h2 style="margin-top:0; color:#333333;">Reset Your Password</h2><p style="color:#555555; font-size:15px; line-height:1.6;">We received a request to reset your password. Please use the OTP below to securely reset your account password.</p><div style="text-align:center; margin:30px 0;"><span style="display:inline-block; background:#f0f3ff; padding:18px 35px; font-size:28px; font-weight:bold; letter-spacing:6px; color:#2575fc; border-radius:8px;">${otp}</span></div><p style="color:#777777; font-size:14px; line-height:1.6;">This OTP is valid for <strong>5 minutes</strong>. If you did not request this password reset, please ignore this email.</p><hr style="border:none; border-top:1px solid #eeeeee; margin:30px 0;"><p style="font-size:13px; color:#888888; line-height:1.6;">For security reasons, do not share this OTP with anyone.</p></td></tr><tr><td style="background:#fafafa; padding:25px 30px; text-align:center;"><p style="margin:0; font-size:14px; font-weight:bold; color:#333;">ZEAIPC</p><p style="margin:5px 0; font-size:13px; color:#666;">Zikr-e-Ameen Innovations & Programming Corporation</p><p style="margin:5px 0; font-size:12px; color:#999;">Reoti-Ballia, Uttar Pradesh, 277209, India</p><p style="margin-top:15px; font-size:11px; color:#bbbbbb;">© 2026 QalbConverfy. All rights reserved.</p> </td></tr></table></body>`
})
}

export default sendMail