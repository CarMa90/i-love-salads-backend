require("dotenv").config();
const nodemailer = require("nodemailer");

const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, BUSINESS_NAME } =
  process.env;

module.exports.sendVerificationEmail = async function sendVerificationEmail(
  email,
  otpCode,
) {
  const subjectText = `Verifica tu cuenta - ${BUSINESS_NAME}`;
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #f1f5f9; border-radius: 12px;">
      <h1 style="color: #0f172a; font-size: 22px;">¡Bienvenido a la familia ${BUSINESS_NAME}!</h1>
      <p style="color: #475569; font-size: 14px; line-height: 1.5;">
        Para activar tu cuenta de administrador y comenzar a configurar tu menú y tus sucursales, ingresa el siguiente código de verificación en la aplicación:
      </p>
      <div style="background-color: #f8fafc; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: #f97316; font-size: 28px; letter-spacing: 4px; margin: 0;">${otpCode}</h2>
      </div>
      <p style="color: #94a3b8; font-size: 12px;">Este código es de un solo uso y vencerá en un lapso de 10 minutos.</p>
    </div>
  `;

  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: true,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  transporter.sendMail({
    from: `"${BUSINESS_NAME}" <${EMAIL_USER}>`,
    to: email,
    subject: subjectText,
    html: htmlContent,
  });

  return true;
};
